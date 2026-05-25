<script setup lang="ts">
import type { ContrastVerdict } from '~/composables/useContrast'

const props = defineProps<{
  ratio: number
  verdict: ContrastVerdict
}>()

const { t } = useI18n()

const verdictMeta = computed(() => {
  switch (props.verdict) {
    case 'AAA':
      return {
        label: t('contrast.verdictAAA'),
        color: 'success' as const,
        icon: 'i-lucide-check-circle-2'
      }
    case 'AA':
      return {
        label: t('contrast.verdictAA'),
        color: 'success' as const,
        icon: 'i-lucide-check'
      }
    case 'AALarge':
      return {
        label: t('contrast.verdictAALarge'),
        color: 'warning' as const,
        icon: 'i-lucide-alert-triangle'
      }
    case 'Fail':
      return {
        label: t('contrast.verdictFail'),
        color: 'error' as const,
        icon: 'i-lucide-x-circle'
      }
  }
})

// Two decimal places — see research/contrast-calculation.md
const displayRatio = computed(() => props.ratio.toFixed(2))
</script>

<template>
  <div class="flex flex-col gap-1.5">
    <span class="text-(length:--al-font-size-caption) font-semibold text-(--text-muted) uppercase tracking-[0.08em]">
      {{ t('contrast.label') }}
    </span>
    <UBadge :color="verdictMeta.color" variant="subtle" size="md" class="contrast-pill">
      <UIcon :name="verdictMeta.icon" class="shrink-0" aria-hidden="true" />
      <span class="contrast-pill-ratio">{{ t('contrast.ratio', { ratio: displayRatio }) }}</span>
      <span class="contrast-pill-divider" aria-hidden="true">·</span>
      <span class="contrast-pill-verdict">{{ verdictMeta.label }}</span>
    </UBadge>
  </div>
</template>

<style scoped>
.contrast-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-variant-numeric: tabular-nums;
}

.contrast-pill-ratio {
  font-family: var(--al-font-mono);
  font-weight: 600;
}

.contrast-pill-divider {
  opacity: 0.5;
}

.contrast-pill-verdict {
  font-weight: 500;
}
</style>
