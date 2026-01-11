import React from "react";
import { render } from "ink";
import { AppUI } from "../ui/Shell.tsx";

export const wakeCommand = () => {
  process.stdout.write("\x1Bc"); // Clear scrollback buffer
  render(React.createElement(AppUI));
};
