// https://nuxt.com/docs/api/configuration/nuxt-config
const cloudinaryBaseURL =
  process.env.NUXT_PUBLIC_CLOUDINARY_BASE_URL || "https://res.cloudinary.com/rafamed-dev/image/upload"

const corsAllowedOrigins =
  process.env.NUXT_CORS_ALLOWED_ORIGINS ||
  "https://heltifud.com,https://www.heltifud.com,http://localhost:3000,http://127.0.0.1:3000"

export default defineNuxtConfig({
  compatibilityDate: "2024-11-01",
  devtools: { enabled: true },

  vite: {
    optimizeDeps: {
      include: ["zod", "@vue/devtools-core", "@vue/devtools-kit", "@internationalized/date"]
    }
  },

  modules: ["@nuxt/eslint", "@nuxt/image", "@nuxtjs/supabase", "@netlify/nuxt"],

  app: {
    pageTransition: { name: "page", mode: "out-in" },
    layoutTransition: { name: "page", mode: "out-in" }
  },

  runtimeConfig: {
    corsAllowedOrigins,
    public: {
      cloudinaryBaseURL
    }
  },

  image: {
    provider: "cloudinary",
    cloudinary: {
      baseURL: cloudinaryBaseURL
    }
  },

  supabase: {
    url: process.env.NUXT_PUBLIC_SUPABASE_URL,
    key: process.env.NUXT_PUBLIC_SUPABASE_KEY,
    redirect: true,
    redirectOptions: {
      login: "/login",
      callback: "/confirm",
      include: ["/admin*"],
      exclude: [],
      saveRedirectToCookie: true
    },
    cookieOptions: {
      maxAge: 60 * 60 * 8,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production"
    },
    types: "~/types/database.types.ts"
  }
})
