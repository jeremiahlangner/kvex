import { describe, expect, test } from "bun:test";
import { LocalProvider } from "./local-provider";
import { AwsMockProvider } from "./aws-mock";
import { CloudflareMockProvider } from "./cloudflare-mock";
import { createProvider } from "./factory";
import { getConnectionLabel, getPingEndpoint, getCollectionLabel } from "./types";
import { getProviderNames, resolveProviderType } from "./registry";

describe("Provider factory", () => {
  test("createProvider creates correct types", () => {
    expect(createProvider("local")).toBeInstanceOf(LocalProvider);
    expect(createProvider("dynamodb")).toBeInstanceOf(AwsMockProvider);
    expect(createProvider("cloudflare-kv")).toBeInstanceOf(CloudflareMockProvider);
  });
});

describe("Provider registry", () => {
  test("getProviderNames returns display names", () => {
    const names = getProviderNames();
    expect(names).toContain("Local");
    expect(names).toContain("AWS");
    expect(names).toContain("Cloudflare");
  });

  test("resolveProviderType maps names to types", () => {
    expect(resolveProviderType("AWS")).toBe("dynamodb");
    expect(resolveProviderType("Cloudflare")).toBe("cloudflare-kv");
    expect(resolveProviderType("Local")).toBe("local");
    expect(resolveProviderType("unknown")).toBeNull();
  });
});

describe("Provider utility functions", () => {
  test("getConnectionLabel returns display labels", () => {
    expect(getConnectionLabel("local")).toBe("Local");
    expect(getConnectionLabel("dynamodb")).toBe("AWS");
    expect(getConnectionLabel("cloudflare-kv")).toBe("Cloudflare");
  });

  test("getPingEndpoint returns correct URLs", () => {
    expect(getPingEndpoint("local")).toBe("");
    expect(getPingEndpoint("dynamodb")).toBe("https://dynamodb.us-east-1.amazonaws.com");
    expect(getPingEndpoint("cloudflare-kv")).toBe("https://1.1.1.1");
  });

  test("getCollectionLabel returns correct labels", () => {
    expect(getCollectionLabel("local")).toBe("Database");
    expect(getCollectionLabel("dynamodb")).toBe("Table");
    expect(getCollectionLabel("cloudflare-kv")).toBe("Namespace");
  });
});
