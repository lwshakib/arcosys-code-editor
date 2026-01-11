export type MessageType = "user" | "bot" | "tool-result" | "thought" | "status";

export interface Message {
  type: MessageType;
  text: string;
  role?: "user" | "assistant";
  statusType?: "create" | "analyze" | "run" | "delete";
}

export type AgentStep = 
  | { tool: "executeCommand"; thought: string; command: string }
  | { tool: "writeFile"; thought: string; path: string; content: string }
  | { tool: "readFile"; thought: string; path: string }
  | { tool: "deleteFile"; thought: string; path: string }
  | { tool: "replaceFileContent"; thought: string; path: string; oldContent: string; newContent: string }
  | { tool: "talk"; thought: string; text: string }
  | { tool: "end"; thought: string };
