import { describe, expect, test, beforeAll, afterAll } from "bun:test";
import { CloudflareMockProvider } from "./cloudflare-mock";
import { getProviderDbPath } from "./registry";
import Cloudflare from "cloudflare";

const TEST_TABLE = "test-table";
const TEST_KEY = { pk: "test-key" };
const TEST_VALUE = { name: "hello", count: 42 };

describe("CloudflareMockProvider", () => {
  let p: CloudflareMockProvider;

  beforeAll(async () => {
    try { Bun.spawnSync(["rm", "-f", getProviderDbPath("cloudflare-kv")]); } catch {}
    p = new CloudflareMockProvider();
    await p.connect();
  });

  afterAll(async () => {
    await p.disconnect();
  });

  test("type is set", () => {
    expect(p.type).toBe("cloudflare-kv");
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

  test("Cloudflare SDK types are compatible", () => {
    const cf = new Cloudflare({ apiToken: "test" });
    expect(cf.kv.namespaces).toBeDefined();
    expect(typeof cf.kv.namespaces.values.get).toBe("function");
    expect(typeof cf.kv.namespaces.values.update).toBe("function");
    expect(typeof cf.kv.namespaces.values.delete).toBe("function");
  });
});
