import { generateObject, AgentStepSchema, SYSTEM_PROMPT } from "@/llm";

export async function POST(req: Request) {
  try {
    const { messages, cwd } = await req.json();

    console.log(`[Agent] Calling model with ${messages.length} messages...`);

    const response = await generateObject({
      schema: AgentStepSchema,
      system: `${SYSTEM_PROMPT}\n\nCURRENT WORKING DIRECTORY: ${cwd}`,
      messages,
    });

    return Response.json(response.object);
  } catch (error: any) {
    console.error("Agent API Error:", error);
    return Response.json({ 
      error: error.message,
      details: error.details || "Check server logs for more info"
    }, { status: 500 });
  }
}
