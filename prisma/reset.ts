import "dotenv/config";
import { PGlite } from "@electric-sql/pglite";

/**
 * Drops the local PGlite data directory so a fresh `prisma db push` / seed
 * can run. DEV TOOL ONLY — never run against a real database.
 */
async function main() {
  const fs = await import("node:fs/promises");
  const path = await import("node:path");
  const dir = process.env.DATABASE_DIR ?? path.join(process.cwd(), ".data", "pglite");
  await fs.rm(dir, { recursive: true, force: true });
  // eslint-disable-next-line no-console
  console.log(`Removed ${dir}`);
}

main().catch((e) => {
  // eslint-disable-next-line no-console
  console.error(e);
  process.exit(1);
});
