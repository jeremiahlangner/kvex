import type { DatabaseProvider, KeySchema, ProviderType, TableInfo } from "./types";
import { SqliteDatabase } from "./db/sqlite-provider";
import { getProviderDbPath } from "./registry";

interface MockItem {
  table: string;
  key: Record<string, string>;
  value: object;
}

const MOCK_DATA: MockItem[] = [
  { table: "app-config", key: { key: "site_title" }, value: { key: "site_title", value: "My KV Site", type: "string", updated: "2026-06-01" } },
  { table: "app-config", key: { key: "api_url" }, value: { key: "api_url", value: "https://api.example.com", type: "string", updated: "2026-06-01" } },
  { table: "app-config", key: { key: "feature_flags" }, value: { key: "feature_flags", value: { darkMode: true, beta: false }, type: "json", updated: "2026-07-01" } },
  { table: "app-config", key: { key: "max_upload_size" }, value: { key: "max_upload_size", value: 10485760, type: "number", updated: "2026-06-15" } },
  { table: "user-preferences", key: { key: "alice" }, value: { key: "alice", theme: "dark", language: "en", notifications: true, timezone: "America/New_York" } },
  { table: "user-preferences", key: { key: "bob" }, value: { key: "bob", theme: "light", language: "en", notifications: false, timezone: "Europe/London" } },
  { table: "user-preferences", key: { key: "charlie" }, value: { key: "charlie", theme: "dark", language: "fr", notifications: true, timezone: "Europe/Paris" } },
  { table: "session-data", key: { key: "sess_abc123" }, value: { key: "sess_abc123", userId: "alice", expires: "2026-07-07", ip: "192.168.1.42" } },
  { table: "session-data", key: { key: "sess_def456" }, value: { key: "sess_def456", userId: "bob", expires: "2026-07-08", ip: "192.168.1.100" } },
];

export class CloudflareMockProvider implements DatabaseProvider {
  readonly type: ProviderType = "cloudflare-kv";
  private db = new SqliteDatabase(getProviderDbPath("cloudflare-kv"));

  async connect(): Promise<void> {
    await this.db.open();
    const tables = this.db.listTables();
    if (tables.length === 0) {
      for (const item of MOCK_DATA) {
        this.db.putItem(item.table, item.key, item.value);
      }
    }
  }

  async disconnect(): Promise<void> {
    this.db.close();
  }

  async listTables(): Promise<TableInfo[]> {
    return this.db.listTables();
  }

  async describeTable(_name: string): Promise<KeySchema> {
    return { hash: "key" };
  }

  async getItem(table: string, key: Record<string, string>): Promise<object | null> {
    return this.db.getItem(table, key);
  }

  async putItem(table: string, key: Record<string, string>, value: object): Promise<void> {
    this.db.putItem(table, key, value);
  }

  async deleteItem(table: string, key: Record<string, string>): Promise<void> {
    this.db.deleteItem(table, key);
  }

  async query(table: string, keyCondition: Record<string, string>): Promise<object[]> {
    return this.db.query(table, keyCondition);
  }

  async getKeyValues(table: string, keyName: string): Promise<string[]> {
    return this.db.getKeyValues(table, keyName);
  }
}
