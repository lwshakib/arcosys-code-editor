import { generateText as aiGenerateText } from "ai";
import { getModel, normalizeMessages } from "./model";
import { tools } from "./tools";

/**
 * Generates text using the AI model.
 * @param system - Optional system prompt.
 * @param messages - Optional array of messages.
 * @param prompt - Optional prompt string.
 */
export async function generateText({
  system,
  messages,
  prompt,
}: {
  system?: string;
  messages?: any[];
  prompt?: string;
}) {
  const model = getModel();

  // Build the config based on whether messages or prompt is provided
  const config = messages
    ? {
        model,
        system,
        messages: normalizeMessages(messages),
        temperature: 0,
        // tools,
      }
    : {
        model,
        system,
        prompt: prompt || "",
        temperature: 0,
        // tools,
      };

  const result = await aiGenerateText(config as any);

  return result;
}
