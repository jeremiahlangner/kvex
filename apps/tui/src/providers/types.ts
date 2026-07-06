export type ProviderType = "local" | "dynamodb" | "cloudflare-kv";

export interface KeySchema {
  hash: string;
  range?: string;
}

export interface TableInfo {
  name: string;
  keySchema: KeySchema;
}

export interface DatabaseProvider {
  readonly type: ProviderType;
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  listTables(): Promise<TableInfo[]>;
  describeTable(name: string): Promise<KeySchema>;
  getItem(table: string, key: Record<string, string>): Promise<object | null>;
  putItem(table: string, key: Record<string, string>, value: object): Promise<void>;
  deleteItem(table: string, key: Record<string, string>): Promise<void>;
  query(table: string, keyCondition: Record<string, string>): Promise<object[]>;
  getKeyValues(table: string, keyName: string): Promise<string[]>;
}

export interface KvexConfig {
  editor: string;
  activeProvider: ProviderType;
  theme: string;
}

export const DEFAULT_CONFIG: KvexConfig = {
  editor: "vim",
  activeProvider: "local",
  theme: "default",
};

export interface ConfirmDialog {
  message: string;
  onConfirm: () => void;
}

export interface CachedObject {
  id: string;
  provider: string;
  table_name: string;
  key_data: string;
  value_data: string;
  created_at: string;
  updated_at: string;
}

export type ConnectionStatus = "disconnected" | "connecting" | "connected" | "error";

export type ConnectivityState = "local" | "online" | "offline";

export interface ProviderInfo {
  name: string;
  type: ProviderType;
  description: string;
  pingEndpoint: string;
  isLocal: boolean;
  dbName: string;
  collectionLabel: string;
  connectionLabel: string;
}

export function getCollectionLabel(type: ProviderType): string {
  switch (type) {
    case "dynamodb": return "Table";
    case "cloudflare-kv": return "Namespace";
    default: return "Database";
  }
}

export function getPingEndpoint(type: ProviderType): string {
  switch (type) {
    case "dynamodb": return "https://dynamodb.us-east-1.amazonaws.com";
    case "cloudflare-kv": return "https://1.1.1.1";
    default: return "";
  }
}

export function getConnectionLabel(type: ProviderType): string {
  switch (type) {
    case "dynamodb": return "AWS";
    case "cloudflare-kv": return "Cloudflare";
    default: return "Local";
  }
}

export function getKeyLabel(type: ProviderType, hashKey: string): string {
  if (type === "cloudflare-kv") return "Key";
  return `Primary Key (${hashKey})`;
}

export function getSortKeyLabel(_type: ProviderType, rangeKey: string): string {
  return `Sort Key (${rangeKey})`;
}
