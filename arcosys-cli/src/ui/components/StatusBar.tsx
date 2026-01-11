import React from "react";
import { Box, Text } from "ink";

export const StatusBar = () => {
  return (
    <Box marginTop={1} justifyContent="space-between" width="100%">
      <Box>
        <Text color="#8AB4F8">~\\coding\\arcosys-code-editor </Text>
        <Text color="#9aa0a6">(main*)</Text>
      </Box>
      <Box>
        <Text color="#F28B82">no sandbox </Text>
        <Text color="#9aa0a6">(see /docs)</Text>
      </Box>
      <Box>
        <Text color="#D7AEFB">Auto (Arcosys 1.0) </Text>
        <Text color="#9aa0a6">/model</Text>
      </Box>
    </Box>
  );
};
