import type { DatabaseProvider, KeySchema, ProviderType, TableInfo } from "./types";
import { SqliteDatabase } from "./db/sqlite-provider";
import { getProviderDbPath } from "./registry";

interface MockItem {
  table: string;
  key: Record<string, string>;
  value: object;
}

const MOCK_DATA: MockItem[] = [
  { table: "movies", key: { title: "The Matrix", year: "1999" }, value: { title: "The Matrix", year: 1999, director: "Lana Wachowski", rating: 8.7, genre: ["sci-fi", "action"] } },
  { table: "movies", key: { title: "Inception", year: "2010" }, value: { title: "Inception", year: 2010, director: "Christopher Nolan", rating: 8.8, genre: ["thriller", "sci-fi"] } },
  { table: "movies", key: { title: "The Shawshank Redemption", year: "1994" }, value: { title: "The Shawshank Redemption", year: 1994, director: "Frank Darabont", rating: 9.3, genre: ["drama"] } },
  { table: "movies", key: { title: "Pulp Fiction", year: "1994" }, value: { title: "Pulp Fiction", year: 1994, director: "Quentin Tarantino", rating: 8.9, genre: ["crime", "drama"] } },
  { table: "users", key: { userId: "user-1" }, value: { userId: "user-1", name: "Alice Johnson", email: "alice@example.com", role: "admin" } },
  { table: "users", key: { userId: "user-2" }, value: { userId: "user-2", name: "Bob Smith", email: "bob@example.com", role: "viewer" } },
  { table: "users", key: { userId: "user-3" }, value: { userId: "user-3", name: "Charlie Brown", email: "charlie@example.com", role: "editor" } },
  { table: "products", key: { productId: "prod-1" }, value: { productId: "prod-1", name: "Wireless Mouse", price: 29.99, inStock: true, category: "electronics" } },
  { table: "products", key: { productId: "prod-2" }, value: { productId: "prod-2", name: "Mechanical Keyboard", price: 89.99, inStock: true, category: "electronics" } },
  { table: "products", key: { productId: "prod-3" }, value: { productId: "prod-3", name: "USB-C Hub", price: 49.99, inStock: false, category: "accessories" } },
];

export class AwsMockProvider implements DatabaseProvider {
  readonly type: ProviderType = "dynamodb";
  private db = new SqliteDatabase(getProviderDbPath("dynamodb"));

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
