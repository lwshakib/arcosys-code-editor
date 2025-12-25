import React, { useState, useEffect } from "react";
import { Box, Text, useApp, useStdout } from "ink";
import TextInput from "ink-text-input";
import figlet from "figlet";
import gradient from "gradient-string";

// --- Custom Hook for Dimensions ---
const useStdoutDimensions = () => {
  const { stdout } = useStdout();
  const [dimensions, setDimensions] = useState({
    columns: stdout ? stdout.columns : 80,
    rows: stdout ? stdout.rows : 24,
  });

  useEffect(() => {
    if (!stdout) return;
    const handler = () => {
      setDimensions({
        columns: stdout.columns,
        rows: stdout.rows,
      });
    };

    stdout.on("resize", handler);
    return () => {
      stdout.off("resize", handler);
    };
  }, [stdout]);

  return dimensions;
};

// --- UI Components ---

const BigTitle = ({ text }: { text: string }) => {
  const [ascii, setAscii] = useState("");

  useEffect(() => {
    figlet.text(
      text,
      {
        font: "ANSI Shadow",
        horizontalLayout: "full",
        verticalLayout: "full",
      },
      (err, data) => {
        if (!err && data) {
          setAscii(data);
        }
      }
    );
  }, [text]);

  if (!ascii) return null;

  return (
    <Box marginBottom={1}>
      <Text>
        {gradient(["#4285F4", "#9B72CB", "#D96570", "#F4B400"])(ascii)}
      </Text>
    </Box>
  );
};

const Announcement = () => (
  <Box
    borderStyle="round"
    borderColor="#3c4043"
    paddingX={2}
    paddingY={0}
    flexDirection="column"
    marginBottom={1}
    width="100%"
  >
    <Box>
      <Text color="#8AB4F8">Arcosys 3 Flash </Text>
      <Text color="#D93025">and </Text>
      <Text color="#8AB4F8">Pro </Text>
      <Text color="#D93025">are now available.</Text>
    </Box>
    <Text color="#bdc1c6">Enable "Preview features" in /settings.</Text>
    <Text color="#bdc1c6">
      Learn more at{" "}
      <Text color="#8AB4F8" underline>
        https://arcosys.ai/preview-features
      </Text>
    </Text>
  </Box>
);

const Tips = () => (
  <Box flexDirection="column" marginBottom={1}>
    <Text color="#bdc1c6">Tips for getting started:</Text>
    <Text color="#bdc1c6">1. Ask questions, edit files, or run commands.</Text>
    <Text color="#bdc1c6">2. Be specific for the best results.</Text>
    <Text color="#bdc1c6">3. /help for more information.</Text>
  </Box>
);

const ContextInfo = () => (
  <Box marginBottom={1}>
    <Text color="#9aa0a6">Using: </Text>
    <Text color="#8AB4F8">1 ARCOSYS.md file</Text>
  </Box>
);

const ExitSummary = () => (
  <Box
    borderStyle="round"
    borderColor="#3c4043"
    paddingX={2}
    paddingY={1}
    flexDirection="column"
    width="100%"
  >
    <Box marginBottom={1}>
      <Text color="#F28B82">Agent powering down. Goodbye!</Text>
    </Box>

    <Box flexDirection="column" marginBottom={1}>
      <Text bold color="#e8eaed">
        Interaction Summary
      </Text>
      <Box paddingLeft={2} flexDirection="column">
        <Box>
          <Box width={20}>
            <Text color="#8AB4F8">Session ID:</Text>
          </Box>
          <Text color="#9aa0a6">01599455-8a2b-4246-8775-09b91b486caf</Text>
        </Box>
        <Box>
          <Box width={20}>
            <Text color="#8AB4F8">Tool Calls:</Text>
          </Box>
          <Text color="#9aa0a6">
            0 ( <Text color="#81c995">✓ 0</Text>{" "}
            <Text color="#F28B82">x 0</Text> )
          </Text>
        </Box>
        <Box>
          <Box width={20}>
            <Text color="#8AB4F8">Success Rate:</Text>
          </Box>
          <Text color="#F28B82">0.0%</Text>
        </Box>
      </Box>
    </Box>

    <Box flexDirection="column" marginBottom={1}>
      <Text bold color="#e8eaed">
        Performance
      </Text>
      <Box paddingLeft={2} flexDirection="column">
        <Box>
          <Box width={20}>
            <Text color="#8AB4F8">Wall Time:</Text>
          </Box>
          <Text color="#9aa0a6">15.8s</Text>
        </Box>
        <Box>
          <Box width={20}>
            <Text color="#8AB4F8">Agent Active:</Text>
          </Box>
          <Text color="#9aa0a6">4.6s</Text>
        </Box>
        <Box paddingLeft={2}>
          <Text color="#9aa0a6">» API Time:</Text>
          <Box marginLeft={2}>
            <Text color="#9aa0a6">4.6s (100.0%)</Text>
          </Box>
        </Box>
        <Box paddingLeft={2}>
          <Text color="#9aa0a6">» Tool Time:</Text>
          <Box marginLeft={2}>
            <Text color="#9aa0a6">0s (0.0%)</Text>
          </Box>
        </Box>
      </Box>
    </Box>

    <Box flexDirection="column" marginBottom={1}>
      <Text bold color="#e8eaed">
        Model Usage
      </Text>
      <Box paddingLeft={2} flexDirection="column" marginTop={1}>
        <Box
          borderStyle="single"
          borderTop={false}
          borderLeft={false}
          borderRight={false}
          borderColor="#3c4043"
        >
          <Box width={30}>
            <Text color="#8AB4F8">Model</Text>
          </Box>
          <Box width={10} justifyContent="flex-end">
            <Text color="#8AB4F8">Reqs</Text>
          </Box>
          <Box width={15} justifyContent="flex-end">
            <Text color="#8AB4F8">Input Tokens</Text>
          </Box>
          <Box width={15} justifyContent="flex-end">
            <Text color="#8AB4F8">Cache Reads</Text>
          </Box>
          <Box width={15} justifyContent="flex-end">
            <Text color="#8AB4F8">Output Tokens</Text>
          </Box>
        </Box>
        <Box>
          <Box width={30}>
            <Text color="#9aa0a6">arcosys-2.5-flash-lite</Text>
          </Box>
          <Box width={10} justifyContent="flex-end">
            <Text color="#9aa0a6">1</Text>
          </Box>
          <Box width={15} justifyContent="flex-end">
            <Text color="#9aa0a6">3,169</Text>
          </Box>
          <Box width={15} justifyContent="flex-end">
            <Text color="#9aa0a6">0</Text>
          </Box>
          <Box width={15} justifyContent="flex-end">
            <Text color="#9aa0a6">48</Text>
          </Box>
        </Box>
        <Box>
          <Box width={30}>
            <Text color="#9aa0a6">arcosys-2.5-flash</Text>
          </Box>
          <Box width={10} justifyContent="flex-end">
            <Text color="#9aa0a6">1</Text>
          </Box>
          <Box width={15} justifyContent="flex-end">
            <Text color="#9aa0a6">296</Text>
          </Box>
          <Box width={15} justifyContent="flex-end">
            <Text color="#9aa0a6">7,871</Text>
          </Box>
          <Box width={15} justifyContent="flex-end">
            <Text color="#9aa0a6">11</Text>
          </Box>
        </Box>
      </Box>
    </Box>

    <Box marginTop={1}>
      <Text color="#81c995">
        Savings Highlight: <Text bold>7,871 (69.4%)</Text> of input tokens were
        served from the cache, reducing costs.
      </Text>
    </Box>
  </Box>
);

const StatusBar = ({ columns }: { columns: number }) => {
  // Get current directory and replace home path with ~
  const cwd = process.cwd();
  const home = process.env.HOME || process.env.USERPROFILE || "";
  const relativeCwd = cwd.startsWith(home) ? "~" + cwd.slice(home.length) : cwd;

  const repoInfo = `${relativeCwd} (main*)`;
  const sandboxInfo = "no sandbox (see /docs)";
  const modelInfo = "Auto (Arcosys 2.5) /model";

  return (
    <Box marginTop={1} width="100%">
      <Text color="#9aa0a6">{repoInfo}</Text>
      <Box flexGrow={1} />
      <Text color="#F28B82">{sandboxInfo}</Text>
      <Box flexGrow={1} />
      <Text color="#9aa0a6">{modelInfo}</Text>
    </Box>
  );
};

export const App = () => {
  const { exit } = useApp();
  const dimensions = useStdoutDimensions();
  const { columns, rows } = dimensions;
  const [input, setInput] = useState("");
  const [isExiting, setIsExiting] = useState(false);
  const [messages, setMessages] = useState<
    { type: "user" | "bot"; text: string }[]
  >([]);

  const handleSubmit = (value: string) => {
    if (value.toLowerCase() === "exit" || value.toLowerCase() === "/quit") {
      setIsExiting(true);
      // Wait a bit then exit or just stay in summary mode
      // For this demo, we'll just show the summary and let user Ctrl+C or we call exit later
      return;
    }

    if (value.trim() === "") return;

    // Add user message
    const newMessages: { type: "user" | "bot"; text: string }[] = [
      ...messages,
      { type: "user", text: value },
    ];

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

      <Announcement />

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

      <StatusBar columns={columns} />
    </Box>
  );
};
