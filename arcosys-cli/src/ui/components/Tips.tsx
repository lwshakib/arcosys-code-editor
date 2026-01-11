import React from "react";
import { Box, Text } from "ink";

export const Tips = () => {
  return (
    <Box flexDirection="column" marginBottom={1}>
      <Text color="#9aa0a6" italic>
        Tips: Use @path/to/file to include context. Type /quit to exit.
      </Text>
    </Box>
  );
};
