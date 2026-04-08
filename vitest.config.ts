import { fileURLToPath } from "node:url"
import { defineVitestConfig } from "@nuxt/test-utils/config"

process.env.NETLIFY_DEV ||= "1"
process.env.NUXT_PUBLIC_SUPABASE_URL ||= "http://127.0.0.1:54321"
process.env.NUXT_PUBLIC_SUPABASE_KEY ||= "test-supabase-key"

export default defineVitestConfig({
  test: {
    environment: "nuxt",
    include: ["tests/unit/**/*.{test,spec}.ts", "tests/components/**/*.{test,spec}.ts"],
    exclude: ["tests/e2e/**", "node_modules/**", ".nuxt/**", ".output/**", "dist/**"],
    setupFiles: ["./tests/setup/vitest.ts"],
    environmentOptions: {
      nuxt: {
        rootDir: fileURLToPath(new URL(".", import.meta.url)),
        domEnvironment: "happy-dom",
        mock: {
          indexedDb: true,
          intersectionObserver: true
        },
        overrides: {
          devtools: { enabled: false }
        }
      }
    }
  }
})
