import { Database } from "bun:sqlite";
import MiniSearch from "minisearch";
import { type CachedObject } from "./providers/types";

const CACHE_DIR = `${process.env.HOME || "/tmp"}/.kvex`;
const CACHE_PATH = `${CACHE_DIR}/cache.sqlite`;

class KvexCacheImpl {
  private db: Database | null = null;
  private search: MiniSearch | null = null;
  private _ready = false;

  get ready(): boolean {
    return this._ready;
  }

  async init(): Promise<void> {
    const fs = await import("node:fs");
    if (!fs.existsSync(CACHE_DIR)) {
      fs.mkdirSync(CACHE_DIR, { recursive: true });
    }

    this.db = new Database(CACHE_PATH, { create: true });
    this.db.run("PRAGMA journal_mode = WAL");
    this.db.run(`
      CREATE TABLE IF NOT EXISTS cached_objects (
        id TEXT PRIMARY KEY,
        provider TEXT NOT NULL,
        table_name TEXT NOT NULL,
        key_data TEXT NOT NULL,
        value_data TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at TEXT NOT NULL DEFAULT (datetime('now'))
      )
    `);
    this.db.run(`
      CREATE INDEX IF NOT EXISTS idx_cache_provider_table
      ON cached_objects(provider, table_name)
    `);

    this.search = new MiniSearch({
      fields: ["key", "value"],
      storeFields: ["id", "key", "value"],
      searchOptions: {
        fuzzy: 0.2,
        prefix: true,
      },
    });

    const rows = this.db.query("SELECT * FROM cached_objects").all() as CachedObject[];
    const docs = rows.map((row) => ({
      id: row.id,
      key: row.key_data,
      value: row.value_data,
    }));
    if (docs.length > 0) {
      this.search.addAll(docs);
    }
    this._ready = true;
  }

  private ensureReady(): void {
    if (!this._ready || !this.db || !this.search) throw new Error("Cache not initialized");
  }

  put(provider: string, table: string, key: Record<string, string>, value: object): void {
    this.ensureReady();
    const id = `${provider}:${table}:${JSON.stringify(key)}`;
    const keyStr = JSON.stringify(key);
    const valueStr = JSON.stringify(value);
    const now = new Date().toISOString();

    const existing = this.db!.query("SELECT id FROM cached_objects WHERE id = ?").get(id);
    if (existing) {
      this.db!.run(
        "UPDATE cached_objects SET value_data = ?, updated_at = ? WHERE id = ?",
        [valueStr, now, id]
      );
    } else {
      this.db!.run(
        "INSERT INTO cached_objects (id, provider, table_name, key_data, value_data, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [id, provider, table, keyStr, valueStr, now, now]
      );
    }

    try { this.search!.remove({ id } as any); } catch {}
    this.search!.add({ id, key: keyStr, value: valueStr });
  }

  remove(provider: string, table: string, key: Record<string, string>): void {
    this.ensureReady();
    const id = `${provider}:${table}:${JSON.stringify(key)}`;
    this.db!.run("DELETE FROM cached_objects WHERE id = ?", [id]);
    try { this.search!.remove({ id } as any); } catch {}
  }

  searchQuery(query: string): { id: string; key: string; value: string; score: number }[] {
    this.ensureReady();
    if (!query.trim()) return [];
    const results = this.search!.search(query);
    return results.map((r: any) => ({
      id: r.id as string,
      key: r.key as string,
      value: r.value as string,
      score: r.score as number,
    }));
  }

  get(provider: string, table: string, key: Record<string, string>): CachedObject | null {
    this.ensureReady();
    const id = `${provider}:${table}:${JSON.stringify(key)}`;
    return this.db!.query("SELECT * FROM cached_objects WHERE id = ?").get(id) as CachedObject | null;
  }

  getAll(): CachedObject[] {
    this.ensureReady();
    return this.db!.query("SELECT * FROM cached_objects ORDER BY updated_at DESC").all() as CachedObject[];
  }

  close(): void {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
    this._ready = false;
  }
}

export const cache = new KvexCacheImpl();
