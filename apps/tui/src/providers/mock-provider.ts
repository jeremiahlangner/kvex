import { type DatabaseProvider, type KeySchema, type ProviderType, type TableInfo } from "./types";

interface MockTableConfig {
  keySchema: KeySchema;
  items: Record<string, unknown>[];
}

interface MockData {
  tables: Record<string, MockTableConfig>;
}

const MOCK_DATA_PATH = `${process.env.HOME || "/tmp"}/.kvex/mock-data.json`;

function getMockDataPath(): string {
  return process.env.KVEX_MOCK_DATA || MOCK_DATA_PATH;
}

async function loadMockData(): Promise<MockData> {
  try {
    const path = getMockDataPath();
    const file = Bun.file(path);
    if (await file.exists()) {
      const raw = await file.text();
      return JSON.parse(raw);
    }
  } catch {
  }
  return { tables: {} };
}

async function saveMockData(data: MockData): Promise<void> {
  const path = getMockDataPath();
  const dir = path.substring(0, path.lastIndexOf("/"));
  const fs = await import("node:fs");
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(path, JSON.stringify(data, null, 2));
}

export class MockProvider implements DatabaseProvider {
  readonly type: ProviderType = "mock";
  private data: MockData = { tables: {} };

  async connect(): Promise<void> {
    this.data = await loadMockData();
  }

  async disconnect(): Promise<void> {
    await saveMockData(this.data);
  }

  async listTables(): Promise<TableInfo[]> {
    return Object.entries(this.data.tables).map(([name, config]) => ({
      name,
      keySchema: config.keySchema,
    }));
  }

  async describeTable(name: string): Promise<KeySchema> {
    const table = this.data.tables[name];
    if (!table) throw new Error(`Table "${name}" not found`);
    return table.keySchema;
  }

  async getItem(table: string, key: Record<string, string>): Promise<object | null> {
    const t = this.data.tables[table];
    if (!t) return null;
    return t.items.find((item) =>
      Object.entries(key).every(([k, v]) => String((item as any)[k]) === v)
    ) || null;
  }

  async putItem(table: string, key: Record<string, string>, value: object): Promise<void> {
    let t = this.data.tables[table];
    if (!t) {
      const keySchema: KeySchema = { hash: Object.keys(key)[0] };
      if (Object.keys(key).length > 1) {
        keySchema.range = Object.keys(key)[1];
      }
      t = { keySchema, items: [] };
      this.data.tables[table] = t;
    }
    const idx = t.items.findIndex((item) =>
      Object.entries(key).every(([k, v]) => String((item as any)[k]) === v)
    );
    if (idx >= 0) {
      t.items[idx] = { ...(t.items[idx] as any), ...value };
    } else {
      t.items.push({ ...key, ...value });
    }
    await saveMockData(this.data);
  }

  async deleteItem(table: string, key: Record<string, string>): Promise<void> {
    const t = this.data.tables[table];
    if (!t) return;
    t.items = t.items.filter((item) =>
      !Object.entries(key).every(([k, v]) => String((item as any)[k]) === v)
    );
    await saveMockData(this.data);
  }

  async query(table: string, keyCondition: Record<string, string>): Promise<object[]> {
    const t = this.data.tables[table];
    if (!t) return [];
    return t.items.filter((item) =>
      Object.entries(keyCondition).every(([k, v]) => String((item as any)[k]) === v)
    );
  }

  async getKeyValues(table: string, keyName: string): Promise<string[]> {
    const t = this.data.tables[table];
    if (!t) return [];
    const values = t.items.map((item) => String((item as any)[keyName] ?? ""));
    return [...new Set(values)].filter(Boolean);
  }
}
