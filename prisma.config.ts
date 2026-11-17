import "dotenv/config"

import { defineConfig } from "prisma/config"

// Only migrations and verify scripts need the owner connection. `prisma
// generate` (postinstall, Netlify build) runs without it, so DIRECT_URL never
// has to reach the deployed functions.
const directUrl = process.env.DIRECT_URL

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "node --import tsx prisma/seed.ts"
  },
  engine: "classic",
  ...(directUrl ? { datasource: { url: directUrl } } : {})
})
