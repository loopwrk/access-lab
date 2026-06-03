<script setup lang="ts">
import type { CssLength, CssUnit } from '~/composables/useUnitConversion'
import { useUnitConversion } from '~/composables/useUnitConversion'

interface Props {
  modelValue: CssLength
  disabled?: boolean
  pxStep?: number
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  pxStep: 1,
})

const emit = defineEmits<{
  'update:modelValue': [value: CssLength]
}>()

const unitConv = useUnitConversion()

const unitAwareStep = computed(() =>
  unitConv.displayStep(props.pxStep, props.modelValue.unit),
)

function onValueInput(event: Event) {
  const next = Number((event.target as HTMLInputElement).value)
  if (Number.isNaN(next)) return
  emit('update:modelValue', { value: next, unit: props.modelValue.unit })
}

function onUnitChange(event: Event) {
  const nextUnit = (event.target as HTMLSelectElement).value as CssUnit
  if (nextUnit === props.modelValue.unit) return
  emit('update:modelValue', unitConv.convertLength(props.modelValue, nextUnit))
}
</script>

<template>
  <div
    class="inline-flex items-stretch h-7 border border-(--border-strong) rounded-md bg-(--surface) overflow-hidden focus-within:outline-[3px] focus-within:outline-(--focus-ring) focus-within:outline-offset-0"
    :class="{ 'opacity-50 pointer-events-none': disabled }">
    <input
      class="length-pill-value w-[52px] border-none bg-transparent px-1.5 text-right text-(--brand) font-medium font-mono tabular-nums text-(length:--al-font-size-body) focus:outline-none"
      type="number" :value="modelValue.value" :step="unitAwareStep" :disabled="disabled" @input="onValueInput">
    <select
      class="length-pill-unit border-none border-l border-l-(--border-strong) bg-(--surface-2) pl-2 pr-4 text-(--text-muted) font-mono text-(length:--al-font-size-body) cursor-pointer focus:outline-none disabled:cursor-not-allowed"
      :value="modelValue.unit" :disabled="disabled" @change="onUnitChange">
      <option v-for="option in unitConv.unitOptions" :key="option.value" :value="option.value">
        {{ option.label }}
      </option>
    </select>
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
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 12'><path fill='%23888' d='M6 8L2 4h8z'/></svg>");
  background-repeat: no-repeat;
  background-position: right 6px center;
  background-size: 8px;
}
</style>
