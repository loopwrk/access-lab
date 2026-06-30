import type { StorybookConfig } from "@storybook/vue3-vite";

/**
 * Plain Vue3 + Vite Storybook (the Nuxt-integrated `@nuxtjs/storybook` only
 * supports Nuxt 3). Nuxt UI v4 is wired in via its standalone Vite plugin
 * (`@nuxt/ui/vite`) so Nuxt UI components resolve and the theme/tokens compile.
 */
const config: StorybookConfig = {
  stories: ["../app/**/*.stories.@(js|ts)"],
  framework: { name: "@storybook/vue3-vite", options: {} },
  viteFinal: async (viteConfig) => {
    // `@storybook/vue3-vite` v9 doesn't bundle @vitejs/plugin-vue, and
    // `@nuxt/ui/vite` is ESM-only (Storybook evaluates main.ts as CJS), so
    // load both dynamically. The Vue plugin must run before Nuxt UI's
    // auto-import unplugin.
    const { default: vue } = await import("@vitejs/plugin-vue");
    const { default: ui } = await import("@nuxt/ui/vite");
    // Deep Nuxt UI deps (reka-ui, @vueuse) resolve `vue` as a peer; dedupe so
    // there is a single copy under pnpm.
    viteConfig.resolve = viteConfig.resolve ?? {};
    viteConfig.resolve.dedupe = [...(viteConfig.resolve.dedupe ?? []), "vue"];
    viteConfig.plugins = viteConfig.plugins ?? [];
    viteConfig.plugins.push(vue());
    viteConfig.plugins.push(
      ui({
        colorMode: false,
        theme: {
          colors: ["accesslab", "accesslab-neutral", "error", "warning", "success", "info"],
        },
        ui: {
          colors: {
            primary: "accesslab",
            neutral: "accesslab-neutral",
            error: "error",
            warning: "warning",
            success: "success",
            info: "info",
          },
        },
      }),
    );
    return viteConfig;
  },
};

export default config;
