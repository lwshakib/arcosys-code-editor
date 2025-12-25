import React from "react";
import { Box, Text } from "ink";

export const ExitSummary = () => (
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
