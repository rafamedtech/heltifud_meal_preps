// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2024-11-01",
  devtools: { enabled: true },

  css: ["./layers/base/app/assets/css/main.css"],
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
