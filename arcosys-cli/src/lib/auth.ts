import { createAuthClient } from "better-auth/client";
import { deviceAuthorizationClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  baseURL: process.env.ARCOSYS_BASE_URL || "http://localhost:3000",
  plugins: [deviceAuthorizationClient()],
});
