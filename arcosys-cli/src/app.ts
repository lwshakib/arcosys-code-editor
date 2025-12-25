import { Command } from "commander";
import { wakeCommand } from "./commands/wake.ts";

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
      .command("wakeup")
      .description("Start the interactive assistant")
      .action(() => wakeCommand());
  }

  public async run() {
    this.program.parse(process.argv);
  }
}
