#!/usr/bin/env bun
import React from "react";
import { render } from "ink";
import { Command } from "commander";
import { App } from "./ui.tsx";

const program = new Command();

// --- Command Logic ---

program
  .name("arcosys")
  .description("A modern CLI for Arcosys")
  .version("1.0.0");

program
  .command("wakeup")
  .description("Start the interactive assistant")
  .action(() => {
    process.stdout.write("\x1Bc"); // Clear scrollback buffer as well
    render(React.createElement(App));
  });

program.parse();
