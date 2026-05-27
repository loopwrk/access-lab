<script setup lang="ts">
import type { ContextWrapper } from '~/types/component'

interface Props {
  modelValue: string[]
  options: ContextWrapper[]
  panelLabel?: string
}

const { t } = useI18n()
const { focusLearnTopic } = useInspectorTab()

const props = withDefaults(defineProps<Props>(), {
  panelLabel: () => ''
})

const emit = defineEmits<{
  'update:modelValue': [value: string[]]
}>()

// If the caller did not pass an explicit panel label, derive one:
//   - one wrapper: use its label stripped of angle brackets ("<form>" → "form")
//   - multiple wrappers: fall back to the generic panel label i18n key
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
</script>

<template>
  <div class="inline-flex items-stretch border border-(--border) bg-(--surface-2)">
    <USeparator orientation="vertical" :ui="{ border: 'border-(--border)' }" />
    <div v-for="wrapper in options" :key="wrapper.key" class="flex items-center gap-3 px-3 py-1.5">
      <USwitch :model-value="isEnabled(wrapper.key)" size="sm"
        :aria-label="t('wrapperToggles.toggleAria', { label: wrapper.label })"
        @update:model-value="onToggle(wrapper.key, $event === true)" />
      <a v-if="wrapper.learnTopicId" :href="`#topic-${wrapper.learnTopicId}`"
        class="learn-link text-(length:--al-font-size-body) text-(--text-secondary) inline-flex items-center gap-1"
        @click.prevent="focusLearnTopic(wrapper.learnTopicId)">
        {{ t('wrapperToggles.wrapIn') }}
        <code class="font-mono text-(--brand) bg-(--brand-soft) px-1 py-0.5">{{ wrapper.label }}</code>
        <UIcon name="i-lucide-arrow-up-right" class="size-3.5 opacity-70" aria-hidden="true" />
      </a>
      <span v-else class="text-(length:--al-font-size-body) text-(--text-secondary) inline-flex items-center gap-1">
        {{ t('wrapperToggles.wrapIn') }}
        <code class="font-mono text-(--brand) bg-(--brand-soft) px-1 py-0.5">{{ wrapper.label }}</code>
      </span>
    </div>
  </div>
</template>

<style scoped>
.learn-link {
  text-decoration: none;
  cursor: pointer;
}

.learn-link:hover,
.learn-link:focus-visible {
  color: var(--brand);
  text-decoration: underline;
  text-underline-offset: 2px;
}

.learn-link:focus-visible {
  outline: 3px solid var(--focus-ring);
  outline-offset: 2px;
}
</style>
