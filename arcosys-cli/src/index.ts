import { App } from "./app.ts";

async function bootstrap() {
  try {
    // 1. Load env (if any)

    // 2. Initialize app context

    // 3. Start app
    const app = new App();
    await app.run();
  } catch (error) {
    console.error("Failed to bootstrap Arcosys CLI:", error);
    process.exit(1);
  }
}

bootstrap();
