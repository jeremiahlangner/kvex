import { type ProviderType, type ProviderInfo, getPingEndpoint, getCollectionLabel, getConnectionLabel } from "./types";

const PROVIDER_REGISTRY: ProviderInfo[] = [
  {
    name: "Local",
    type: "local",
    description: "Local SQLite database storage",
    pingEndpoint: "",
    isLocal: true,
    dbName: "local",
    collectionLabel: "Database",
    connectionLabel: "Local",
  },
  {
    name: "AWS",
    type: "dynamodb",
    description: "Amazon DynamoDB",
    pingEndpoint: getPingEndpoint("dynamodb"),
    isLocal: false,
    dbName: "aws-mock",
    collectionLabel: "Table",
    connectionLabel: "AWS",
  },
  {
    name: "Cloudflare",
    type: "cloudflare-kv",
    description: "Cloudflare Workers KV",
    pingEndpoint: getPingEndpoint("cloudflare-kv"),
    isLocal: false,
    dbName: "cloudflare-mock",
    collectionLabel: "Namespace",
    connectionLabel: "Cloudflare",
  },
];

export function getProviders(): ProviderInfo[] {
  return PROVIDER_REGISTRY;
}

export function getProviderNames(): string[] {
  return PROVIDER_REGISTRY.map((p) => p.name);
}

export function resolveProviderType(name: string): ProviderType | null {
  const found = PROVIDER_REGISTRY.find(
    (p) => p.name.toLowerCase() === name.toLowerCase(),
  );
  return found ? found.type : null;
}

export function getProviderInfo(type: ProviderType): ProviderInfo | undefined {
  return PROVIDER_REGISTRY.find((p) => p.type === type);
}

export function getProviderDbPath(type: ProviderType): string {
  const info = getProviderInfo(type);
  const dbName = info?.dbName ?? "local";
  const home = process.env.HOME || "/tmp";
  return `${home}/.kvex/db/${dbName}.db`;
}
