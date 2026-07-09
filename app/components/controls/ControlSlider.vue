<script setup lang="ts">
const value = defineModel<number>({ required: true });

withDefaults(
  defineProps<{
    /** Accessible name - the slider renders no visible label of its own. */
    ariaLabel: string;
    min?: number;
    max?: number;
    step?: number;
    disabled?: boolean;
  }>(),
  { min: 0, max: 100, step: 1, disabled: false },
);
</script>

<template>
  <USlider
    v-model="value"
    :min="min"
    :max="max"
    :step="step"
    :disabled="disabled"
    color="primary"
    size="sm"
    :aria-label="ariaLabel"
    :ui="{
      track: 'bg-(--brand-soft-2) rounded-full',
      range: 'bg-(--brand) rounded-full',
      thumb: 'bg-(--brand) ring-(--brand) size-4',
    }"
  />
</template>
