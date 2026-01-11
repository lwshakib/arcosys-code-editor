import { google } from "@ai-sdk/google";
import { z } from "zod";
import { EXAMPLE_REGISTRY } from "./examples/registry";
import { tool } from "ai";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const designInspiration = tool({
  name: "designInspiration",
  description: "Get design inspiration for a project",
  parameters: z.object({}),
  execute: async (_args: any) => {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const examplesDir = path.join(__dirname, "examples");

    const inspirations = await Promise.all(
      Object.entries(EXAMPLE_REGISTRY).map(async ([name, filename]) => {
        try {
          const filePath = path.join(examplesDir, filename);
          const content = await readFile(filePath, "utf-8");
          return `${name}:\n\n${content}`;
        } catch (error) {
          console.error(`Error reading ${filename}:`, error);
          return `${name}:\n\nError: Could not read inspiration file.`;
        }
      })
    );

    return inspirations.join("\n\n---\n\n");
  },
} as any);

export const tools = {
  googleSearch: google.tools.googleSearch({}),
  urlContext: google.tools.urlContext({}),
  googleMaps: google.tools.googleMaps({}),
  codeExecution: google.tools.codeExecution({}),
  designInspiration,
};
