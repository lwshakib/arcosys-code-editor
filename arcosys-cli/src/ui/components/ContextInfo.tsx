import React from "react";
import { Box, Text } from "ink";

export const ContextInfo = ({ cwd }: { cwd: string }) => {
  return (
    <Box marginBottom={1} flexDirection="column">
      <Box>
        <Text color="#9aa0a6">Using: </Text>
        <Text color="#e8eaed">1 ARCOSYS.md file</Text>
      </Box>
      <Box>
        <Text color="#9aa0a6">CWD: </Text>
        <Text color="#8AB4F8">{cwd}</Text>
      </Box>
    </Box>
  );
};
