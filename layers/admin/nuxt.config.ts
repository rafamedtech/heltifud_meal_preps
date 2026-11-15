// https://nuxt.com/docs/api/configuration/nuxt-config
import { fileURLToPath } from "node:url"

export default defineNuxtConfig({
  compatibilityDate: "2024-11-01",
  devtools: { enabled: true },
  css: [fileURLToPath(new URL("../base/app/assets/css/main.css", import.meta.url))]
})
