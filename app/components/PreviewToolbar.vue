<script setup lang="ts">
const { t } = useI18n();
const { activeComponentName, activeLearnTopicId } = useActiveComponent();
const { criticalCount, warningCount, passingCount } = useAxeCounts();
const { allViolations } = useAllViolations();

const previewTitle = computed(
  () => activeComponentName.value ?? t("preview.title"),
);
const criticalViolationIds = computed(() =>
  allViolations.value
    .filter((v) => severityBucket(v.impact) === "critical")
    .map((v) => v.id),
);
const warningViolationIds = computed(() =>
  allViolations.value
    .filter((v) => severityBucket(v.impact) === "warning")
    .map((v) => v.id),
);
</script>

<template>
  <div class="flex flex-wrap items-center justify-between gap-4 py-2.5 px-5 border-b border-(--border) bg-(--surface)">
    <div class="flex items-center gap-3">
      <h1 class="m-0 font-medium text-(length:--al-font-size-heading) text-(--text-primary)">
        <a v-if="activeLearnTopicId" :href="`#topic-${activeLearnTopicId}`"
          :title="t('preview.titleLearnLink', { name: previewTitle })" class="
            text-inherit no-underline cursor-pointer
            hover:text-(--brand) hover:underline hover:underline-offset-[3px]
            focus-visible:text-(--brand) focus-visible:underline focus-visible:underline-offset-[3px]
            focus-visible:outline-[3px] focus-visible:outline-(--focus-ring) focus-visible:outline-offset-[3px]
            focus-visible:rounded-sm
          " @click.prevent="openLearnTopic(activeLearnTopicId)">
          {{ previewTitle }}
          <UIcon name="i-lucide-arrow-up-right" class="size-4 inline-block ml-0.5 opacity-70 align-[-2px]"
            aria-hidden="true" />
        </a>
        <template v-else>
          {{ previewTitle }}
        </template>
      </h1>
      <div class="inline-flex items-stretch border border-(--border) bg-(--surface-2)">
        <div id="preview-toolbar-variant" class="flex items-stretch empty:hidden" />
        <div id="preview-toolbar-wrappers" class="flex items-stretch empty:hidden" />
      </div>
    </div>

    <div class="flex gap-2">
      <AnimatedCountBadge color="error" :count="criticalCount" :noun="t('counter.criticalNoun')"
        :violation-ids="criticalViolationIds" />
      <AnimatedCountBadge color="warning" :count="warningCount" :noun="t('counter.warningsNoun', warningCount)"
        :violation-ids="warningViolationIds" />
      <AnimatedCountBadge color="success" :count="passingCount" :noun="t('counter.passingNoun')" />
    </div>
  </div>
</template>
