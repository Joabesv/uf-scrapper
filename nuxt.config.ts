// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  devtools: { enabled: true },
  modules: ["@nuxtjs/tailwindcss", "shadcn-nuxt"],
  runtimeConfig: {
    UF_CHARTERED: process.env.UFABC_CHARTERED_URL,
    UF_RU: process.env.UFABC_RU_URL,
    public: {
      BASE_URL: '/api'
    },
  },
  shadcn: {
    prefix: '',
    componentDir: './components/ui'
  },
})