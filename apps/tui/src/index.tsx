import { createCliRenderer } from "@opentui/core";
import { createRoot } from "@opentui/react";
import { App } from "./app";
import { readConfig } from "./config";
import { cache } from "./cache";

async function main() {
  const config = await readConfig();
  await cache.init();

  const renderer = await createCliRenderer({
    exitOnCtrlC: true,
    screenMode: "alternate-screen",
    targetFps: 30,
  });

  renderer.setTerminalTitle("kvex - NoSQL KV Explorer");

  createRoot(renderer).render(<App initialConfig={config} />);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
