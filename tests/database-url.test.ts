import { test } from "node:test";
import assert from "node:assert/strict";
import { runtimeDatabaseUrl } from "../src/lib/database-url";
test("serverless pools default to one connection while retaining SSL and credentials", () => {
  const result = new URL(runtimeDatabaseUrl("postgres://user:example%40password@example.com:5432/database?sslmode=require")!);
  assert.equal(result.searchParams.get("connection_limit"), "1");
  assert.equal(result.searchParams.get("pool_timeout"), "20");
  assert.equal(result.searchParams.get("sslmode"), "require");
  assert.equal(result.password, "example%40password");
  assert.equal(result.pathname, "/database");
});
test("explicit pooler and pool-size settings are preserved", () => {
  const result = new URL(runtimeDatabaseUrl("postgresql://user:example@example.com/db?pgbouncer=true&connection_limit=2&pool_timeout=30")!);
  assert.equal(result.searchParams.get("pgbouncer"), "true");
  assert.equal(result.searchParams.get("connection_limit"), "2");
  assert.equal(result.searchParams.get("pool_timeout"), "30");
  assert.equal(runtimeDatabaseUrl(undefined), undefined);
});
