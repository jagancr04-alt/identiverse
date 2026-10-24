// Each serverless instance has its own pool. Keep the initial pool small;
// a shared provider pooler is still needed when instance concurrency grows.
export function runtimeDatabaseUrl(value: string | undefined): string | undefined {
  if (!value) return undefined;
  const url = new URL(value);
  if (url.protocol !== "postgres:" && url.protocol !== "postgresql:") return value;
  if (!url.searchParams.has("connection_limit")) url.searchParams.set("connection_limit", "1");
  if (!url.searchParams.has("pool_timeout")) url.searchParams.set("pool_timeout", "20");
  return url.toString();
}
