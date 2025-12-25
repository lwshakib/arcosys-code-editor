export type MessageType = "user" | "bot";

export interface Message {
  type: MessageType;
  text: string;
}
