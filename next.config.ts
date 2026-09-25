import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },
  // PGlite (embedded WASM Postgres) loads its own .wasm resources relative to
  // its package directory via import.meta.url. Keeping it external to the
  // server bundle preserves that file resolution at runtime.
  serverExternalPackages: ["@electric-sql/pglite"],
};

export default nextConfig;
