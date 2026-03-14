
/**
 * GLM-4.7-Flash Comprehensive Implementation
 * Based on Cloudflare Worker proxy documentation.
 */

export async function generateText({
  messages,
  temperature = 0,
  max_tokens,
}: {
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
      throw new Error(`GLM Worker Error (${response.status}): ${errorData.error || errorText}`);
    }

    const data = await response.json();

    if (!data.choices || data.choices.length === 0) {
      throw new Error("GLM Worker returned an empty response.");
    }

    const choice = data.choices[0];
    const message = choice.message;
    const text = message?.content || "";

    return {
      text,
      finishReason: choice.finish_reason,
      usage: data.usage,
      raw: data,
    };
  } catch (error: any) {
    console.error("[GLM generateText Error]:", error);
    throw error;
  }
}
