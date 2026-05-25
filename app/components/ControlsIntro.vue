<script setup lang="ts">
/**
 * Persistent informational banner at the top of the Controls panel.
 *
 * Not dismissible by design — the panel is educational and the explainer
 * should remain reachable for re-reading.
 */
defineProps<{
  elementName: string
}>()

const { t } = useI18n()
const expanded = ref(false)
</script>

<template>
  <UAlert color="info" variant="soft" icon="i-lucide-info" :title="t('controls.intro.short', { element: elementName })"
    :ui="{
      title: 'font-normal leading-snug text-(length:--al-font-size-detail)',
      description: 'mt-2',
      icon: 'shrink-0'
    }">
    <template #description>
      <UCollapsible v-model:open="expanded">
        <UButton :label="expanded ? t('controls.intro.collapseLabel') : t('controls.intro.expandLabel')"
          :trailing-icon="expanded ? 'i-lucide-chevron-up' : 'i-lucide-chevron-down'" variant="link" color="info"
          size="xs" class="px-0" />
        <template #content>
          <p class="mt-2 leading-relaxed text-(length:--al-font-size-detail) text-(--text-secondary)">
            {{ t('controls.intro.expanded') }}
          </p>
        </template>
      </UCollapsible>
    </template>
  </UAlert>
</template>
