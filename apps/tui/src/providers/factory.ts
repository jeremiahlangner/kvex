import type { DatabaseProvider, ProviderType } from "./types";
import { LocalProvider } from "./local-provider";
import { AwsMockProvider } from "./aws-mock";
import { CloudflareMockProvider } from "./cloudflare-mock";

export function createProvider(type: ProviderType): DatabaseProvider {
  switch (type) {
    case "dynamodb":
      return new AwsMockProvider();
    case "cloudflare-kv":
      return new CloudflareMockProvider();
    case "local":
    default:
      return new LocalProvider();
  }
}

export async function connectNewProvider(
  provider: DatabaseProvider,
): Promise<void> {
  await provider.connect();
}
