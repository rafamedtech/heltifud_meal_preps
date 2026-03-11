// https://nuxt.com/docs/api/configuration/nuxt-config
const cloudinaryBaseURL = process.env.NUXT_PUBLIC_CLOUDINARY_BASE_URL
  || 'https://res.cloudinary.com/rafamed-dev/image/upload'

export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },

  modules: ['@nuxt/eslint', '@nuxt/image'],

  app: {
    pageTransition: { name: 'page', mode: 'out-in' },
    layoutTransition: { name: 'page', mode: 'out-in' }
  },

  runtimeConfig: {
    public: {
      cloudinaryBaseURL
    }
  },

  image: {
    provider: 'cloudinary',
    cloudinary: {
      baseURL: cloudinaryBaseURL
    }
  }
})
