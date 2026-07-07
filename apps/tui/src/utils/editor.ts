import { type DatabaseProvider } from "../providers/types";

export async function editInEditor(
  renderer: { suspend: () => void; resume: () => void },
  editor: string,
  item: object,
  provider: DatabaseProvider,
  table: string,
  key: Record<string, string>,
  onSave: (savedItem: object) => void,
): Promise<void> {
  const tmpPath = `/tmp/kvex-edit-${Date.now()}.json`;
  try {
    const json = JSON.stringify(item, null, 2);
    await Bun.write(tmpPath, json);

    renderer.suspend();

    const proc = Bun.spawnSync([editor, tmpPath], {
      stdin: "inherit",
      stdout: "inherit",
      stderr: "inherit",
      env: { ...process.env },
    });

    renderer.resume();

    if (proc.exitCode !== 0) {
      throw new Error(`Editor exited with code ${proc.exitCode}`);
    }

    const newContent = await Bun.file(tmpPath).text();
    let newItem: object;
    try {
      newItem = JSON.parse(newContent);
    } catch {
      throw new Error("Invalid JSON after edit. Changes not saved.");
    }

    const oldStr = JSON.stringify(item);
    const newStr = JSON.stringify(newItem);
    if (newStr !== oldStr) {
      await provider.putItem(table, key, newItem);
      onSave(newItem);
    }
  } finally {
    try { await Bun.write(tmpPath, ""); } catch {}
    try { const fs = await import("node:fs"); fs.unlinkSync(tmpPath); } catch {}
  }
}
