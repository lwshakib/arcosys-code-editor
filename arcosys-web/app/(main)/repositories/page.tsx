import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { GithubConnect } from "@/components/github-connect";
import {
  IconGitBranch,
  IconBrandGithub,
  IconCirclePlus,
  IconLock,
  IconWorld,
  IconStar,
  IconExternalLink,
  IconGitFork,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Octokit } from "@octokit/rest";
import { Badge } from "@/components/ui/badge";

export default async function RepositoriesPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/sign-in");
  }

  const githubAccount = await prisma.account.findFirst({
    where: {
      userId: session.user.id,
      providerId: "github",
    },
  });

  if (!githubAccount?.accessToken) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center p-8 text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="relative mb-8">
          <div className="absolute -inset-4 rounded-full bg-primary/20 blur-2xl animate-pulse" />
          <div className="bg-muted relative flex h-24 w-24 items-center justify-center rounded-2xl border-2 border-border shadow-xl">
            <IconBrandGithub className="h-12 w-12 text-primary" />
          </div>
        </div>
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Connect GitHub
        </h2>
        <p className="text-muted-foreground mt-4 mb-10 max-w-md text-lg leading-relaxed">
          Unlock the full power of ArcOSys by connecting your GitHub account.
          Import your repositories, track changes, and collaborate seamlessly.
        </p>
        <GithubConnect />
        <p className="text-muted-foreground mt-6 text-sm">
          A GitHub account is required to access and manage repositories.
        </p>
      </div>
    );
  }

  const octokit = new Octokit({
    auth: githubAccount.accessToken,
  });

  let repositories: any[] = [];
  try {
    const response = await octokit.repos.listForAuthenticatedUser({
      sort: "updated",
      per_page: 50,
    });
    repositories = response.data;
  } catch (error) {
    console.error("Failed to fetch repositories:", error);
  }

  return (
    <div className="flex flex-1 flex-col p-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-10">
        <div>
          <h2 className="text-4xl font-extrabold tracking-tight">
            Repositories
          </h2>
          <p className="text-muted-foreground mt-2 text-lg italic">
            Manage and access your connected GitHub repositories.
          </p>
        </div>
        <Button className="gap-2 shadow-lg shadow-primary/20 transition-transform hover:scale-105 active:scale-95">
          <IconCirclePlus className="h-5 w-5" />
          Import Repository
        </Button>
      </div>

      {repositories.length === 0 ? (
        <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
          <div className="group relative flex aspect-video flex-col items-center justify-center rounded-3xl border-2 border-dashed border-border p-8 transition-all hover:border-primary/50 hover:bg-muted/30">
            <div className="bg-muted flex h-16 w-16 items-center justify-center rounded-2xl transition-transform group-hover:scale-110">
              <IconGitBranch className="h-8 w-8 text-muted-foreground group-hover:text-primary" />
            </div>
            <div className="mt-6 text-center">
              <p className="text-xl font-bold tracking-tight">
                No repositories found
              </p>
              <p className="text-muted-foreground mt-2 max-w-50 text-sm leading-snug">
                We couldn&apos;t find any repositories in your GitHub account.
              </p>
            </div>
            <div className="absolute inset-0 rounded-3xl ring-1 ring-inset ring-foreground/5 transition-opacity group-hover:opacity-100 opacity-0" />
          </div>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {repositories.map((repo) => (
            <div
              key={repo.id}
              className="group bg-card hover:bg-muted/50 relative flex flex-col overflow-hidden rounded-2xl border border-border p-5 transition-all hover:shadow-lg hover:-translate-y-1"
            >
              <div className="mb-4 flex items-start justify-between">
                <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-xl p-2 transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <IconGitBranch className="h-5 w-5" />
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className="h-5 text-[10px] font-bold uppercase tracking-wider"
                  >
                    {repo.private ? (
                      <IconLock className="mr-1 size-2.5" />
                    ) : (
                      <IconWorld className="mr-1 size-2.5" />
                    )}
                    {repo.private ? "Private" : "Public"}
                  </Badge>
                  <a
                    href={repo.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <IconExternalLink className="size-4" />
                  </a>
                </div>
              </div>

              <div className="flex-1">
                <h3 className="line-clamp-1 text-lg font-bold transition-colors group-hover:text-primary">
                  {repo.name}
                </h3>
                <p className="text-muted-foreground mt-1.5 line-clamp-2 text-sm leading-relaxed">
                  {repo.description || "No description provided."}
                </p>
              </div>

              <div className="mt-6 flex items-center justify-between border-t border-border/50 pt-4">
                <div className="flex items-center gap-4 text-xs font-medium text-muted-foreground">
                  {repo.language && (
                    <div className="flex items-center gap-1.5">
                      <div className="h-2 w-2 rounded-full bg-primary" />
                      {repo.language}
                    </div>
                  )}
                  <div className="flex items-center gap-1.5">
                    <IconStar className="size-3.5" />
                    {repo.stargazers_count}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <IconGitFork className="size-3.5" />
                    {repo.forks_count}
                  </div>
                </div>
              </div>

              {/* Subtle hover overlay */}
              <div className="absolute inset-x-0 bottom-0 h-1 origin-left scale-x-0 bg-primary transition-transform group-hover:scale-x-100" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
