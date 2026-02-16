import { generateObject as aiGenerateObject } from "ai";
import { z } from "zod";
import { getModel, normalizeMessages } from "./model";
import { tools } from "./tools";

/**
 * Generates a structured object using the AI model.
 * @param schema - Zod schema for the object.
 * @param system - Optional system prompt.
 * @param messages - Optional array of messages.
 * @param prompt - Optional prompt string.
 */
export async function generateObject<T>({
  schema,
  system,
  messages,
  prompt,
}: {
  schema: z.Schema<T>;
  system?: string;
  messages?: any[];
  prompt?: string;
}) {
  const model = getModel();

  const result = await aiGenerateObject({
    model,
    schema,
    system,
    ...(messages 
      ? { messages: normalizeMessages(messages) } 
      : prompt 
        ? { prompt }
        : { messages: [] }
    ),
    temperature: 0,
    tools,
    maxSteps: 5,
    onStepFinish: ({ toolCalls }) => {
      toolCalls?.forEach((call) => {
        console.log(`\n[Tool Call]: ${call.toolName}`);
      });
    },
  });

  return result;
}
