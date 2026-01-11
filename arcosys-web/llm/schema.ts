import { z } from "zod";

export const AgentStepSchema = z.discriminatedUnion("tool", [
  z.object({
    tool: z.literal("executeCommand"),
    thought: z.string(),
    command: z.string(),
  }),
  z.object({
    tool: z.literal("writeFile"),
    thought: z.string(),
    path: z.string(),
    content: z.string(),
  }),
  z.object({
    tool: z.literal("readFile"),
    thought: z.string(),
    path: z.string(),
  }),
  z.object({
    tool: z.literal("deleteFile"),
    thought: z.string(),
    path: z.string(),
  }),
  z.object({
    tool: z.literal("replaceFileContent"),
    thought: z.string(),
    path: z.string(),
    oldContent: z.string(),
    newContent: z.string(),
  }),
  z.object({
    tool: z.literal("talk"),
    thought: z.string(),
    text: z.string(),
  }),
  z.object({
    tool: z.literal("end"),
    thought: z.string(),
  }),
]);

export type AgentStep = z.infer<typeof AgentStepSchema>;
