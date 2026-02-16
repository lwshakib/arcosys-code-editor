import { authClient } from "../lib/auth.ts";
import open from "open";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import chalk from "chalk";

const CONFIG_DIR = path.join(os.homedir(), ".arcosys-cli");
const TOKEN_FILE = path.join(CONFIG_DIR, "token.json");

export async function configureCommand() {
  console.log(chalk.cyan("\n🔐 Arcosys Device Authorization"));
  console.log(chalk.dim("⏳ Requesting device authorization...\n"));

  try {
    const { data, error } = await authClient.device.code({
      client_id: "arcosys-cli",
      scope: "openid profile email",
    });

    if (error || !data) {
      console.error(chalk.red("❌ Error requesting device code:"), error?.error_description || "Unknown error");
      return;
    }

    const {
      device_code,
      user_code,
      verification_uri,
      verification_uri_complete,
      interval = 5,
    } = data;

    console.log(chalk.yellow("📱 Device Authorization in Progress"));
    console.log(`Please visit: ${chalk.bold.underline(verification_uri)}`);
    console.log(`Enter code: ${chalk.bold.green(user_code)}\n`);

    const urlToOpen = verification_uri_complete || verification_uri;
    console.log(chalk.blue("🌐 Opening browser..."));
    await open(urlToOpen);

    console.log(chalk.dim(`⏳ Waiting for authorization... (polling every ${interval}s)`));

    await pollForToken(device_code, interval);
  } catch (err: any) {
    console.error(chalk.red("❌ Error:"), err.message);
  }
}

async function pollForToken(deviceCode: string, interval: number) {
  let pollingInterval = interval;
  
  return new Promise<void>((resolve) => {
    const poll = async () => {
      try {
        const { data, error } = await authClient.device.token({
          grant_type: "urn:ietf:params:oauth:grant-type:device_code",
          device_code: deviceCode,
          client_id: "arcosys-cli",
        });
        
        if (data?.access_token) {
          console.log(chalk.green("\n✅ Authorization Successful!"));
          
          let sessionToken = data.access_token;
          
          // Try to get the actual session token if available
          try {
            const { data: sessionData } = await authClient.getSession({
              fetchOptions: {
                headers: {
                  Authorization: `Bearer ${data.access_token}`,
                },
              },
            });
            
            if (sessionData?.session?.token) {
              sessionToken = sessionData.session.token;
            }
          } catch (e) {
            // Fallback to access_token if session fetch fails
          }

          // Save the token
          if (!fs.existsSync(CONFIG_DIR)) {
            fs.mkdirSync(CONFIG_DIR, { recursive: true });
          }
          
          fs.writeFileSync(TOKEN_FILE, JSON.stringify({
            sessionToken: sessionToken,
            expiresAt: data.expires_in ? Date.now() + (data.expires_in * 1000) : null,
          }, null, 2));

          console.log(chalk.dim(`Session token saved to ${TOKEN_FILE}`));
          resolve();
          process.exit(0);
        } else if (error) {
          switch (error.error) {
            case "authorization_pending":
              // Continue polling
              break;
            case "slow_down":
              pollingInterval += 5;
              console.log(chalk.yellow(`\n⚠️  Slowing down polling to ${pollingInterval}s`));
              break;
            case "access_denied":
              console.error(chalk.red("\n❌ Access was denied by the user"));
              process.exit(1);
              break;
            case "expired_token":
              console.error(chalk.red("\n❌ The device code has expired. Please try again."));
              process.exit(1);
              break;
            default:
              console.error(chalk.red("\n❌ Error:"), error.error_description);
              process.exit(1);
          }
        }
      } catch (err: any) {
        console.error(chalk.red("\n❌ Network error:"), err.message);
        process.exit(1);
      }
      
      setTimeout(poll, pollingInterval * 1000);
    };
    
    setTimeout(poll, pollingInterval * 1000);
  });
}
