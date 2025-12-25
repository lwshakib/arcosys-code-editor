"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";
import { Octokit } from "@octokit/rest";

export async function getGithubStats() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("Unauthorized");
  }

  const githubAccount = await prisma.account.findFirst({
    where: {
      userId: session.user.id,
      providerId: "github",
    },
  });

  if (!githubAccount?.accessToken) {
    return null;
  }

  const octokit = new Octokit({
    auth: githubAccount.accessToken,
  });

  try {
    // GraphQL query for stats and contribution calendar
    const query = `
      query {
        viewer {
          login
          repositories {
            totalCount
          }
          pullRequests {
            totalCount
          }
          contributionsCollection {
            contributionCalendar {
              totalContributions
              weeks {
                contributionDays {
                  contributionCount
                  date
                  color
                }
              }
            }
            totalCommitContributions
          }
        }
      }
    `;

    const response: any = await octokit.graphql(query);
    const viewer = response.viewer;

    return {
      totalRepositories: viewer.repositories.totalCount,
      totalPRs: viewer.pullRequests.totalCount,
      totalCommitsLastYear:
        viewer.contributionsCollection.totalCommitContributions,
      totalContributions:
        viewer.contributionsCollection.contributionCalendar.totalContributions,
      calendar: viewer.contributionsCollection.contributionCalendar.weeks,
      aiReviews: 44, // Hardcoded as requested
    };
  } catch (error) {
    console.error("Failed to fetch GitHub stats:", error);
    return null;
  }
}
