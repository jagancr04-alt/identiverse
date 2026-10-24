import nextEnv from "@next/env";
import fs from "node:fs";
import { parseEnv } from "node:util";
const names = ["DATABASE_URL", "AUTH_SECRET", "AUTH_URL", "NEXT_PUBLIC_SITE_URL", "AUTH_MICROSOFT_ENTRA_ID_ID", "AUTH_MICROSOFT_ENTRA_ID_SECRET", "AUTH_MICROSOFT_ENTRA_ID_ISSUER"];
const inherited = Object.fromEntries(names.map(key => [key, process.env[key]]));
const { combinedEnv, loadedEnvFiles } = nextEnv.loadEnvConfig(process.cwd(), true, { info() {}, error() {} });
const base = fs.existsSync(".env") ? parseEnv(fs.readFileSync(".env", "utf8")) : {};
console.log("Environment files loaded in precedence order:", loadedEnvFiles.map(f => f.path).join(", ") || "none");
for (const key of names) {
  const actual = combinedEnv[key];
  const source = inherited[key] !== undefined ? "inherited shell environment" : loadedEnvFiles.find(file => file.env && Object.hasOwn(file.env, key))?.path || "not configured";
  console.log(JSON.stringify({ setting: key, present: !!actual, source, differsFromDotEnv: base[key] !== undefined && actual !== base[key], surroundingWhitespace: !!actual && actual !== actual.trim() }));
}
const issuer = combinedEnv.AUTH_MICROSOFT_ENTRA_ID_ISSUER || "";
console.log("Issuer format valid:", /^https:\/\/login\.microsoftonline\.com\/[0-9a-f-]{36}\/v2\.0$/i.test(issuer));
console.log("AUTH_URL and NEXT_PUBLIC_SITE_URL match:", combinedEnv.AUTH_URL === combinedEnv.NEXT_PUBLIC_SITE_URL);
console.log("Restart Next.js after changing configuration. Detailed flow logs use the [admin-auth] prefix.");
