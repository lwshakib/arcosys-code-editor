import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import {
  IconCheck,
  IconClock,
  IconX,
  IconExternalLink,
  IconMessage,
} from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import Link from "next/link";

export default async function ReviewsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/sign-in");
  }

  const reviews = await prisma.review.findMany({
    where: {
      repository: {
        userId: session.user.id,
      },
    },
    include: {
      repository: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div className="flex flex-1 flex-col p-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-10">
        <div>
          <h2 className="text-4xl font-extrabold tracking-tight">Reviews</h2>
          <p className="text-muted-foreground mt-2 text-lg italic">
            Track automated code reviews for your PRs.
          </p>
        </div>
      </div>

      {reviews.length === 0 ? (
        <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
          <div className="group relative flex aspect-video flex-col items-center justify-center rounded-3xl border-2 border-dashed border-border p-8 transition-all hover:border-primary/50 hover:bg-muted/30">
            <div className="bg-muted flex h-16 w-16 items-center justify-center rounded-2xl transition-transform group-hover:scale-110">
              <IconMessage className="h-8 w-8 text-muted-foreground group-hover:text-primary" />
            </div>
            <div className="mt-6 text-center">
              <p className="text-xl font-bold tracking-tight">No reviews yet</p>
              <p className="text-muted-foreground mt-2 max-w-50 text-sm leading-snug">
                Connect a repository and open a PR to get started.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {reviews.map((review) => (
            <Link
              key={review.id}
              href={`/reviews/${review.id}`}
              className="group bg-card hover:bg-muted/50 relative flex flex-col overflow-hidden rounded-2xl border border-border p-5 transition-all hover:shadow-lg hover:-translate-y-1"
            >
              <div className="mb-4 flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-xl p-2 transition-colors ${
                      review.status === "completed"
                        ? "bg-green-500/10 text-green-500"
                        : review.status === "failed"
                        ? "bg-red-500/10 text-red-500"
                        : "bg-yellow-500/10 text-yellow-500"
                    }`}
                  >
                    {review.status === "completed" ? (
                      <IconCheck className="h-5 w-5" />
                    ) : review.status === "failed" ? (
                      <IconX className="h-5 w-5" />
                    ) : (
                      <IconClock className="h-5 w-5" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg line-clamp-1 group-hover:text-primary transition-colors">
                      {review.prTitle}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      PR #{review.prNumber} in {review.repository.name}
                    </p>
                  </div>
                </div>

                <div className="text-muted-foreground hover:text-primary transition-colors">
                  <IconExternalLink className="h-4 w-4" />
                </div>
              </div>

              <div className="flex-1 mt-2">
                <div className="prose prose-sm dark:prose-invert max-w-none line-clamp-4 text-muted-foreground text-sm">
                  {review.review}
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-border/50 pt-4">
                <Badge variant="secondary" className="capitalize">
                  {review.status}
                </Badge>
                <span className="text-xs text-muted-foreground font-medium">
                  {format(new Date(review.createdAt), "MMM d, yyyy")}
                </span>
              </div>

              <div
                className={`absolute inset-x-0 bottom-0 h-1.5 origin-left scale-x-0 transition-transform group-hover:scale-x-100 ${
                  review.status === "completed"
                    ? "bg-green-500"
                    : review.status === "failed"
                    ? "bg-red-500"
                    : "bg-yellow-500"
                }`}
              />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
