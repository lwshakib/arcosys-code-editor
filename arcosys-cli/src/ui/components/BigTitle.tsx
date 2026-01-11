import React, { useMemo } from "react";
import { Box, Text } from "ink";
import figlet from "figlet";
import gradient from "gradient-string";

interface BigTitleProps {
  text: string;
}

export const BigTitle: React.FC<BigTitleProps> = ({ text }) => {
  const gradientTitle = useMemo(() => {
    const art = figlet.textSync(text, {
      font: "ANSI Shadow",
      horizontalLayout: "full",
    });
    return gradient(["#4285F4", "#9B72CB", "#D96570"]).multiline(art);
  }, [text]);

  return (
    <Box marginBottom={1}>
      <Text>{gradientTitle}</Text>
    </Box>
  );
};
