import React, { useState, useEffect } from "react";
import { Box, Text } from "ink";
import figlet from "figlet";
import gradient from "gradient-string";

interface BigTitleProps {
  text: string;
}

export const BigTitle = ({ text }: BigTitleProps) => {
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
