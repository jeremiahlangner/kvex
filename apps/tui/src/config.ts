import { type KvexConfig, DEFAULT_CONFIG } from "./providers/types";

const CONFIG_DIR = `${process.env.HOME || "/tmp"}/.kvex`;
const CONFIG_PATH = `${CONFIG_DIR}/config.json`;

export function getConfigPath(): string {
  return CONFIG_PATH;
}

export async function readConfig(): Promise<KvexConfig> {
  try {
    const file = Bun.file(CONFIG_PATH);
    if (await file.exists()) {
      const data = await file.text();
      return { ...DEFAULT_CONFIG, ...JSON.parse(data) };
    }
  } catch {
  }
  return { ...DEFAULT_CONFIG };
}

export async function writeConfig(config: KvexConfig): Promise<void> {
  const fs = await import("node:fs");
  if (!fs.existsSync(CONFIG_DIR)) {
    fs.mkdirSync(CONFIG_DIR, { recursive: true });
  }
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));
}
