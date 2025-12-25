import { reviewPullRequest } from "@/inngest/helpers";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.json();
    const event = req.headers.get("x-github-event");

    console.log(`Received GitHub event: ${event}`, body);

    if (event === "ping") {
      return NextResponse.json({ message: "Pong" }, { status: 200 });
    }

    if (event === "pull_request") {
      const action = body.action;
      const repoFullName: string = body.repository.full_name;
      const prNumber: number = body.number;

      const [owner, repoName] = repoFullName.split("/");

      if (action === "opened" || action === "synchronize") {
        reviewPullRequest(owner, repoName, prNumber)
          .then(() => {
            console.log(`Review completed for ${repoFullName} #${prNumber}`);
          })
          .catch((error) => {
            console.error(
              `Review failed for ${repoFullName} #${prNumber}`,
              error
            );
          });
      }
    }


    // TODO: handle other GitHub events (push, pull_request, etc.)
    return NextResponse.json({ message: "Event processed" }, { status: 200 });
  } catch (error) {
    console.error("Error processing webhook:", error);

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
