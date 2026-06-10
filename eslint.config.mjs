// @ts-check
import eslintConfigPrettier from "eslint-config-prettier/flat";
import withNuxt from "./.nuxt/eslint.config.mjs";

export default withNuxt({
  rules: {
    "vue/no-multiple-template-root": "off",
  },
})
  // Prettier owns formatting; this must stay last so it switches off
  // every formatting rule the presets above enable.
  .append(eslintConfigPrettier);
