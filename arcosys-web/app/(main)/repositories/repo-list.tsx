"use client";

import { useState } from "react";
import {
  IconGitBranch,
  IconLock,
  IconWorld,
  IconStar,
  IconExternalLink,
  IconGitFork,
  IconCirclePlus,
  IconTrash,
  IconLoader2,
} from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { connectRepository, disconnectRepository } from "./actions";
import { toast } from "sonner";

interface Repo {
  id: number;
  name: string;
  full_name: string;
  owner: { login: string };
  html_url: string;
  description: string;
  private: boolean;
  language: string;
  stargazers_count: number;
  forks_count: number;
}

interface RepoListProps {
  initialRepos: Repo[];
  connectedRepoIds: string[]; // BigInt stringified
}

export function RepoList({ initialRepos, connectedRepoIds }: RepoListProps) {
  const [loadingIds, setLoadingIds] = useState<Set<number>>(new Set());

  const handleConnect = async (repo: Repo) => {
    setLoadingIds((prev) => new Set(prev).add(repo.id));
    try {
      await connectRepository({
        githubId: repo.id,
        name: repo.name,
        owner: repo.owner.login,
        fullName: repo.full_name,
        url: repo.html_url,
      });
      toast.success(`Connected ${repo.name}`);
    } catch (error) {
      console.error(error);
      toast.error("Failed to connect repository");
    } finally {
      setLoadingIds((prev) => {
        const next = new Set(prev);
        next.delete(repo.id);
        return next;
      });
    }
  };

  const handleDisconnect = async (repo: Repo) => {
    const connectedId = connectedRepoIds.find(
      (id) => id === repo.id.toString()
    );
    if (!connectedId) return;

    setLoadingIds((prev) => new Set(prev).add(repo.id));
    try {
      // We need the internal ID from Prisma, but we only have githubId.
      // This is a bit tricky if we don't have the Prisma ID in RepoList.
      // Let's modify the disconnectRepository to take githubId instead, or find it here.
      // For now, let's assume we can find it.
      // Actually, it's easier to modify the action or pass more data.
      await disconnectRepository(repo.id.toString()); // Passing githubId as string
      toast.success(`Disconnected ${repo.name}`);
    } catch (error) {
      console.error(error);
      toast.error("Failed to disconnect repository");
    } finally {
      setLoadingIds((prev) => {
        const next = new Set(prev);
        next.delete(repo.id);
        return next;
      });
    }
  };

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {initialRepos.map((repo) => {
        const isConnected = connectedRepoIds.includes(repo.id.toString());
        const isLoading = loadingIds.has(repo.id);

        return (
          <div
            key={repo.id}
            className="group bg-card hover:bg-muted/50 relative flex flex-col overflow-hidden rounded-2xl border border-border p-5 transition-all hover:shadow-lg hover:-translate-y-1"
          >
            <div className="mb-4 flex items-start justify-between">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-xl p-2 transition-colors ${
                  isConnected
                    ? "bg-green-500/10 text-green-500"
                    : "bg-primary/10 group-hover:bg-primary group-hover:text-primary-foreground"
                }`}
              >
                <IconGitBranch className="h-5 w-5" />
              </div>
              <div className="flex items-center gap-2">
                {isConnected && (
                  <Badge
                    variant="secondary"
                    className="bg-green-500/10 text-green-600 border-green-500/20"
                  >
                    Connected
                  </Badge>
                )}
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
              <p className="text-muted-foreground mt-1.5 line-clamp-2 text-sm leading-relaxed min-h-10">
                {repo.description || "No description provided."}
              </p>
            </div>

            <div className="mt-4 flex flex-col gap-3">
              <div className="flex items-center justify-between border-t border-border/50 pt-4">
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
                </div>

                <Button
                  size="sm"
                  variant={isConnected ? "outline" : "default"}
                  className="h-8 gap-1"
                  disabled={isLoading}
                  onClick={() =>
                    isConnected ? handleDisconnect(repo) : handleConnect(repo)
                  }
                >
                  {isLoading ? (
                    <IconLoader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : isConnected ? (
                    <>
                      <IconTrash className="h-3.5 w-3.5" />
                      Disconnect
                    </>
                  ) : (
                    <>
                      <IconCirclePlus className="h-3.5 w-3.5" />
                      Connect
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Subtle hover overlay */}
            <div
              className={`absolute inset-x-0 bottom-0 h-1 origin-left scale-x-0 transition-transform group-hover:scale-x-100 ${
                isConnected ? "bg-green-500" : "bg-primary"
              }`}
            />
          </div>
        );
      })}
    </div>
  );
}
