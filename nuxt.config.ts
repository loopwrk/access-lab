// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    "@nuxt/eslint",
    "@nuxt/ui",
    "@nuxt/a11y",
    "@nuxt/content",
    "@nuxt/hints",
    "@nuxt/image",
    "@nuxt/test-utils",
    "@nuxtjs/google-fonts",
    "@pinia/nuxt",
    "@nuxtjs/i18n",
    "@vueuse/nuxt",
    "nuxt-color-picker",
  ],

  vite: {
    optimizeDeps: {
      include: ["@vue/devtools-core", "@vue/devtools-kit"],
    },
  },

  // @nuxtjs/i18n auto-imports its own helpers but not `useI18n`, which
  // lives in vue-i18n. Without this entry, the TS plugin flags every
  // call site even though unimport resolves it at runtime.
  imports: {
    presets: [{ from: "vue-i18n", imports: ["useI18n"] }],
  },

  i18n: {
    locales: [
      {
        code: "en",
        name: "English",
        files: [
          "en/common.json",
          "en/controls.json",
          "en/components.json",
          "en/learn.json",
        ],
      },
    ],
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
