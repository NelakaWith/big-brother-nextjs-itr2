#!/usr/bin/env node
// Simple CLI to emit a test log event without PM2.
// Usage: node emit_log.js <appId?> <message>
const path = require("path");
const { emitTestLog } = require(path.join(
  __dirname,
  "..",
  "src",
  "pm2LogStreamer"
));

async function main() {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.error("Usage: node emit_log.js <appId?> <message>");
    process.exit(2);
  }
  const appId = args.length > 1 ? parseInt(args[0], 10) : null;
  const message = args.length > 1 ? args.slice(1).join(" ") : args[0];

  try {
    await emitTestLog(appId, message);
    console.log("Emitted test log", { appId, message });
    process.exit(0);
  } catch (err) {
    console.error("Failed to emit test log", err);
    process.exit(1);
  }
}

main();
