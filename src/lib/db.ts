import { PrismaClient } from "@prisma/client";
import { runtimeDatabaseUrl } from "./database-url";
const globalDb = globalThis as unknown as { prisma?: PrismaClient };
const datasourceUrl = runtimeDatabaseUrl(process.env.DATABASE_URL);
export const db = globalDb.prisma ?? new PrismaClient(datasourceUrl ? { datasourceUrl } : undefined);
// Reuse across module evaluations in both production and development.
// This is per process/isolate, not a pool shared by all Vercel instances.
globalDb.prisma = db;
export const databaseConfigured = () => Boolean(process.env.DATABASE_URL);
