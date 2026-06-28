<script setup lang="ts">
/**
 * Reset every styling-related prop on the model back to undefined so
 * the rendered element falls back to the browser's user-agent stylesheet.
 *
 * Content, ARIA, behaviour, and variant props are preserved - only the
 * visual styles the user could have customised through the studio
 * sections (Text, Dimensions, Border, Colours, Focus) get cleared.
 */
import SectionLegend from "~/components/controls/SectionLegend.vue";

const model = defineModel<Record<string, unknown>>({ required: true });

const { t } = useI18n();

// Keys that any styling section can write into the model. Listed in
// one place so this control stays in sync with every section's enable/
// disable contract; if a new section adds a new styling prop, add its
// key here too.
const STYLE_KEYS = [
  "width",
  "height",
  "padding",
  "paddingTop",
  "paddingRight",
  "paddingBottom",
  "paddingLeft",
  "borderWidth",
  "borderTopWidth",
  "borderRightWidth",
  "borderBottomWidth",
  "borderLeftWidth",
  "borderColor",
  "fontSize",
  "bg",
  "fgText",
  "focusRingEnabled",
  "focusRingWidth",
  "focusRingColor",
  "focusRingOffset",
] as const;

function resetToBrowserDefaults() {
  for (const key of STYLE_KEYS) {
    model.value[key] = undefined;
  }
}
</script>

<template>
  <fieldset class="flex flex-col gap-2 border-0 p-0 m-0">
    <SectionLegend :label="t('controls.resetDefaults.label')" />
    <UButton
      color="primary"
      variant="soft"
      size="sm"
      icon="i-lucide-rotate-ccw"
      block
      @click="resetToBrowserDefaults"
    >
      {{ t("controls.resetDefaults.action") }}
    </UButton>
  </fieldset>
</template>
