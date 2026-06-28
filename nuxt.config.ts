// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    "@nuxt/eslint",
    "@nuxt/ui",
    "@nuxt/a11y",
    "@nuxt/content",
    "@nuxt/image",
    "@nuxt/test-utils",
    "@nuxtjs/color-mode",
    "@nuxtjs/i18n",
    "@vueuse/nuxt",
    "nuxt-color-picker",
    "@vercel/analytics",
  ],

  // Top-level SSR is on so we can opt routes *out* via routeRules.
  // (Nuxt's hybrid rendering only works in this direction - you
  // can't be globally-off-with-route-exceptions.) See `routeRules`
  // below for the per-route split.

  // @nuxtjs/i18n auto-imports its own helpers but not `useI18n`, which
  // lives in vue-i18n. Without this entry, the TS plugin flags every
  // call site even though unimport resolves it at runtime.
  imports: {
    presets: [{ from: "vue-i18n", imports: ["useI18n"] }],
  },

  devtools: {
    enabled: false,
  },

  app: {
    head: {
      title: "AccessLab",
    },
  },

  runtimeConfig: {
    public: {
      // Web3Forms public access key
      web3formsAccessKey: "480bce79-e752-4481-8af1-da12fa3417e2",
    },
  },

  css: ["~/assets/css/main.css"],

  colorMode: {
    classSuffix: "",
    preference: "system",
    fallback: "light",
  },

  content: {
    renderer: {
      anchorLinks: {
        h4: false,
      },
    },
  },

  routeRules: {
    // `/` redirects to a default component via `pages/index.vue` -
    // prerender so the redirect HTML is served straight from the
    // edge with no server round-trip.
    "/": { prerender: true },
    // Studio is highly interactive, depends on browser-only state
    // (localStorage-backed preferences, iframe message channel,
    // axe-core in the iframe), and has zero SEO value. Render
    // client-side only, exactly as before this hybrid split.
    "/components/**": { ssr: false },
    // Reader pages are content. SSR gives crawlers real HTML to
    // index and keeps deep-links fast. The article body, frontmatter
    // title, and Nuxt Content payload all serialise cleanly.
    "/learn/**": { ssr: true },
  },

  compatibilityDate: "2025-01-15",

  vite: {
    optimizeDeps: {
      include: ["@vue/devtools-core", "@vue/devtools-kit", "zod"],
    },
  },

  // Formatting is owned by Prettier (see .prettierrc.json); ESLint
  // handles correctness only. eslint-config-prettier (applied in
  // eslint.config.mjs) turns off any formatting rules the presets ship.

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
          "en/rules.json",
        ],
      },
    ],
    defaultLocale: "en",
  },
});
