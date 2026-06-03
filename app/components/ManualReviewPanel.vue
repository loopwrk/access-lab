<script setup lang="ts">
import type { ManualChecklistItem } from "~/rules/types";

const props = defineProps<{
  checklist?: ManualChecklistItem[];
}>();

const ACRONYMS = new Set(["aa", "aaa", "wcag", "aria", "html", "css", "svg", "url", "id"]);

function formatRuleId(id: string): string {
  return id.split("-").map((word) =>
    ACRONYMS.has(word) ? word.toUpperCase() : word.charAt(0).toUpperCase() + word.slice(1),
  ).join(" ");
}

const { items, setChecked, checkAll, uncheckAll, checkedCount, totalCount, progressPercent }
  = useManualReview(props.checklist ?? []);

const { t } = useI18n();

const progressColor = computed(() => {
  if (totalCount.value === 0) return "neutral" as const;
  if (progressPercent.value === 100) return "success" as const;
  if (progressPercent.value > 0) return "info" as const;
  return "neutral" as const;
});
</script>

<template>
  <div class="flex flex-col gap-3">
    <div
      v-if="totalCount"
      class="flex items-center justify-between"
    >
      <p class="text-(length:--al-font-size-heading) font-semibold text-(--text-primary) m-0">
        {{ t('manual.title') }}
      </p>
      <UBadge
        :color="progressColor"
        variant="soft"
        size="md"
      >
        {{ t('manual.progress', { checked: checkedCount, total: totalCount }) }}
      </UBadge>
    </div>

    <div
      v-if="totalCount"
      class="flex gap-2"
    >
      <UButton
        size="sm"
        variant="ghost"
        color="neutral"
        @click="checkAll()"
      >
        {{ t('manual.checkAll') }}
      </UButton>
      <UButton
        size="sm"
        variant="ghost"
        color="neutral"
        @click="uncheckAll()"
      >
        {{ t('manual.uncheckAll') }}
      </UButton>
    </div>

    <USeparator v-if="totalCount" />

    <p class="text-(length:--al-font-size-detail) text-(--text-muted) m-0 leading-normal">
      {{ t('manual.preface') }}
    </p>

    <p
      v-if="!totalCount"
      class="text-(length:--al-font-size-body) text-(--text-muted) m-0 leading-normal"
    >
      {{ t('manual.empty') }}
    </p>

    <div
      v-else
      class="flex flex-col gap-2"
    >
      <UCheckbox
        v-for="item in items"
        :key="item.id"
        :model-value="item.checked"
        variant="card"
        color="neutral"
        @update:model-value="setChecked(item.id, !!$event)"
      >
        <template #label>
          <div class="flex flex-col gap-0.5">
            <span
              v-if="item.wcagSc"
              class="text-(length:--al-font-size-caption) font-semibold text-(--text-muted) uppercase tracking-[0.06em]"
            >
              WCAG {{ item.wcagSc }}
            </span>
            <span
              v-if="item.source === 'axe'"
              class="text-(length:--al-font-size-heading) font-semibold text-(--text-primary)"
            >
              {{ formatRuleId(item.title) }}
            </span>
            <span
              v-else
              class="text-(length:--al-font-size-heading) font-semibold text-(--text-primary)"
            >
              {{ item.title }}
            </span>
          </div>
        </template>
        <template #description>
          <div class="flex flex-col gap-1">
            <p class="text-(length:--al-font-size-detail) text-(--text-secondary) leading-normal m-0">
              {{ item.message }}
            </p>
            <a
              v-if="item.helpUrl"
              :href="item.helpUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center text-(length:--al-font-size-caption) text-(--brand) no-underline hover:text-(--brand-hover) hover:underline"
            >
              {{ t('manual.learnMore') }}
              <span
                class="i-lucide-external-link text-xs ml-1"
                aria-hidden="true"
              />
            </a>
          </div>
        </template>
      </UCheckbox>
    </div>
  </div>
</template>
