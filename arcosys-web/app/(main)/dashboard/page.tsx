import { ChartAreaInteractive } from "@/components/chart-area-interactive";
import { DataTable } from "@/components/data-table";
import { SectionCards } from "@/components/section-cards";
import { GithubStats, GithubStatsSkeleton } from "@/components/github-stats";
import {
  ContributionActivity,
  ContributionActivitySkeleton,
} from "@/components/contribution-activity";
import { getGithubStats } from "./actions";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { IconBrandGithub } from "@tabler/icons-react";
import { GithubConnect } from "@/components/github-connect";
import { Suspense } from "react";

import data from "./data.json";

export default async function Page() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/sign-in");
  }

  return (
    <div className="flex flex-1 flex-col pb-10">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-8 py-4 md:gap-10 md:py-6">
          <Suspense fallback={<DashboardSkeleton />}>
            <GithubDashboardContent />
          </Suspense>

          <div className="flex flex-col gap-8">
            <SectionCards />
            <div className="px-4 lg:px-6">
              <ChartAreaInteractive />
            </div>
            <DataTable data={data} />
          </div>
        </div>
      </div>
    </div>
  );
}

async function GithubDashboardContent() {
  const githubStats = await getGithubStats();

  if (!githubStats) {
    return (
      <div className="mx-4 lg:mx-6 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border p-12 text-center bg-card/50 backdrop-blur-sm">
        <div className="bg-muted mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-border">
          <IconBrandGithub className="h-8 w-8 text-primary" />
        </div>
        <h3 className="text-2xl font-bold tracking-tight">
          Connect GitHub to see your stats
        </h3>
        <p className="text-muted-foreground mt-2 mb-8 max-w-sm">
          Linking your GitHub account allows us to display your repository
          statistics and contribution activity.
        </p>
        <GithubConnect />
      </div>
    );
  }

  return (
    <>
      <GithubStats stats={githubStats} />
      <ContributionActivity
        calendar={githubStats.calendar}
        totalContributions={githubStats.totalContributions}
      />
    </>
  );
}

function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-8">
      <GithubStatsSkeleton />
      <ContributionActivitySkeleton />
    </div>
  );
}
