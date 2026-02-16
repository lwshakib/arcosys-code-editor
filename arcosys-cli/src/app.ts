import { Command } from "commander";
import { wakeCommand } from "./commands/wake.ts";
import { configureCommand } from "./commands/configure.ts";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import chalk from "chalk";

const CONFIG_DIR = path.join(os.homedir(), ".arcosys-cli");
const TOKEN_FILE = path.join(CONFIG_DIR, "token.json");

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
      .action(async () => {
        if (!fs.existsSync(TOKEN_FILE)) {
          console.log(chalk.yellow("\n⚠️  You are not authenticated."));
          console.log(`Please run ${chalk.cyan("arcosys configure")} for the authentication.\n`);
          return;
        }

        try {
          const tokenData = JSON.parse(fs.readFileSync(TOKEN_FILE, "utf-8"));
          const { sessionToken, expiresAt } = tokenData;

          if (!sessionToken) {
            throw new Error("No session token found");
          }

          // Check if token has expired locally
          if (expiresAt && Date.now() > expiresAt) {
            console.log(chalk.red("\n❌ Session expired."));
            console.log(`Please run ${chalk.cyan("arcosys configure")} to re-authenticate.\n`);
            return;
          }

          wakeCommand(sessionToken);
        } catch (error) {
          console.log(chalk.red("\n❌ Authentication error."));
          console.log(`Please run ${chalk.cyan("arcosys configure")} for the authentication.\n`);
        }
      });
  }

  public async run() {
    this.program.parse(process.argv);
  }
}
