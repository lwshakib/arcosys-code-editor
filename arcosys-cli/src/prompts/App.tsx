import React, { useState } from "react";
import { Box, Text, useApp } from "ink";
import TextInput from "ink-text-input";
import { useStdoutDimensions } from "./hooks/useStdoutDimensions.ts";
import { BigTitle } from "./components/BigTitle.tsx";
import { Tips } from "./components/Tips.tsx";
import { ContextInfo } from "./components/ContextInfo.tsx";
import { ExitSummary } from "./components/ExitSummary.tsx";
import { StatusBar } from "./components/StatusBar.tsx";
import type { Message } from "../types/index.ts";

export const AppUI = () => {
  const { exit } = useApp();
  const { columns, rows } = useStdoutDimensions();
  const [input, setInput] = useState("");
  const [isExiting, setIsExiting] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);

  const handleSubmit = (value: string) => {
    if (value.toLowerCase() === "exit" || value.toLowerCase() === "/quit") {
      setIsExiting(true);
      return;
    }

    if (value.trim() === "") return;

    // Add user message
    const newMessages: Message[] = [...messages, { type: "user", text: value }];

    // Add bot response mockup
    newMessages.push({
      type: "bot",
      text: "Okay, I'm ready for your first command.",
    });

    setMessages(newMessages);
    setInput("");
  };

  if (isExiting) {
    return (
      <Box
        flexDirection="column"
        paddingX={4}
        paddingY={2}
        minHeight={rows}
        width={columns}
      >
        <BigTitle text="ARCOSYS" />
        <Tips />
        <Box flexDirection="column" marginBottom={1}>
          {messages.map((msg, index) => (
            <Box key={`msg-exit-${index}`} marginBottom={1}>
              {msg.type === "user" ? (
                <Text color="#9aa0a6" italic>{`> ${msg.text}`}</Text>
              ) : (
                <Box>
                  <Text color="#9B72CB">✦ </Text>
                  <Text color="#e8eaed">{msg.text}</Text>
                </Box>
              )}
            </Box>
          ))}
          <Text color="#9aa0a6" italic>{`> /quit`}</Text>
        </Box>
        <ExitSummary />
      </Box>
    );
  }

  return (
    <Box
      flexDirection="column"
      paddingX={4}
      paddingY={2}
      minHeight={rows}
      width={columns}
    >
      <BigTitle text="ARCOSYS" />

      <Tips />

      <ContextInfo />

      <Box flexDirection="column" flexGrow={1}>
        {messages.map((msg, index) => (
          <Box key={`msg-${index}`} marginBottom={1}>
            {msg.type === "user" ? (
              <Text color="#9aa0a6" italic>{`> ${msg.text}`}</Text>
            ) : (
              <Box>
                <Text color="#9B72CB">✦ </Text>
                <Text color="#e8eaed">{msg.text}</Text>
              </Box>
            )}
          </Box>
        ))}
      </Box>

      <Box borderStyle="round" borderColor="#8AB4F8" paddingX={1}>
        <Box marginRight={1}>
          <Text color="#8AB4F8">❯</Text>
        </Box>
        <TextInput
          value={input}
          onChange={setInput}
          onSubmit={handleSubmit}
          placeholder="Type your message or @path/to/file"
        />
      </Box>

      <StatusBar />
    </Box>
  );
};
