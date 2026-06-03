<script setup lang="ts">
import { useUnitConversion } from "~/composables/useUnitConversion";

const { t } = useI18n();
const unitConv = useUnitConversion();
const { focusLearnTopic } = useInspectorTab();
</script>

<template>
  <section
    class="-mt-4 -mx-4 mb-4 bg-(--brand-soft) border-b border-(--border)"
    :aria-label="t('controls.simulatedRoot.label')"
  >
    <div class="px-4 py-3 flex flex-col gap-2">
      <div class="flex items-center justify-between gap-3">
        <a
          href="#topic-rem-units"
          class="inline-flex items-center gap-1 text-(length:--al-font-size-caption) font-semibold text-(--text-muted) uppercase tracking-[0.08em] no-underline cursor-pointer hover:text-(--brand) hover:underline hover:underline-offset-2 focus-visible:text-(--brand) focus-visible:underline focus-visible:underline-offset-2 focus-visible:outline-[3px] focus-visible:outline-(--focus-ring) focus-visible:outline-offset-2 focus-visible:rounded-[2px]"
          @click.prevent="focusLearnTopic('rem-units')"
        >
          {{ t('controls.simulatedRoot.label') }}
          <UIcon
            name="i-lucide-arrow-up-right"
            class="text-(length:--al-font-size-detail) opacity-70"
            aria-hidden="true"
          />
        </a>
        <span class="text-(length:--al-font-size-detail) text-(--text-muted) font-mono">
          {{ unitConv.simulatedRootPx.value }}px
        </span>
      </div>
      <USlider
        :model-value="unitConv.simulatedRootPx.value"
        :min="12"
        :max="32"
        :step="1"
        color="primary"
        size="sm"
        :ui="{
          track: 'bg-(--surface) ring-1 ring-(--border)',
          range: 'bg-(--brand)',
          thumb: 'ring-2 ring-(--brand)',
        }"
        @update:model-value="unitConv.simulatedRootPx.value = Number($event)"
      />
    </div>
  </section>
</template>
