<script setup lang="ts">
/**
 * Numeric value + unit dropdown for a CssLength. Presentational (relative
 * imports, no Nuxt composables) so it renders in Storybook; the app passes
 * the simulated root font-size via `rootPx` for px↔rem conversion.
 */
import { computed } from "vue";
import type { CssLength, CssUnit } from "../composables/useUnitConversion";
import { CSS_UNIT_OPTIONS, convertCssLength, sliderDisplayStep } from "../utils/cssUnits";

const model = defineModel<CssLength>({ required: true });

const props = withDefaults(defineProps<{
  disabled?: boolean;
  pxStep?: number;
  /** Root font-size used for px↔rem conversion; the app passes the simulated root. */
  rootPx?: number;
  /** Id for the numeric input so an external label's `for` attribute can target it. */
  inputId?: string;
}>(), {
  disabled: false,
  pxStep: 1,
  rootPx: 16,
  inputId: undefined,
});

const unitAwareStep = computed(() => sliderDisplayStep(props.pxStep, model.value.unit));

function onValueInput(event: Event) {
  const next = Number((event.target as HTMLInputElement).value);
  if (Number.isNaN(next)) return;
  model.value = { value: next, unit: model.value.unit };
}

function onUnitChange(event: Event) {
  const nextUnit = (event.target as HTMLSelectElement).value as CssUnit;
  if (nextUnit === model.value.unit) return;
  model.value = convertCssLength(model.value, nextUnit, props.rootPx);
}
</script>

<template>
  <div
    class="inline-flex items-stretch h-[34px] border border-(--border) rounded-[2px] bg-(--surface) overflow-hidden focus-within:outline-[3px] focus-within:outline-(--focus-ring) focus-within:outline-offset-0"
    :class="{ 'pointer-events-none': disabled }"
  >
    <input
      :id="inputId"
      class="length-pill-value w-[46px] border-none bg-transparent text-center text-(--text-primary) font-semibold tabular-nums text-(length:--al-font-size-heading) focus:outline-none disabled:text-(--text-muted)"
      type="number"
      :value="model.value"
      :step="unitAwareStep"
      :disabled="disabled"
      @input="onValueInput"
    >
    <span class="relative inline-flex items-stretch">
      <select
        class="length-pill-unit h-full border-none border-l border-l-(--border) bg-(--surface-2) pl-[5px] pr-5 text-(--text-secondary) font-medium text-(length:--al-font-size-caption) cursor-pointer focus:outline-none disabled:cursor-not-allowed disabled:text-(--text-muted)"
        :value="model.unit"
        :disabled="disabled"
        @change="onUnitChange"
      >
        <option
          v-for="option in CSS_UNIT_OPTIONS"
          :key="option.value"
          :value="option.value"
        >
          {{ option.label }}
        </option>
      </select>
      <UIcon
        name="i-lucide-chevron-down"
        class="pointer-events-none absolute right-1 top-1/2 -translate-y-1/2 size-3"
        :class="disabled ? 'text-(--text-muted)' : 'text-(--text-secondary)'"
        aria-hidden="true"
      />
    </span>
  </div>
</template>

<style scoped>
.length-pill-value {
  -moz-appearance: textfield;
}

.length-pill-value::-webkit-outer-spin-button,
.length-pill-value::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.length-pill-unit {
  appearance: none;
  -webkit-appearance: none;
}
</style>
