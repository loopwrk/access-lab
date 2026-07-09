<script setup lang="ts">
import type { CssLength } from "~/composables/useUnitConversion";
import LengthControl from "./LengthControl.vue";

export interface SpacingValue {
  shorthand: CssLength | undefined;
  top: CssLength | undefined;
  right: CssLength | undefined;
  bottom: CssLength | undefined;
  left: CssLength | undefined;
}

const model = defineModel<SpacingValue>({ required: true });

// Linked/independent mode is owned by the parent section, which renders the
// SpacingModeToggle chip in its legend row next to the enable switch.
const independent = defineModel<boolean>("independent", { default: false });

const props = defineProps<{
  fallbackPx: number;
  min: number;
  max: number;
  step: number;
  disabled?: boolean;
}>();

const { t } = useI18n();

const effectiveIndependent = computed(() => !props.disabled && independent.value);

const sides = [
  { id: "top", key: "top", labelKey: "controls.spacing.top" },
  { id: "right", key: "right", labelKey: "controls.spacing.right" },
  { id: "bottom", key: "bottom", labelKey: "controls.spacing.bottom" },
  { id: "left", key: "left", labelKey: "controls.spacing.left" },
] as const;

function setShorthand(value: CssLength | undefined) {
  if (!value) return;
  model.value = { shorthand: value, top: value, right: value, bottom: value, left: value };
}

function setSide(side: "top" | "right" | "bottom" | "left", value: CssLength | undefined) {
  if (!value) return;
  model.value = { ...model.value, [side]: value };
}

function sideValue(side: "top" | "right" | "bottom" | "left") {
  return model.value[side] ?? model.value.shorthand;
}
</script>

<template>
  <div :class="[disabled ? 'opacity-50' : '']">
    <div
      v-if="!effectiveIndependent"
      class="flex flex-col"
    >
      <span class="spacing-side-label">{{ t("controls.spacing.allSides") }}</span>
      <LengthControl
        :model-value="model.shorthand"
        :fallback-px="fallbackPx"
        :min="min"
        :max="max"
        :step="step"
        :disabled="disabled"
        @update:model-value="setShorthand"
      />
    </div>

    <div
      v-else
      class="grid grid-cols-2 gap-3.5"
    >
      <div
        v-for="side in sides"
        :key="side.id"
        class="flex flex-col"
      >
        <label
          :for="`split-${side.id}`"
          class="spacing-side-label"
        >{{ t(side.labelKey) }}</label>
        <LengthControl
          :model-value="sideValue(side.key)"
          :fallback-px="fallbackPx"
          :min="min"
          :max="max"
          :step="step"
          :disabled="disabled"
          :input-id="`split-${side.id}`"
          @update:model-value="setSide(side.key, $event)"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.spacing-side-label {
  display: block;
  margin-bottom: 5px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--text-secondary);
}
</style>
