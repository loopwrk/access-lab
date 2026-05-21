// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    "@nuxt/eslint",
    "@nuxt/ui",
    "@nuxt/a11y",
    "@nuxt/content",
    "@nuxt/hints",
    "@nuxt/test-utils",
    "@nuxtjs/google-fonts",
    "@pinia/nuxt",
    "@nuxtjs/i18n",
  ],

  vite: {
    optimizeDeps: {
      include: ["@vue/devtools-core", "@vue/devtools-kit"],
    },
  },

  i18n: {
    locales: [{ code: "en", name: "English", file: "en.json" }],
    defaultLocale: "en",
  },

  app: {
    head: {
      title: "AccessLab",
    },
  },

  ssr: false,

  devtools: {
    enabled: true,
  },

  css: ["~/assets/css/main.css"],

  routeRules: {
    "/": { prerender: true },
  },

  compatibilityDate: "2025-01-15",

  eslint: {
    config: {
      stylistic: {
        commaDangle: "never",
        braceStyle: "1tbs",
      },
    },
  },
});
