import { PINECONE_INDEX } from "@/lib/env";
import { Octokit } from "@octokit/rest";
import { Pinecone as PineconeClient } from "@pinecone-database/pinecone";
import { embed } from "ai";
import { google } from "@ai-sdk/google";
import prisma from "@/lib/prisma";
import { inngest } from "./client";

export const pinecone = new PineconeClient();
// Will automatically read the PINECONE_API_KEY and PINECONE_ENVIRONMENT env vars
export const pineconeIndex = pinecone.Index(PINECONE_INDEX!);

/**
 * Generates an embedding vector for the given text using Google's
 * text-embedding-004 model.
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  const { embedding } = await embed({
    model: google.textEmbeddingModel("text-embedding-004"),
    value: text,
  });

  return embedding;
}

/**
 * Recursively fetches all file contents from a GitHub repository.
 * Excludes binary files (images, PDFs, archives, etc.).
 *
 * @param token - GitHub access token for authentication
 * @param owner - Repository owner username
 * @param repo - Repository name
 * @param path - Optional path within the repository (defaults to root)
 * @returns Array of file objects with path and content
 */
export const getRepoFileContents = async (
  token: string,
  owner: string,
  repo: string,
  path: string = ""
) => {
  const octokit = new Octokit({
    auth: token,
  });

  const { data } = await octokit.repos.getContent({
    owner,
    repo,
    path,
  });

  if (!Array.isArray(data)) {
    if (data.type === "file" && data.content) {
      return [
        {
          path: data.path,
          content: Buffer.from(data.content, "base64").toString("utf-8"),
        },
      ];
    }
    return [];
  }

  let files: { path: string; content: string }[] = [];

  for (const item of data) {
    if (item.type === "file") {
      const { data: fileData } = await octokit.repos.getContent({
        owner,
        repo,
        path: item.path,
      });
      if (
        !Array.isArray(fileData) &&
        fileData.type === "file" &&
        fileData.content
      ) {
        // Exclude binary/non-text files; include everything else as text
        const BINARY_FILE_REGEX = /\.(png|jpe?g|gif|svg|ico|pdf|zip|tar|gz)$/i;

        if (!BINARY_FILE_REGEX.test(item.path)) {
          files.push({
            path: item.path,
            content: Buffer.from(fileData.content, "base64").toString("utf-8"),
          });
        }
      }
    } else if (item.type === "dir") {
      const subFiles = await getRepoFileContents(token, owner, repo, item.path);
      files = files.concat(subFiles);
    }
  }

  return files;
};

export type CodeFile = {
  path: string;
  content: string;
};

/**
 * Indexes a codebase by generating embeddings for each file and storing them in Pinecone.
 * Files are processed in batches of 100 for efficient upserting.
 *
 * @param repoId - Unique identifier for the repository (e.g., "owner/repo")
 * @param files - Array of code files to index
 * @throws Error if batch upsert fails
 */
export async function indexCodebase(
  repoId: string,
  files: CodeFile[]
): Promise<void> {
  console.log(`Starting indexing for ${repoId} with ${files.length} files`);

  const vectors: {
    id: string;
    values: number[];
    metadata: {
      repoId: string;
      path: string;
      content: string;
    };
  }[] = [];

  for (const file of files) {
    const contentWithHeader = `File: ${file.path}\n\n${file.content}`;
    const truncatedContent = contentWithHeader.slice(0, 8000);

    try {
      const embedding = await generateEmbedding(truncatedContent);

      vectors.push({
        id: `${repoId}-${file.path.replace(/\//g, "_")}`,
        values: embedding,
        metadata: {
          repoId,
          path: file.path,
          content: truncatedContent,
        },
      });
    } catch (error) {
      console.error(`Failed to embed file: ${file.path}`, error);
    }
  }

  if (vectors.length > 0) {
    console.log(`Upserting ${vectors.length} vectors to Pinecone`);
    const batchSize = 100;

    for (let i = 0; i < vectors.length; i += batchSize) {
      const batch = vectors.slice(i, i + batchSize);
      try {
        await pineconeIndex.upsert(batch);
        console.log(
          `Upserted batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(
            vectors.length / batchSize
          )}`
        );
      } catch (error) {
        console.error(`Failed to upsert batch starting at index ${i}`, error);
        throw error; // Re-throw to fail the Inngest step
      }
    }

    console.log(`Successfully indexed ${vectors.length} files for ${repoId}`);
  } else {
    console.warn(`No vectors generated for ${repoId}`);
  }
}

/**
 * Retrieves relevant code context from Pinecone based on a query.
 * Uses semantic search to find the most relevant code snippets.
 *
 * @param query - Search query to find relevant code
 * @param repoId - Repository ID to filter results
 * @param topK - Number of results to return (default: 5)
 * @returns Array of relevant code content strings
 */
export async function retrieveContext(
  query: string,
  repoId: string,
  topK: number = 5
): Promise<string[]> {
  const embedding = await generateEmbedding(query);

  const results = await pineconeIndex.query({
    vector: embedding,
    filter: { repoId },
    topK,
    includeMetadata: true,
  });

  return results.matches
    .map((match) => match.metadata?.content as string | undefined)
    .filter((content): content is string => Boolean(content));
}

export async function reviewPullRequest(
  owner: string,
  repo: string,
  prNumber: number
) {
  const repository = await prisma.repository.findFirst({
    where: {
      owner,
      name: repo,
    },
    include: {
      user: {
        include: {
          accounts: {
            where: {
              providerId: "github",
            },
          },
        },
      },
    },
  });

  if (!repository) {
    throw new Error(
      `Repository ${owner}/${repo} not found in database. Please reconnect.`
    );
  }

  const githubAccount = repository.user.accounts[0];

  const token = githubAccount.accessToken;
  if (!token) {
    throw new Error("GitHub access token not found");
  }
  const { title, diff, description } = await getPullRequestDiff(
    token,
    owner,
    repo,
    prNumber
  );

  await inngest.send({
    name: "pr.review.requested",
    data: {
      owner,
      repo,
      prNumber,
      userId: repository.user.id,
    },
  });

  return {
    success: true,
    message: "Review queued",
  };

}

export async function getPullRequestDiff(
  token: string,
  owner: string,
  repo: string,
  prNumber: number
) {
  const octokit = new Octokit({
    auth: token,
  });

  const { data: pullRequest } = await octokit.pulls.get({
    owner,
    repo,
    pull_number: prNumber,
  });

  const { data: diff } = await octokit.pulls.get({
    owner,
    repo,
    pull_number: prNumber,
    mediaType: {
      format: "diff",
    },
  });

  return {
    title: pullRequest.title,
    diff: diff,
    description: pullRequest.body,
  };
}
