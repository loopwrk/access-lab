<script setup lang="ts">
import type { CssLength, CssUnit } from '~/composables/useUnitConversion'

const props = defineProps<{
  modelValue: CssLength | undefined
  fallbackPx: number
  min: number
  max: number
  step: number
  disabled?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: CssLength]
}>()

const unitConv = useUnitConversion()

const sliderPx = computed(() =>
  props.modelValue ? unitConv.lengthToSliderPx(props.modelValue) : props.fallbackPx
)

const lengthValue = computed<CssLength>(() =>
  props.modelValue ?? { value: props.fallbackPx, unit: 'px' }
)

function onSliderChange(value: number) {
  const unit: CssUnit = props.modelValue?.unit ?? 'px'
  emit('update:modelValue', unitConv.fromSliderPx(value, unit))
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
      @update:model-value="emit('update:modelValue', $event)"
    />
  </div>
</template>
