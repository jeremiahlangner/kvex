import type { DatabaseProvider, KeySchema, ProviderType, TableInfo } from "./types";
import { SqliteDatabase } from "./db/sqlite-provider";
import { getProviderDbPath } from "./registry";

export class LocalProvider implements DatabaseProvider {
  readonly type: ProviderType = "local";
  private db = new SqliteDatabase(getProviderDbPath("local"));

  async connect(): Promise<void> {
    await this.db.open();
  }

  async disconnect(): Promise<void> {
    this.db.close();
  }

  async listTables(): Promise<TableInfo[]> {
    return this.db.listTables();
  }

  async describeTable(name: string): Promise<KeySchema> {
    return this.db.describeTable(name);
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
