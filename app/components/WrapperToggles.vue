<script setup lang="ts">
import type { ContextWrapper } from '~/types/component'

interface Props {
  modelValue: string[]
  options: ContextWrapper[]
  panelLabel?: string
}

const props = withDefaults(defineProps<Props>(), {
  panelLabel: 'Form',
})

const emit = defineEmits<{
  'update:modelValue': [value: string[]]
}>()

function isEnabled(key: string): boolean {
  return props.modelValue.includes(key)
}

function onToggle(key: string, enabled: boolean) {
  const next = enabled
    ? Array.from(new Set([...props.modelValue, key]))
    : props.modelValue.filter(k => k !== key)
  emit('update:modelValue', next)
}
</script>

<template>
  <div class="inline-flex items-stretch border border-(--border) bg-(--surface-2)">
    <span
      class="flex items-center px-3 text-(length:--al-font-size-caption) font-semibold uppercase tracking-wider text-(--text-muted)">
      {{ panelLabel }}
    </span>
    <USeparator orientation="vertical" :ui="{ border: 'border-(--border)' }" />
    <div v-for="wrapper in options" :key="wrapper.key" class="flex items-center gap-3 px-3 py-1.5">
      <USwitch :model-value="isEnabled(wrapper.key)" size="sm"
        :aria-label="`Toggle ${wrapper.label} wrapper`"
        @update:model-value="onToggle(wrapper.key, $event === true)" />
      <span class="text-(length:--al-font-size-body) text-(--text-secondary) inline-flex items-center gap-1">
        Wrap in
        <code class="font-mono text-(--brand) bg-(--brand-soft) px-1 py-0.5">{{ wrapper.label }}</code>
      </span>
      <UTooltip v-if="wrapper.description" :text="wrapper.description">
        <UButton variant="ghost" color="neutral" icon="i-lucide-circle-help" size="xs" class="rounded-none p-0"
          :aria-label="`What does ${wrapper.label} wrapper do?`" />
      </UTooltip>
    </div>
  </div>
</template>
