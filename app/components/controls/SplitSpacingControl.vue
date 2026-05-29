<script setup lang="ts">
import type { CssLength } from '~/composables/useUnitConversion'
import LengthControl from './LengthControl.vue'

export interface SpacingValue {
  shorthand: CssLength | undefined
  top: CssLength | undefined
  right: CssLength | undefined
  bottom: CssLength | undefined
  left: CssLength | undefined
}

const props = defineProps<{
  modelValue: SpacingValue
  fallbackPx: number
  min: number
  max: number
  step: number
  disabled?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: SpacingValue]
}>()

const split = ref(false)
const effectiveSplit = computed(() => !props.disabled && split.value)

const sides = [
  { id: 'top', key: 'top', label: 'T' },
  { id: 'right', key: 'right', label: 'R' },
  { id: 'bottom', key: 'bottom', label: 'B' },
  { id: 'left', key: 'left', label: 'L' }
] as const

function setShorthand(value: CssLength) {
  emit('update:modelValue', { shorthand: value, top: value, right: value, bottom: value, left: value })
}

function setSide(side: 'top' | 'right' | 'bottom' | 'left', value: CssLength) {
  emit('update:modelValue', { ...props.modelValue, [side]: value })
}

function sideValue(side: 'top' | 'right' | 'bottom' | 'left') {
  return props.modelValue[side] ?? props.modelValue.shorthand
}
</script>

<template>
  <div :class="[disabled ? 'opacity-50' : '']">
    <UFormField class="control-field [&>div]:w-full [&_label]:w-full">
      <template #label>
        <span class="flex items-center justify-between w-full">
          <span />
          <UButton
            size="xs"
            variant="ghost"
            color="primary"
            class="pr-0"
            :disabled="disabled"
            :icon="effectiveSplit ? 'i-lucide-square' : 'i-lucide-grid-3x3'"
            trailing
            @click="split = !split"
          >
            {{ effectiveSplit ? 'Merge' : 'Split' }}
          </UButton>
        </span>
      </template>

      <LengthControl
        v-if="!effectiveSplit"
        :model-value="modelValue.shorthand"
        :fallback-px="fallbackPx"
        :min="min"
        :max="max"
        :step="step"
        :disabled="disabled"
        @update:model-value="setShorthand"
      />

      <div
        v-else
        class="flex flex-col gap-2"
      >
        <div
          v-for="side in sides"
          :key="side.id"
          class="flex items-center gap-2"
        >
          <label
            :for="`split-${side.id}`"
            class="control-split-label"
          >{{ side.label }}</label>
          <LengthControl
            :id="`split-${side.id}`"
            :model-value="sideValue(side.key)"
            :fallback-px="fallbackPx"
            :min="min"
            :max="max"
            :step="step"
            :disabled="disabled"
            @update:model-value="setSide(side.key, $event)"
          />
        </div>
      </div>
    </UFormField>
  </div>
</template>
