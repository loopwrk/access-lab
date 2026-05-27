<script setup lang="ts">
import type { ContextWrapper } from '~/types/component'

interface Props {
  modelValue: string[]
  options: ContextWrapper[]
  panelLabel?: string
}

const { t, te } = useI18n()

const props = withDefaults(defineProps<Props>(), {
  panelLabel: () => '',
})

const emit = defineEmits<{
  'update:modelValue': [value: string[]]
}>()

// If the caller did not pass an explicit panel label, derive one:
//   - one wrapper: use its label stripped of angle brackets ("<form>" → "form")
//   - multiple wrappers: fall back to the generic "Context" i18n key
const resolvedPanelLabel = computed(() => {
  if (props.panelLabel) return props.panelLabel
  if (props.options.length === 1) {
    return props.options[0]!.label.replace(/[<>]/g, '')
  }
  return t('wrapperToggles.panelLabel')
})

function isEnabled(key: string): boolean {
  return props.modelValue.includes(key)
}

function onToggle(key: string, enabled: boolean) {
  const next = enabled
    ? Array.from(new Set([...props.modelValue, key]))
    : props.modelValue.filter(k => k !== key)
  emit('update:modelValue', next)
}

function maybeTranslate(value?: string): string {
  if (!value) return ''
  return te(value) ? t(value) : value
}
</script>

<template>
  <div class="inline-flex items-stretch border border-(--border) bg-(--surface-2)">
    <span
      class="flex items-center px-3 text-(length:--al-font-size-caption) font-semibold uppercase tracking-wider text-(--text-muted)">
      {{ resolvedPanelLabel }}
    </span>
    <USeparator orientation="vertical" :ui="{ border: 'border-(--border)' }" />
    <div v-for="wrapper in options" :key="wrapper.key" class="flex items-center gap-3 px-3 py-1.5">
      <USwitch :model-value="isEnabled(wrapper.key)" size="sm"
        :aria-label="t('wrapperToggles.toggleAria', { label: wrapper.label })"
        @update:model-value="onToggle(wrapper.key, $event === true)" />
      <span class="text-(length:--al-font-size-body) text-(--text-secondary) inline-flex items-center gap-1">
        {{ t('wrapperToggles.wrapIn') }}
        <code class="font-mono text-(--brand) bg-(--brand-soft) px-1 py-0.5">{{ wrapper.label }}</code>
      </span>
      <UTooltip v-if="wrapper.description" :text="maybeTranslate(wrapper.description)">
        <UButton variant="ghost" color="neutral" icon="i-lucide-circle-help" size="xs" class="rounded-none p-0"
          :aria-label="t('wrapperToggles.helpAria', { label: wrapper.label })" />
      </UTooltip>
    </div>
  </div>
</template>
