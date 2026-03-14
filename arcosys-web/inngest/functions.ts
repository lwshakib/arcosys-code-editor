import prisma from "@/lib/prisma";
import { inngest } from "./client";
import {
  createGithubWebhook,
  getPullRequestDiff,
  getRepoFileContents,
  indexCodebase,
  postPullRequestComment,
  createPullRequestReview,
  retrieveContext,
} from "./helpers";
import { generateText, generateObject, PR_REVIEW_PROMPT, PR_SUMMARY_PROMPT } from "@/llm";
import { z } from "zod";

/**
 * Inngest function that indexes a GitHub repository when connected.
 * Triggered by the "repository.connected" event.
 *
 * Steps:
 * 1. Fetches the user's GitHub access token
 * 2. Retrieves all file contents from the repository
 * 3. Indexes the codebase in Pinecone for semantic search
 * 4. Creates a GitHub webhook for PR reviews
 *
 * @returns Object with success status, number of indexed files, and repo ID
 */
export const indexRepo = inngest.createFunction(
  { id: "index-repo" },
  { event: "repository.connected" },
  async ({ event, step }) => {
    const { repository, owner, userId } = event.data;

    const { files, token } = await step.run("fetch-and-index", async () => {
      const account = await prisma.account.findFirst({
        where: {
          userId,
          providerId: "github",
        },
      });

      if (!account?.accessToken) {
        throw new Error("No access token found");
      }

      const fileContents = await getRepoFileContents(
        account.accessToken,
        owner,
        repository
      );

      return { files: fileContents, token: account.accessToken };
    });

    await step.run("index-codebase", async () => {
      await indexCodebase(`${owner}/${repository}`, files);
    });

    await step.run("create-webhook", async () => {
      await createGithubWebhook(token, owner, repository);
    });

    return {
      success: true,
      indexedFiles: files.length,
      repoId: `${owner}/${repository}`,
    };
  }
);

export const generateReview = inngest.createFunction(
  { id: "generate-review", concurrency: 5 },
  { event: "pr.review.requested" },
  async ({ event, step }) => {
    const { repository, owner, userId, prNumber } = event.data;
    const { diff, title, description, token } = await step.run(
      "fetch-pr-data",
      async () => {
        const account = await prisma.account.findFirst({
          where: {
            userId,
            providerId: "github",
          },
        });

        if (!account?.accessToken) {
          throw new Error("No access token found");
        }

        const data = await getPullRequestDiff(
          account.accessToken,
          owner,
          repository,
          prNumber
        );

        return { ...data, token: account.accessToken };
      }
    );

    const context = await step.run("retrieve-context", async () => {
      const query = `${title}\n${description}`;

      return retrieveContext(query, `${owner}/${repository}`);
    });

    const userPrompt = `
### PR Title
${title}

### PR Description
${description || "No description provided"}

---

### Context from Codebase
${context.join("\n\n")}

---

### Code Changes
${diff}
`;

    const summary = await step.run("generate-summary", async () => {
      const { text } = await generateText({
        messages: [
          { role: "system", content: PR_SUMMARY_PROMPT },
          { role: "user", content: userPrompt },
        ],
      });
      return text;
    });

    await step.run("post-summary-comment", async () => {
      await postPullRequestComment(token, owner, repository, prNumber, summary);
    });

    const review = await step.run("generate-review-findings", async () => {
      const { object } = await generateObject({
        outputSchema: z.object({
          overview: z.string().describe("Concise high-level summary of the review findings."),
          findings: z.array(z.object({
            path: z.string().describe("File path."),
            line: z.number().describe("Line number in the final file version."),
            priority: z.enum(["High Priority", "Medium Priority", "Low Priority"]),
            explanation: z.string().describe("Description of the issue and its impact."),
            suggestion: z.string().describe("Recommended fix or solution.")
          }))
        }),
        messages: [
          { role: "system", content: PR_REVIEW_PROMPT },
          { role: "user", content: userPrompt },
        ],
      });
      return object;
    });

    await step.run("post-review-feedback", async () => {
      const reviewBody = `# Code Review\n\n${review.overview}`;
      const inlineComments = review.findings.map((f: any) => ({
        path: f.path,
        line: f.line,
        body: `**${f.priority}**\n\n${f.explanation}\n\n**Recommendation:**\n${f.suggestion}`,
      }));

      await createPullRequestReview(
        token,
        owner,
        repository,
        prNumber,
        reviewBody,
        inlineComments
      );
    });

    await step.run("save-review-to-db", async () => {
      const dbRepo = await prisma.repository.findFirst({
        where: { owner, name: repository },
      });

      if (dbRepo) {
        await prisma.review.create({
          data: {
            repositoryId: dbRepo.id,
            prNumber,
            prTitle: title,
            prUrl: `https://github.com/${owner}/${repository}/pull/${prNumber}`,
            review: JSON.stringify(review),
            status: "completed",
          },
        });
      }
    });

    return { success: true };
  }
);
