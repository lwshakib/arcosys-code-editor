import React from "react";
import { Box, Text } from "ink";

export const StatusBar = () => {
  // Get current directory and replace home path with ~
  const cwd = process.cwd();
  const home = process.env.HOME || process.env.USERPROFILE || "";
  const relativeCwd = cwd.startsWith(home) ? "~" + cwd.slice(home.length) : cwd;

  const repoInfo = `${relativeCwd} (main*)`;
  const sandboxInfo = "no sandbox (see /docs)";

  return (
    <Box marginTop={1} width="100%">
      <Text color="#9aa0a6">{repoInfo}</Text>
      <Box flexGrow={1} />
      <Text color="#F28B82">{sandboxInfo}</Text>
    </Box>
  );
};
