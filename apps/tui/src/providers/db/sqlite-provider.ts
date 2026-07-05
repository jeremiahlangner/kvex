import { Database } from "bun:sqlite";
import { type KeySchema, type TableInfo } from "../types";
import { getProviderDbPath } from "../registry";

export class SqliteDatabase {
  private db: Database | null = null;
  readonly type: string;

  constructor(type: string) {
    this.type = type;
  }

  async open(): Promise<void> {
    const path = getProviderDbPath(this.type as any);
    const dir = path.substring(0, path.lastIndexOf("/"));
    const fs = await import("node:fs");
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    this.db = new Database(path, { create: true });
    this.db.run("PRAGMA journal_mode = WAL");
    this.db.run(`
      CREATE TABLE IF NOT EXISTS tables (
        name TEXT PRIMARY KEY,
        hash_key TEXT NOT NULL,
        range_key TEXT
      )
    `);
    this.db.run(`
      CREATE TABLE IF NOT EXISTS items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        table_name TEXT NOT NULL,
        key_data TEXT NOT NULL,
        value_data TEXT NOT NULL,
        FOREIGN KEY (table_name) REFERENCES tables(name)
      )
    `);
    this.db.run(`
      CREATE INDEX IF NOT EXISTS idx_items_table_key
      ON items(table_name, key_data)
    `);
  }

  close(): void {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }

  private ensure(): Database {
    if (!this.db) throw new Error("Database not connected");
    return this.db;
  }

  listTables(): TableInfo[] {
    const rows = this.ensure()
      .query("SELECT name, hash_key, range_key FROM tables ORDER BY name")
      .all() as { name: string; hash_key: string; range_key: string | null }[];
    return rows.map((r) => ({
      name: r.name,
      keySchema: { hash: r.hash_key, ...(r.range_key ? { range: r.range_key } : {}) },
    }));
  }

  describeTable(name: string): KeySchema {
    const row = this.ensure()
      .query("SELECT hash_key, range_key FROM tables WHERE name = ?")
      .get(name) as { hash_key: string; range_key: string | null } | null;
    if (!row) throw new Error(`Table "${name}" not found`);
    return { hash: row.hash_key, ...(row.range_key ? { range: row.range_key } : {}) };
  }

  getItem(table: string, key: Record<string, string>): object | null {
    const keyStr = JSON.stringify(key);
    const row = this.ensure()
      .query("SELECT value_data FROM items WHERE table_name = ? AND key_data = ?")
      .get(table, keyStr) as { value_data: string } | null;
    return row ? JSON.parse(row.value_data) : null;
  }

  putItem(table: string, key: Record<string, string>, value: object): void {
    const db = this.ensure();
    const keyStr = JSON.stringify(key);
    const valueStr = JSON.stringify(value);

    const existing = db
      .query("SELECT id FROM items WHERE table_name = ? AND key_data = ?")
      .get(table, keyStr);

    if (existing) {
      db.run("UPDATE items SET value_data = ? WHERE table_name = ? AND key_data = ?", [
        valueStr,
        table,
        keyStr,
      ]);
    } else {
      const tableExists = db
        .query("SELECT name FROM tables WHERE name = ?")
        .get(table);
      if (!tableExists) {
        const keySchema: KeySchema = { hash: Object.keys(key)[0] };
        if (Object.keys(key).length > 1) {
          keySchema.range = Object.keys(key)[1];
        }
        db.run("INSERT INTO tables (name, hash_key, range_key) VALUES (?, ?, ?)", [
          table,
          keySchema.hash,
          keySchema.range ?? null,
        ]);
      }
      db.run(
        "INSERT INTO items (table_name, key_data, value_data) VALUES (?, ?, ?)",
        [table, keyStr, valueStr],
      );
    }
  }

  deleteItem(table: string, key: Record<string, string>): void {
    const keyStr = JSON.stringify(key);
    this.ensure().run(
      "DELETE FROM items WHERE table_name = ? AND key_data = ?",
      [table, keyStr],
    );
  }

  query(table: string, keyCondition: Record<string, string>): object[] {
    const db = this.ensure();
    const rows = db
      .query("SELECT key_data, value_data FROM items WHERE table_name = ?")
      .all(table) as { key_data: string; value_data: string }[];

    return rows
      .filter((r) => {
        const parsed = JSON.parse(r.key_data);
        return Object.entries(keyCondition).every(
          ([k, v]) => String(parsed[k]) === v,
        );
      })
      .map((r) => JSON.parse(r.value_data));
  }

  getKeyValues(table: string, keyName: string): string[] {
    const db = this.ensure();
    const rows = db
      .query("SELECT key_data FROM items WHERE table_name = ?")
      .all(table) as { key_data: string }[];

    const values = rows.map((r) => {
      const parsed = JSON.parse(r.key_data);
      return String(parsed[keyName] ?? "");
    });
    return [...new Set(values)].filter(Boolean);
  }
}
