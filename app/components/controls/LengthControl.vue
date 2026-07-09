<script setup lang="ts">
import type { CssLength, CssUnit } from "~/composables/useUnitConversion";

const model = defineModel<CssLength | undefined>({ required: true });

const props = defineProps<{
  fallbackPx: number;
  min: number;
  max: number;
  step: number;
  disabled?: boolean;
  inputId?: string;
}>();

const unitConv = useUnitConversion();

const sliderPx = computed(() =>
  model.value ? unitConv.lengthToSliderPx(model.value) : props.fallbackPx,
);

const lengthValue = computed<CssLength>(
  () => model.value ?? { value: props.fallbackPx, unit: "px" },
);

function onSliderChange(value: number) {
  const unit: CssUnit = model.value?.unit ?? "px";
  model.value = unitConv.fromSliderPx(value, unit);
}
</script>

<template>
  <div class="flex items-center gap-2">
    <USlider
      :model-value="sliderPx"
      :min="min"
      :max="max"
      :step="step"
      :disabled="disabled"
      color="primary"
      size="sm"
      class="flex-1"
      :ui="{
        track: 'bg-(--brand-soft-2) rounded-full',
        range: 'bg-(--brand) rounded-full',
        thumb: 'bg-(--bg) ring-(--brand) size-4 border-3 border-(--brand) rounded-full',
      }"
      @update:model-value="onSliderChange(Number($event))"
    />
    <LengthValueInput
      :model-value="lengthValue"
      :disabled="disabled"
      :px-step="step"
      :root-px="unitConv.simulatedRootPx.value"
      :input-id="inputId"
      @update:model-value="model = $event"
    />
  </div>
</template>
