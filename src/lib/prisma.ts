import "server-only";
import path from "node:path";
import { mkdirSync } from "node:fs";
import { PrismaClient } from "@prisma/client";
import { PGlite } from "@electric-sql/pglite";
import { PrismaPGlite } from "pglite-prisma-adapter";
import { PrismaPg } from "@prisma/adapter-pg";

// ───────────────────────────────────────────────────────────────────────────
// Database client.
//
//  • DATABASE_URL pointing at a real (non-local) PostgreSQL → @prisma/adapter-pg
//  • Otherwise (default dev) → PGlite (embedded WASM PostgreSQL) via
//    pglite-prisma-adapter: zero infrastructure, 100% PostgreSQL-native.
// ───────────────────────────────────────────────────────────────────────────

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

function isRealRemoteDb(url: string | undefined): boolean {
  if (!url) return false;
  return !url.includes("localhost") && !url.includes("127.0.0.1");
}

function createClient(): PrismaClient {
  const dbUrl = process.env.DATABASE_URL;

  // A real, reachable database URL → connect to hosted PostgreSQL (plan §47).
  if (isRealRemoteDb(dbUrl)) {
    return new PrismaClient({
      adapter: new PrismaPg({ connectionString: dbUrl as string }),
    });
  }

  // Default: embedded PGlite.
  const dir =
    process.env.DATABASE_DIR ?? path.join(process.cwd(), ".data", "pglite");
  mkdirSync(dir, { recursive: true });
  return new PrismaClient({
    adapter: new PrismaPGlite(new PGlite({ dataDir: dir })),
  });
}

export const prisma = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
