import { describe, expect, test, beforeAll, afterAll } from "bun:test";
import { LocalProvider } from "../../src/providers/local-provider";
import { AwsMockProvider } from "../../src/providers/aws-mock";
import { CloudflareMockProvider } from "../../src/providers/cloudflare-mock";
import { createProvider } from "../../src/providers/factory";
import { getConnectionLabel, getPingEndpoint, getCollectionLabel } from "../../src/providers/types";
import { getProviderNames, resolveProviderType, getProviderDbPath } from "../../src/providers/registry";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
import Cloudflare from "cloudflare";

const TEST_TABLE = "test-table";
const TEST_KEY = { pk: "test-key" };
const TEST_VALUE = { name: "hello", count: 42 };

function runProviderTests(name: string, provider: () => LocalProvider | AwsMockProvider | CloudflareMockProvider) {
  describe(name, () => {
    let p: ReturnType<typeof provider>;

    beforeAll(async () => {
      p = provider();
      try { Bun.spawnSync(["rm", "-f", getProviderDbPath(p.type)]); } catch {}
      await p.connect();
    });

    afterAll(async () => {
      await p.disconnect();
    });

    test("type is set", () => {
      expect(p.type).toBeTruthy();
    });

    test("listTables returns empty initially", async () => {
      const tables = await p.listTables();
      expect(tables).toEqual([]);
    });

    test("putItem creates table and inserts item", async () => {
      await p.putItem(TEST_TABLE, TEST_KEY, TEST_VALUE);
      const tables = await p.listTables();
      expect(tables.length).toBe(1);
      expect(tables[0].name).toBe(TEST_TABLE);
    });

    test("describeTable returns schema", async () => {
      const schema = await p.describeTable(TEST_TABLE);
      expect(schema.hash).toBeTruthy();
    });

    test("getItem returns stored item", async () => {
      const item = await p.getItem(TEST_TABLE, TEST_KEY);
      expect(item).not.toBeNull();
      expect(item).toMatchObject(TEST_VALUE);
    });

    test("getItem returns null for missing key", async () => {
      const item = await p.getItem(TEST_TABLE, { pk: "nonexistent" });
      expect(item).toBeNull();
    });

    test("putItem updates existing item", async () => {
      await p.putItem(TEST_TABLE, TEST_KEY, { name: "updated", count: 99 });
      const item = await p.getItem(TEST_TABLE, TEST_KEY);
      expect(item).toMatchObject({ name: "updated", count: 99 });
    });

    test("query filters by key condition", async () => {
      await p.putItem(TEST_TABLE, { pk: "query-a" }, { val: 1 });
      await p.putItem(TEST_TABLE, { pk: "query-b" }, { val: 2 });
      const results = await p.query(TEST_TABLE, { pk: "query-a" });
      expect(results.length).toBe(1);
      expect(results[0]).toMatchObject({ val: 1 });
    });

    test("getKeyValues returns distinct key values", async () => {
      const values = await p.getKeyValues(TEST_TABLE, "pk");
      expect(values).toContain("test-key");
      expect(values).toContain("query-a");
      expect(values).toContain("query-b");
    });

    test("deleteItem removes item", async () => {
      await p.deleteItem(TEST_TABLE, { pk: "query-a" });
      const item = await p.getItem(TEST_TABLE, { pk: "query-a" });
      expect(item).toBeNull();
    });
  });
}

runProviderTests("LocalProvider", () => new LocalProvider());
runProviderTests("AwsMockProvider", () => new AwsMockProvider());
runProviderTests("CloudflareMockProvider", () => new CloudflareMockProvider());

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

describe("SDK type compatibility", () => {
  test("DynamoDB mock items can be marshalled", () => {
    const item = { pk: "test", name: "hello", count: 42, active: true };
    const marshalled = marshall(item);
    expect(marshalled.pk.S).toBe("test");
    expect(marshalled.name.S).toBe("hello");
    expect(marshalled.count.N).toBe("42");
    expect(marshalled.active.BOOL).toBe(true);
    const unmarshalled = unmarshall(marshalled);
    expect(unmarshalled).toMatchObject(item);
  });

  test("Cloudflare SDK types are compatible", () => {
    const cf = new Cloudflare({ apiToken: "test" });
    expect(cf.kv.namespaces).toBeDefined();
    expect(typeof cf.kv.namespaces.values.get).toBe("function");
    expect(typeof cf.kv.namespaces.values.update).toBe("function");
    expect(typeof cf.kv.namespaces.values.delete).toBe("function");
  });
});
