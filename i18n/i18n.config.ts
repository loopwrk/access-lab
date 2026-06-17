// Eager Vue I18n config. The `locales[].files` array in nuxt.config.ts still
// drives lazy loading, but @nuxtjs/i18n's HMR reset (resetI18nProperties)
// rebuilds messages from *this* config — without it, editing any locale JSON
// blanks the whole `en` locale to raw keys until a full reload. Supplying the
// messages here also makes them available synchronously at init, removing the
// first-paint flash of raw keys.
//
import common from "./locales/en/common.json";
import controls from "./locales/en/controls.json";
import components from "./locales/en/components.json";
import learn from "./locales/en/learn.json";

export default defineI18nConfig(() => ({
  legacy: false,
  messages: {
    en: {
      ...common,
      ...controls,
      ...components,
      ...learn,
    },
  },
}));
