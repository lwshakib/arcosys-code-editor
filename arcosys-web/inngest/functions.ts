import prisma from "@/lib/prisma";
import { inngest } from "./client";
import { getRepoFileContents, indexCodebase } from "./helpers";

/**
 * Inngest function that indexes a GitHub repository when connected.
 * Triggered by the "repository.connected" event.
 *
 * Steps:
 * 1. Fetches the user's GitHub access token
 * 2. Retrieves all file contents from the repository
 * 3. Indexes the codebase in Pinecone for semantic search
 *
 * @returns Object with success status, number of indexed files, and repo ID
 */
export const indexRepo = inngest.createFunction(
  { id: "index-repo" },
  { event: "repository.connected" },
  async ({ event, step }) => {
    const { repository, owner, userId } = event.data;

    const files = await step.run("fetch-files", async () => {
      const account = await prisma.account.findFirst({
        where: {
          userId,
          providerId: "github",
        },
      });

      if (!account?.accessToken) {
        throw new Error("No access token found");
      }

      return await getRepoFileContents(account.accessToken, owner, repository);
    });

    await step.run("index-codebase", async () => {
      await indexCodebase(`${owner}/${repository}`, files);
    });

    return {
      success: true,
      indexedFiles: files.length,
      repoId: `${owner}/${repository}`,
    };
  }
);
