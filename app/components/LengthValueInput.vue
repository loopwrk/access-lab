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
  <div class="length-pill" :class="{ 'length-pill-disabled': disabled }">
    <input class="length-pill-value" type="number" :value="modelValue.value" :step="unitAwareStep" :disabled="disabled"
      @input="onValueInput">
    <select class="length-pill-unit" :value="modelValue.unit" :disabled="disabled" @change="onUnitChange">
      <option v-for="option in unitConv.unitOptions" :key="option.value" :value="option.value">
        {{ option.label }}
      </option>
    </select>
  </div>
</template>

<style scoped>
.length-pill {
  display: inline-flex;
  align-items: stretch;
  height: 28px;
  border: 1px solid var(--border-strong);
  border-radius: 6px;
  background: var(--surface);
  overflow: hidden;
}

.length-pill:focus-within {
  outline: 3px solid var(--focus-ring);
  outline-offset: 0;
}

.length-pill-disabled {
  opacity: 0.5;
  pointer-events: none;
}

.length-pill-value {
  width: 52px;
  border: none;
  background: transparent;
  padding: 0 6px;
  text-align: right;
  color: var(--brand);
  font-weight: 500;
  font-family: var(--al-font-mono);
  font-variant-numeric: tabular-nums;
  font-size: var(--al-font-size-body);
  -moz-appearance: textfield;
}

.length-pill-value:focus {
  outline: none;
}

.length-pill-value::-webkit-outer-spin-button,
.length-pill-value::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.length-pill-unit {
  border: none;
  border-left: 1px solid var(--border-strong);
  background: var(--surface-2);
  padding: 0 18px 0 8px;
  color: var(--text-muted);
  font-family: var(--al-font-mono);
  font-size: var(--al-font-size-body);
  cursor: pointer;
  appearance: none;
  -webkit-appearance: none;
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 12'><path fill='%23888' d='M6 8L2 4h8z'/></svg>");
  background-repeat: no-repeat;
  background-position: right 6px center;
  background-size: 8px;
}

.length-pill-unit:focus {
  outline: none;
}

.length-pill-unit:disabled {
  cursor: not-allowed;
}
</style>
