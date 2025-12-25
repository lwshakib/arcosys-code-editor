"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";
import { inngest } from "@/inngest/client";
import { revalidatePath } from "next/cache";

export async function connectRepository(repoData: {
  githubId: number;
  name: string;
  owner: string;
  fullName: string;
  url: string;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("Unauthorized");
  }

  const repository = await prisma.repository.create({
    data: {
      githubId: BigInt(repoData.githubId),
      name: repoData.name,
      owner: repoData.owner,
      fullName: repoData.fullName,
      url: repoData.url,
      userId: session.user.id,
    },
  });

  // Trigger Inngest to index the repository
  await inngest.send({
    name: "repository.connected",
    data: {
      repository: repoData.name,
      owner: repoData.owner,
      userId: session.user.id,
    },
  });

  revalidatePath("/repositories");
  return repository;
}

export async function disconnectRepository(githubId: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("Unauthorized");
  }

  await prisma.repository.delete({
    where: {
      githubId: BigInt(githubId),
    },
  });

  revalidatePath("/repositories");
  return { success: true };
}
