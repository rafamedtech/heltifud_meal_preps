// https://nuxt.com/docs/api/configuration/nuxt-config
import { fileURLToPath } from "node:url"

export default defineNuxtConfig({
  compatibilityDate: "2024-11-01",
  devtools: { enabled: true },

  css: [fileURLToPath(new URL("./app/assets/css/main.css", import.meta.url))],
  modules: ["@nuxt/ui"],
  fonts: {
    families: [
      {
        name: "Montserrat",
        provider: "none"
      }
    ]
  }
})
