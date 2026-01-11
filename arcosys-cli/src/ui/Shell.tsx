import React, { useState } from "react";
import { Box, Text, useApp } from "ink";
import TextInput from "ink-text-input";
import { useStdoutDimensions } from "./hooks/useStdoutDimensions.ts";
import { BigTitle } from "./components/BigTitle";
import { Tips } from "./components/Tips";
import { ContextInfo } from "./components/ContextInfo";
import { ExitSummary } from "./components/ExitSummary";
import { StatusBar } from "./components/StatusBar";
import type { Message, AgentStep } from "../types/index.ts";
import { exec } from "node:child_process";
import fs from "node:fs";
import fsPromises from "node:fs/promises";
import path from "node:path";

export const AppUI = () => {
  const { exit } = useApp();
  const { columns, rows } = useStdoutDimensions();
  const [input, setInput] = useState("");
  const [isExiting, setIsExiting] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);

  const [cwd, setCwd] = useState(process.cwd());
  const [isProcessing, setIsProcessing] = useState(false);

  const executeTool = async (step: AgentStep, currentCwd: string): Promise<{ result: string, newCwd: string }> => {
    let newCwd = currentCwd;
    try {
      switch (step.tool) {
        case "executeCommand":
          if (step.command.startsWith("cd ")) {
            const target = step.command.slice(3).trim();
            const targetPath = path.resolve(currentCwd, target);
            if (fs.existsSync(targetPath) && fs.statSync(targetPath).isDirectory()) {
              newCwd = targetPath;
              return { result: `Directory changed to ${targetPath}`, newCwd };
            } else {
              return { result: `Error: directory not found ${targetPath}`, newCwd };
            }
          }
          return new Promise((resolve) => {
            exec(step.command, { cwd: currentCwd }, (_error, stdout, stderr) => {
              resolve({ result: `STDOUT: ${stdout.trim()}\nSTDERR: ${stderr.trim()}`, newCwd });
            });
          });
        case "writeFile":
          const writePath = path.resolve(currentCwd, step.path);
          await fsPromises.mkdir(path.dirname(writePath), { recursive: true });
          await fsPromises.writeFile(writePath, step.content);
          return { result: `File written to ${step.path}`, newCwd };
        case "readFile":
          const content = await fsPromises.readFile(path.resolve(currentCwd, step.path), "utf-8");
          return { result: `File content of ${step.path}:\n${content}`, newCwd };
        case "deleteFile":
          await fsPromises.unlink(path.resolve(currentCwd, step.path));
          return { result: `File ${step.path} deleted`, newCwd };
        case "replaceFileContent":
          const filePath = path.resolve(currentCwd, step.path);
          const fileContent = await fsPromises.readFile(filePath, "utf-8");
          if (!fileContent.includes(step.oldContent)) {
            return { result: `Error: Could not find exact content to replace in ${step.path}`, newCwd };
          }
          const updated = fileContent.replace(step.oldContent, step.newContent);
          await fsPromises.writeFile(filePath, updated);
          return { result: `Content replaced in ${step.path}`, newCwd };
        default:
          return { result: "Unknown tool", newCwd };
      }
    } catch (e: any) {
      return { result: `Error: ${e?.message || String(e)}`, newCwd };
    }
  };

  const handleSubmit = async (value: string) => {
    if (value.toLowerCase() === "exit" || value.toLowerCase() === "/quit") {
      setIsExiting(true);
      return;
    }

    if (value.trim() === "" || isProcessing) return;

    setIsProcessing(true);
    setInput("");

    // Start with user message
    const currentMessages: Message[] = [
      ...messages,
      { type: "user", text: value, role: "user" }
    ];
    setMessages([...currentMessages]);

    let active = true;
    let localCwd = cwd;

    while (active) {
      try {
        const response = await fetch("http://localhost:3000/api/agent/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: currentMessages.map(m => ({ role: m.role || (m.type === "user" ? "user" : "assistant"), content: m.text })),
            cwd: localCwd
          }),
        });

        if (!response.ok) {
          const error = await response.json() as { error?: string };
          setMessages(prev => [...prev, { type: "bot", text: `API Error: ${error.error || response.statusText}` }]);
          break;
        }

        const step = (await response.json()) as AgentStep;

        // Add thought/action to UI
        if (step.thought) {
          setMessages(prev => [...prev, { type: "thought", text: step.thought, role: "assistant" }]);
        }
        
        // Push the full response to history for the AI
        currentMessages.push({ type: "bot", text: JSON.stringify(step), role: "assistant" });

        if (step.tool === "end") {
          setMessages(prev => [...prev, { type: "bot", text: "Task completed.", role: "assistant" }]);
          active = false;
        } else if (step.tool === "talk") {
          setMessages(prev => [...prev, { type: "bot", text: step.text, role: "assistant" }]);
          active = false; // Conversations end the current turn usually
        } else {
          // Add status message
          let statusText = "";
          let statusType: "create" | "analyze" | "run" | "delete" = "run";
          
          if (step.tool === "writeFile") {
            statusText = `Creating file: ${step.path}`;
            statusType = "create";
          } else if (step.tool === "readFile") {
            statusText = `Analyzing file: ${step.path}`;
            statusType = "analyze";
          } else if (step.tool === "executeCommand") {
            statusText = `Running command: ${step.command}`;
            statusType = "run";
          } else if (step.tool === "deleteFile") {
            statusText = `Deleting file: ${step.path}`;
            statusType = "delete";
          } else if (step.tool === "replaceFileContent") {
            statusText = `Updating file: ${step.path}`;
            statusType = "create";
          }

          if (statusText) {
            setMessages(prev => [...prev, { type: "status", text: statusText, statusType }]);
          }

          // Execute tool
          const { result, newCwd } = await executeTool(step, localCwd);
          if (newCwd !== localCwd) {
            localCwd = newCwd;
            setCwd(newCwd);
          }

          // Truncate result if it's too long to avoid token issues while keeping essential info
          const truncatedResult = result.length > 2000 ? result.slice(0, 1000) + "\n... (truncated)" + result.slice(-500) : result;
          currentMessages.push({ type: "tool-result", text: truncatedResult, role: "user" });
        }
      } catch (e: any) {
        const errorMsg = e?.response?.error || e?.message || String(e);
        const errorDetails = e?.response?.details || "";
        setMessages(prev => [...prev, { type: "bot", text: `Error: ${errorMsg}${errorDetails ? `\nDetails: ${errorDetails}` : ""}` }]);
        active = false;
      }
    }

    setIsProcessing(false);
  };

  if (isExiting) {
    return (
      <Box
        flexDirection="column"
        paddingX={4}
        paddingY={1}
        minHeight={rows}
        width={columns}
      >
        <BigTitle text="ARCOSYS" />
        <Tips />
        <Box flexDirection="column" marginY={1} flexGrow={1}>
          {messages.map((msg, index) => (
            <Box key={`msg-exit-${index}`} marginBottom={1}>
              {msg.type === "user" ? (
                <Box>
                  <Text color="#e8eaed" bold>{"> "}</Text>
                  <Text color="#e8eaed">{msg.text}</Text>
                </Box>
              ) : (
                <Box>
                  <Text color="#9B72CB">✦ </Text>
                  <Text color="#e8eaed">{msg.text}</Text>
                </Box>
              )}
            </Box>
          ))}
          <Box>
            <Text color="#e8eaed" bold>{"> "}</Text>
            <Text color="#e8eaed">/quit</Text>
          </Box>
        </Box>
        <ExitSummary />
      </Box>
    );
  }

  return (
    <Box
      flexDirection="column"
      paddingX={4}
      paddingY={1}
      minHeight={rows}
      width={columns}
    >
      <BigTitle text="ARCOSYS" />

      <Box marginTop={-1}>
        <Tips />
      </Box>

      <ContextInfo cwd={cwd} />

      <Box flexDirection="column" flexGrow={1} marginY={1}>
        {messages.map((msg, index) => (
          <Box key={`msg-${index}`} marginBottom={1}>
            {msg.type === "user" ? (
              <Box>
                <Text color="#e8eaed" bold>{"> "}</Text>
                <Text color="#e8eaed">{msg.text}</Text>
              </Box>
            ) : msg.type === "thought" ? (
              <Box>
                <Text color="#9B72CB">💭 </Text>
                <Text color="#9B72CB" italic>{msg.text}</Text>
              </Box>
            ) : msg.type === "tool-result" ? (
              // Hide internal tool results unless they are errors
              msg.text.startsWith("Error") ? (
                <Box>
                  <Text color="#FF5252">❌ </Text>
                  <Text color="#FF8A80">{msg.text}</Text>
                </Box>
              ) : null
            ) : msg.type === "status" ? (
              <Box>
                <Text color={
                  msg.statusType === "create" ? "#4CAF50" : 
                  msg.statusType === "analyze" ? "#2196F3" : 
                  msg.statusType === "run" ? "#FFC107" : "#F44336"
                }>
                  {msg.statusType === "create" ? "✚ " : 
                   msg.statusType === "analyze" ? "🔍 " : 
                   msg.statusType === "run" ? "⚙ " : "✂ "}
                </Text>
                <Text color="#B0BEC5">{msg.text}</Text>
              </Box>
            ) : (
              <Box>
                <Text color="#9B72CB">✦ </Text>
                <Text color="#e8eaed">{msg.text}</Text>
              </Box>
            )}
          </Box>
        ))}
      </Box>

      <Box 
        borderStyle="round" 
        borderColor="#8AB4F8" 
        paddingX={1}
        width="100%"
      >
        <Box marginRight={1}>
          <Text color="#8AB4F8">❯</Text>
        </Box>
        <TextInput
          value={input}
          onChange={setInput}
          onSubmit={handleSubmit}
          placeholder={isProcessing ? "Processing..." : "Type your message or @path/to/file"}
        />
      </Box>

      <StatusBar />
    </Box>
  );
};
