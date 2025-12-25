import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import {
  IconArrowLeft,
  IconExternalLink,
  IconGitPullRequest,
  IconMessage,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Mermaid } from "@/components/mermaid";

export default async function ReviewDetailPage({
  params,
}: {
  params: Promise<{ reviewId: string }>;
}) {
  const { reviewId } = await params;
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/sign-in");
  }

  const review = await prisma.review.findUnique({
    where: { id: reviewId },
    include: {
      repository: true,
    },
  });

  if (!review || review.repository.userId !== session.user.id) {
    notFound();
  }

  return (
    <div className="flex flex-1 flex-col p-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="mb-0 max-w-6xl mx-auto w-full">
        <Link
          href="/reviews"
          className="text-muted-foreground hover:text-primary mb-6 flex items-center gap-2 transition-colors w-fit group"
        >
          <IconArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Back to Reviews
        </Link>

        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between mb-12">
          <div className="space-y-3">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
              {review.prTitle}
            </h1>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-muted-foreground text-lg">
              <span className="flex items-center gap-1.5 font-medium">
                <IconGitPullRequest className="size-5 text-primary" />
                PR #{review.prNumber}
              </span>
              <span className="opacity-20">•</span>
              <span className="font-medium">{review.repository.fullName}</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge
              variant="outline"
              className={`h-9 px-4 text-sm font-bold capitalize border-2 ${
                review.status === "completed"
                  ? "border-green-500/20 bg-green-500/10 text-green-500 shadow-[0_0_15px_-5px_rgba(34,197,94,0.3)]"
                  : review.status === "failed"
                  ? "border-red-500/20 bg-red-500/10 text-red-500 shadow-[0_0_15px_-5px_rgba(239,68,68,0.3)]"
                  : "border-yellow-500/20 bg-yellow-500/10 text-yellow-500 shadow-[0_0_15px_-5px_rgba(234,179,8,0.3)]"
              }`}
            >
              <div className="mr-2 h-2 w-2 rounded-full bg-current animate-pulse" />
              {review.status}
            </Badge>
            <Button
              asChild
              variant="secondary"
              className="h-9 rounded-xl font-semibold"
            >
              <a href={review.prUrl} target="_blank" rel="noopener noreferrer">
                View on GitHub
                <IconExternalLink className="ml-2 h-4 w-4" />
              </a>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-8 space-y-8">
            <div className="bg-card/50 backdrop-blur-md relative overflow-hidden rounded-[2.5rem] border border-white/5 shadow-2xl p-8 md:p-14">
              {/* Decorative backgrounds */}
              <div className="absolute top-0 right-0 -mr-20 -mt-20 h-80 w-80 rounded-full bg-primary/10 blur-[100px]" />
              <div className="absolute bottom-0 left-0 -ml-20 -mb-20 h-80 w-80 rounded-full bg-blue-500/10 blur-[100px]" />

              <div className="relative">
                <div className="flex items-center gap-4 mb-10 pb-6 border-b border-white/5">
                  <div className="h-12 w-12 rounded-2xl bg-linear-to-tr from-primary to-primary/50 flex items-center justify-center shadow-lg shadow-primary/20">
                    <IconMessage className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-extrabold tracking-tight">
                      Review Report
                    </h2>
                    <p className="text-muted-foreground text-sm">
                      Deep analysis and suggestions
                    </p>
                  </div>
                </div>

                <div className="prose prose-zinc dark:prose-invert max-w-none prose-headings:font-extrabold prose-headings:tracking-tight prose-a:text-primary prose-pre:bg-[#0d1117] prose-pre:border prose-pre:border-white/5 prose-pre:rounded-2xl">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      code({
                        node,
                        inline,
                        className,
                        children,
                        ...props
                      }: any) {
                        const match = /language-(\w+)/.exec(className || "");
                        const language = match ? match[1] : "";
                        const content = String(children).replace(/\n$/, "");

                        if (!inline && language === "mermaid") {
                          return <Mermaid chart={content} />;
                        }

                        return (
                          <code className={className} {...props}>
                            {children}
                          </code>
                        );
                      },
                    }}
                  >
                    {review.review}
                  </ReactMarkdown>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-6">
            <div className="bg-muted/40 sticky top-8 rounded-[2rem] border border-border p-8 backdrop-blur-sm">
              <h3 className="font-bold text-sm uppercase tracking-[0.2em] text-muted-foreground/70 mb-8">
                Metadata
              </h3>

              <div className="space-y-8">
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground/60">
                    Generated Date
                  </span>
                  <span className="text-lg font-semibold">
                    {format(new Date(review.createdAt), "MMMM do, yyyy")}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {format(new Date(review.createdAt), "h:mm a")}
                  </span>
                </div>

                <div className="flex flex-col gap-1.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground/60">
                    Target Repository
                  </span>
                  <span
                    className="text-lg font-semibold truncate"
                    title={review.repository.fullName}
                  >
                    {review.repository.name}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {review.repository.owner}
                  </span>
                </div>

                <div className="pt-6 border-t border-border/50">
                  <Button
                    variant="default"
                    className="w-full h-12 rounded-[1rem] font-bold shadow-lg shadow-primary/20"
                    asChild
                  >
                    <a
                      href={review.prUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      View Original PR
                      <IconExternalLink className="ml-2 h-4 w-4" />
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
