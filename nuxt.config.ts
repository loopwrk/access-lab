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

  ssr: false,

  // @nuxtjs/i18n auto-imports its own helpers but not `useI18n`, which
  // lives in vue-i18n. Without this entry, the TS plugin flags every
  // call site even though unimport resolves it at runtime.
  imports: {
    presets: [{ from: "vue-i18n", imports: ["useI18n"] }],
  },

  devtools: {
    enabled: true,
  },

  app: {
    head: {
      title: "AccessLab",
    },
  },

  css: ["~/assets/css/main.css"],

  routeRules: {
    "/": { prerender: true },
  },

  compatibilityDate: "2025-01-15",

  vite: {
    optimizeDeps: {
      include: ["@vue/devtools-core", "@vue/devtools-kit"],
    },
  },

  eslint: {
    config: {
      stylistic: {
        commaDangle: "never",
        braceStyle: "1tbs",
      },
    },
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

  content: {
    renderer: {
      anchorLinks: {
        h3: false,
        h4: false,
      },
    },
  },
});
