import { Command } from "commander";
import { wakeCommand } from "./commands/wake.ts";
import { configureCommand } from "./commands/configure.ts";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import chalk from "chalk";

const TOKEN_FILE = path.join(os.homedir(), ".arcosys", "token.json");

export class App {
  private program: Command;

  constructor() {
    this.program = new Command();
    this.setupRoutes();
  }

  private setupRoutes() {
    this.program
      .name("arcosys")
      .description("A modern CLI for Arcosys")
      .version("1.0.0");

    this.program
      .command("configure")
      .description("Configure and authenticate the CLI")
      .action(async () => {
        await configureCommand();
      });

    this.program
      .action(() => {
        if (!fs.existsSync(TOKEN_FILE)) {
          console.log(chalk.yellow("\n⚠️  You are not authenticated."));
          console.log(`Please run ${chalk.cyan("arcosys configure")} for the authentication.\n`);
          return;
        }
        wakeCommand();
      });
  }

  public async run() {
    this.program.parse(process.argv);
  }
}
