// ───────────────────────────────────────────────────────────────────────────
// Prisma configuration.
//
//  • `engine: "js"` — use the JavaScript/WASM Schema Engine for Prisma CLI
//    commands (db push, migrate diff, …). This means NO native schema-engine
//    binary download is required (important for locked-down build nodes).
//  • `adapter`    — the PGlite driver adapter the JS Schema Engine connects
//    through. PGlite is an embedded, pure-WASM PostgreSQL: the app therefore
//    runs against a real PostgreSQL-compatible engine with zero infrastructure.
//
// In production, point DATABASE_URL at a hosted PostgreSQL and pass
// @prisma/adapter-pg to PrismaClient (see src/lib/prisma.ts).
// ───────────────────────────────────────────────────────────────────────────
import path from "node:path";
import { fileURLToPath } from "node:url";
import { mkdir } from "node:fs/promises";
import { defineConfig } from "prisma/config";
import "dotenv/config";
import { PGlite } from "@electric-sql/pglite";
import { PrismaPGlite } from "pglite-prisma-adapter";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function dataDir() {
  return process.env.DATABASE_DIR ?? path.join(__dirname, ".data", "pglite");
}

async function makeAdapter() {
  await mkdir(dataDir(), { recursive: true });
  const client = new PGlite({ dataDir: dataDir() });
  await client.waitReady;
  return new PrismaPGlite(client);
}

export default defineConfig({
  schema: path.join(__dirname, "prisma", "schema.prisma"),
  migrations: {
    path: path.join(__dirname, "prisma", "migrations"),
    seed: "tsx prisma/seed.ts",
  },
  experimental: {
    adapter: true,
    studio: true,
  },
  engine: "js",
  adapter: makeAdapter,
  studio: {
    adapter: makeAdapter,
  },
});
