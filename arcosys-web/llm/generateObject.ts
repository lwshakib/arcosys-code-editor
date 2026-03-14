
import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";

/**
 * Generates a structured object using the GLM-4.7-Flash model.
 * Based on Cloudflare Worker proxy documentation (Strict JSON Schema Mode).
 */
export async function generateObject<T>({
  outputSchema,
  messages,
  temperature = 0,
  max_tokens,
}: {
  outputSchema: z.Schema<T>;
  messages: any[];
  temperature?: number;
  max_tokens?: number;
}) {
  const url = process.env.GLM_WORKER_URL;
  const apiKey = process.env.CLOUDFLARE_API_KEY;

  if (!url) {
    throw new Error("GLM_WORKER_URL is not defined in environment variables. Check your .env file.");
  }

  if (!apiKey) {
    throw new Error("CLOUDFLARE_API_KEY is not defined in environment variables. Check your .env file.");
  }

  // Convert Zod schema to JSON Schema
  const jsonSchema = zodToJsonSchema(outputSchema as any);

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        messages,
        temperature,
        max_tokens,
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "object_generation",
            strict: true,
            schema: jsonSchema,
          },
        },
        stream: false,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch (e) {
        errorData = { error: errorText };
      }
      throw new Error(`GLM Worker Object Generation Error (${response.status}): ${errorData.error || errorText}`);
    }

    const data = await response.json();

    if (!data.choices || data.choices.length === 0) {
      throw new Error("GLM Worker returned an empty response.");
    }

    const choice = data.choices[0];
    const content = choice.message?.content || "{}";

    try {
      const parsedObject = JSON.parse(content) as T;
      return {
        object: parsedObject,
        finishReason: choice.finish_reason,
        usage: data.usage,
        raw: data,
      };
    } catch (parseError) {
      console.error("[GLM generateObject Parse Error]:", content);
      throw new Error("Failed to parse JSON response from GLM model.");
    }
  } catch (error: any) {
    console.error("[GLM generateObject Error]:", error);
    throw error;
  }
}
