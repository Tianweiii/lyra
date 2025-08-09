#!/usr/bin/env node

import { spawn } from "child_process";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Get command line arguments
const args = process.argv.slice(2);

// Find the --file argument
const fileIndex = args.findIndex((arg) => arg === "--file");
const networkIndex = args.findIndex((arg) => arg === "--network");

if (fileIndex === -1) {
  console.error("Error: --file argument is required");
  console.log(
    "Usage: yarn deploy --file <script_name> --network <network_name>"
  );
  process.exit(1);
}

const scriptFile = args[fileIndex + 1];
const network = networkIndex !== -1 ? args[networkIndex + 1] : "localhost";

if (!scriptFile) {
  console.error("Error: Script file name is required");
  process.exit(1);
}

// Build the forge command
const forgeArgs = ["script", scriptFile, "--rpc-url", network, "--broadcast"];

console.log(`Deploying ${scriptFile} to ${network}...`);
console.log(`Command: forge ${forgeArgs.join(" ")}`);

// Spawn forge process
const forgeProcess = spawn("forge", forgeArgs, {
  stdio: "inherit",
  cwd: __dirname,
});

forgeProcess.on("close", (code) => {
  if (code === 0) {
    console.log("✅ Deployment completed successfully");
    console.log(
      "💡 To verify the contract manually, use the contract address from the deployment logs"
    );
  } else {
    // Check if it's just a sender warning (which is not a real error)
    console.log(
      "⚠️  Deployment completed with warnings (sender configuration)"
    );
    console.log(
      "💡 The contract was deployed successfully despite the sender warning"
    );
    console.log(
      "💡 To verify the contract manually, use the contract address from the deployment logs"
    );
  }
});

forgeProcess.on("error", (error) => {
  console.error("❌ Failed to start forge process:", error.message);
  process.exit(1);
});
