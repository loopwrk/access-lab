import type { Preview } from "@storybook/vue3-vite";
import { setup } from "@storybook/vue3-vite";
import { useGlobals } from "storybook/preview-api";
import ui from "@nuxt/ui/vue-plugin";

import "../app/assets/css/main.css";

setup((app) => {
  app.use(ui);
});

const THEME_CLASS: Record<string, string> = {
  light: "theme-light light",
  dark: "theme-dark dark",
  "high-contrast": "theme-light light theme-high-contrast",
  "high-contrast-dark": "theme-dark dark theme-high-contrast",
};

const preview: Preview = {
  parameters: {
    layout: "fullscreen",
    controls: { expanded: true },
  },
  globalTypes: {
    theme: {
      description: "AccessLab theme",
      defaultValue: "light",
      toolbar: {
        title: "Theme",
        icon: "contrast",
        items: [
          { value: "light", title: "Light" },
          { value: "dark", title: "Dark" },
          { value: "high-contrast", title: "High contrast (light)" },
          { value: "high-contrast-dark", title: "High contrast (dark)" },
        ],
        dynamicTitle: true,
      },
    },
  },
  decorators: [
    // `useGlobals` subscribes the decorator to the theme toolbar so it
    // re-renders the instant the global changes (reading `context.globals`
    // only snapshots it, so the swap was lagging until the next render).
    (story) => {
      const [globals] = useGlobals();
      const themeClass = THEME_CLASS[globals.theme] ?? THEME_CLASS.light;
      return {
        components: { story },
        setup() {
          // Popover content teleports to <body>, so the theme must also sit on <html>.
          const all = ["theme-light", "light", "theme-dark", "dark", "theme-high-contrast"];
          document.documentElement.classList.remove(...all);
          document.documentElement.classList.add(...themeClass.split(" "));
          return { themeClass };
        },
        template: `<div :class="themeClass" style="min-height:100vh;padding:32px;background:var(--bg)"><story /></div>`,
      };
    },
  ],
};

export default preview;
