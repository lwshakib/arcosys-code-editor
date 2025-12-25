"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  IconGitBranch,
  IconGitCommit,
  IconGitPullRequest,
  IconMessageCircle,
} from "@tabler/icons-react";
import { motion } from "motion/react";

interface GithubStatsProps {
  stats: {
    totalRepositories: number;
    totalPRs: number;
    totalCommitsLastYear: number;
    aiReviews: number;
  };
}

export function GithubStats({ stats }: GithubStatsProps) {
  const items = [
    {
      label: "Total Repositories",
      value: stats.totalRepositories,
      subtext: "Connected repositories",
      icon: IconGitBranch,
      color: "blue",
    },
    {
      label: "Total Commits",
      value: stats.totalCommitsLastYear.toLocaleString(),
      subtext: "In the last year",
      icon: IconGitCommit,
      color: "green",
    },
    {
      label: "Pull Requests",
      value: stats.totalPRs,
      subtext: "All time",
      icon: IconGitPullRequest,
      color: "purple",
    },
    {
      label: "AI Reviews",
      value: stats.aiReviews,
      subtext: "Generated reviews",
      icon: IconMessageCircle,
      color: "orange",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 md:grid-cols-2 lg:grid-cols-4">
      {items.map((item, index) => (
        <motion.div
          key={item.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card className="group relative overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm transition-all hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/5">
            <div className="absolute inset-0 bg-linear-to-br from-primary/5 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />

            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                  {item.label}
                </span>
                <div className="rounded-xl bg-primary/10 p-2 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <item.icon className="size-5" />
                </div>
              </div>

              <div className="space-y-1">
                <h3 className="text-3xl font-bold tracking-tight">
                  {item.value}
                </h3>
                <p className="text-sm text-muted-foreground italic">
                  {item.subtext}
                </p>
              </div>

              {/* Decorative line */}
              <div className="absolute bottom-0 left-0 h-1 w-full bg-linear-to-r from-transparent via-primary/20 to-transparent scale-x-0 transition-transform group-hover:scale-x-100" />
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}

export function GithubStatsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 md:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card
          key={i}
          className="border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden"
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="size-9 rounded-xl" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-4 w-32" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
