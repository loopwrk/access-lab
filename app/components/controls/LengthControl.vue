<script setup lang="ts">
import type { CssLength, CssUnit } from '~/composables/useUnitConversion'

const model = defineModel<CssLength | undefined>({ required: true })

const props = defineProps<{
  fallbackPx: number
  min: number
  max: number
  step: number
  disabled?: boolean
}>()

const unitConv = useUnitConversion()

const sliderPx = computed(() =>
  model.value ? unitConv.lengthToSliderPx(model.value) : props.fallbackPx
)

const lengthValue = computed<CssLength>(() =>
  model.value ?? { value: props.fallbackPx, unit: 'px' }
)

function onSliderChange(value: number) {
  const unit: CssUnit = model.value?.unit ?? 'px'
  model.value = unitConv.fromSliderPx(value, unit)
}
</script>

<template>
  <div class="flex items-center gap-3">
    <USlider
      :model-value="sliderPx"
      :min="min"
      :max="max"
      :step="step"
      :disabled="disabled"
      color="primary"
      size="sm"
      class="flex-1"
      @update:model-value="onSliderChange(Number($event))"
    />
    <LengthValueInput
      v-if="!disabled"
      :model-value="lengthValue"
      :px-step="step"
      @update:model-value="model = $event"
    />
  </div>
</template>
