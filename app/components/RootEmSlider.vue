<script setup lang="ts">
import { useUnitConversion } from '~/composables/useUnitConversion'

const { t } = useI18n()
const unitConv = useUnitConversion()
const { focusLearnTopic } = useInspectorTab()
</script>

<template>
  <section class="root-em-slider" :aria-label="t('controls.simulatedRoot.label')">
    <div class="root-em-slider-inner">
      <div class="root-em-slider-header">
        <a href="#topic-rem-units" class="root-em-slider-title" @click.prevent="focusLearnTopic('rem-units')">
          {{ t('controls.simulatedRoot.label') }}
          <UIcon name="i-lucide-arrow-up-right" class="root-em-slider-title-icon" aria-hidden="true" />
        </a>
        <span class="root-em-slider-value">
          {{ unitConv.simulatedRootPx.value }}px
        </span>
      </div>
      <USlider :model-value="unitConv.simulatedRootPx.value" :min="12" :max="32" :step="1" color="primary" size="sm"
        :ui="{
          track: 'bg-(--surface) ring-1 ring-(--border)',
          range: 'bg-(--brand)',
          thumb: 'ring-2 ring-(--brand)'
        }"
        @update:model-value="unitConv.simulatedRootPx.value = Number($event)" />
    </div>
  </section>
</template>

<style scoped>
.root-em-slider {
  margin: -16px -16px 16px -16px;
  background: var(--brand-soft);
  border-bottom: 1px solid var(--border);
}

.root-em-slider-inner {
  padding: 12px 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.root-em-slider-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.root-em-slider-title {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: var(--al-font-size-caption);
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  text-decoration: none;
  cursor: pointer;
}

.root-em-slider-title:hover,
.root-em-slider-title:focus-visible {
  color: var(--brand);
  text-decoration: underline;
  text-underline-offset: 2px;
}

.root-em-slider-title:focus-visible {
  outline: 3px solid var(--focus-ring);
  outline-offset: 2px;
  border-radius: 2px;
}

.root-em-slider-title-icon {
  font-size: var(--al-font-size-detail);
  opacity: 0.7;
}

.root-em-slider-value {
  font-size: var(--al-font-size-detail);
  color: var(--text-muted);
  font-family: var(--al-font-mono);
}
</style>
