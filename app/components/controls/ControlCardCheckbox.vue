<script setup lang="ts">
/**
 * The studio's card-style boolean toggle — the single source of truth for the
 * `variant="card"` + `CONTROL_CARD_UI` checkbox used across every controls
 * panel (Checkbox/Radio/Select/Input controls and the button-family sections).
 *
 */
defineOptions({ inheritAttrs: false });
defineProps<{ label?: string }>();
const checked = defineModel<boolean>({ default: false });

function onUpdate(value: boolean | "indeterminate") {
  checked.value = value === true;
}
</script>

<template>
  <UCheckbox
    color="primary"
    size="md"
    v-bind="$attrs"
    variant="card"
    :model-value="checked"
    :label="label"
    :ui="CONTROL_CARD_UI"
    @update:model-value="onUpdate"
  >
    <template
      v-if="$slots.label"
      #label
    >
      <slot name="label" />
    </template>
  </UCheckbox>
</template>
