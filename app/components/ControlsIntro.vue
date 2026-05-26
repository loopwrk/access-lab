<script setup lang="ts">
/**
 * Persistent informational banner at the top of the Controls panel.
 *
 * Short teaser-question copy with a "Learn more" link that switches the
 * inspector to the Learn tab (and moves focus into that panel for keyboard
 * + screen-reader users). The longer explanation lives in LearnPanel so it
 * can be re-read and indexed alongside other educational content.
 *
 * Not dismissible by design — the panel is educational and the banner
 * should remain reachable.
 */
defineProps<{
  /** Lowercase noun describing the previewed element, e.g. "button". */
  elementName: string
}>()

const { t } = useI18n()
const { focusPanel } = useInspectorTab()
</script>

<template>
  <UAlert color="info" variant="soft" icon="i-lucide-info" :title="t('controls.intro.short', { element: elementName })"
    :ui="{
      title: 'font-normal leading-snug text-(length:--al-font-size-detail)',
      description: 'mt-1',
      icon: 'shrink-0'
    }">
    <template #description>
      <UButton :label="t('controls.intro.expandLabel')" trailing-icon="i-lucide-arrow-right" variant="link" color="info"
        size="xs" class="px-0 items-start" :ui="{ label: 'whitespace-normal text-left' }"
        @click="focusPanel('learn')" />
    </template>
  </UAlert>
</template>
