import { createGoogleGenerativeAI } from "@ai-sdk/google";

export function getSingleAPIKey(): string {
  const keys = (process.env.GOOGLE_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_API_KEY)?.split(",")
    .map((k) => k.trim())
    .filter(Boolean);

  if (!keys || keys.length === 0) {
    throw new Error("GOOGLE_API_KEY is not set or empty");
  }

  return keys[Math.floor(Math.random() * keys.length)]!;
}

export const googleProvider = (apiKey: string) => createGoogleGenerativeAI({
  apiKey,
});

export const MODELS = ["gemini-2.5-flash-lite", "gemini-2.5-flash"];

let modelIndex = 0;

export function getModel() {
  const apiKey = getSingleAPIKey();
  const google = googleProvider(apiKey);
  const modelName = MODELS[modelIndex % MODELS.length];
  modelIndex++;
  return google(modelName!);
}

export function normalizeMessages(messages: any[]) {
  return messages.map((m: any) => ({
    role: m.role || (m.type === "user" ? "user" : "assistant"),
    content: m.content || m.text || m.content
  }));
}
