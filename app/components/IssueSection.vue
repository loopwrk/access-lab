<script setup lang="ts">
import type { AxeResult, ImpactValue } from "~/types/axe";
import type { RuleClassification } from "~/utils/issueFormatting";

const props = defineProps<{
  color: "error" | "warning" | "success";
  label: string;
  emptyMessage: string;
  violations: AxeResult[];
  /** Pass section renders a slimmer footer (no failure summary, no learn-topic button). */
  isPass?: boolean;
}>();

const { t } = useI18n();
const { focusLearnTopic } = useInspectorTab();

// Violation sections auto-expand as soon as the first issue arrives so the
// user doesn't have to click to see what failed. Once the user toggles the
// section manually, their choice wins — we stop auto-opening, even if new
// violations land later. The passing section opts out and stays closed by
// default to keep the panel focused on what needs attention.
const isOpen = ref(false);
const userHasToggled = ref(false);

watch(
  () => props.violations.length,
  (count) => {
    if (props.isPass) return;
    if (userHasToggled.value) return;
    if (count > 0) isOpen.value = true;
  },
  { immediate: true },
);

function onOpenChange(next: boolean) {
  userHasToggled.value = true;
  isOpen.value = next;
}

function impactColor(impact: ImpactValue | undefined): "error" | "warning" | "info" | "neutral" {
  switch (impact) {
    case "critical":
    case "serious":
      return "error";
    case "moderate":
    case "minor":
      return "warning";
    default:
      return "neutral";
  }
}

function classificationColor(classification: RuleClassification): "info" | "neutral" {
  return classification === "Best Practice" ? "neutral" : "info";
}

function whyText(tags: string[]): string | null {
  const key = issueWhyKey(tags);
  return key ? t(key) : null;
}
</script>

<template>
  <UCollapsible
    :open="isOpen"
    @update:open="onOpenChange"
  >
    <UButton
      variant="ghost"
      :color="color"
      block
      size="sm"
      class="justify-between pl-2"
      :label="label"
      trailing-icon="i-lucide-chevron-down"
      :ui="{ trailingIcon: 'group-data-[state=open]:rotate-180 transition-transform duration-200' }"
    />

    <template #content>
      <div
        v-if="violations.length === 0"
        class="text-(length:--al-font-size-body) text-(--text-muted) m-0 py-2 pl-2"
      >
        {{ emptyMessage }}
      </div>

      <div
        v-else
        class="flex flex-col gap-3 py-2 px-1"
      >
        <UCard
          v-for="violation in violations"
          :key="violation.id"
          variant="outline"
          class="issue-card"
        >
          <template #header>
            <div class="flex flex-col gap-1 max-h-min p-0">
              <div class="flex flex-wrap items-center gap-1.5 mb-1">
                <UBadge
                  :label="formatRuleId(violation.id)"
                  :color="isPass ? 'success' : impactColor(violation.impact)"
                  variant="soft"
                  size="md"
                />
                <UBadge
                  v-if="classificationFromTags(violation.tags)"
                  :label="classificationFromTags(violation.tags) ?? ''"
                  :color="classificationColor(classificationFromTags(violation.tags)!)"
                  variant="outline"
                  size="md"
                />
              </div>
              <h3 class="text-(length:--al-font-size-body) text-(--text-primary) leading-[1.3] font-semibold m-0">
                {{ violation.help }}
              </h3>
            </div>
          </template>

          <p class="text-(length:--al-font-size-body) text-(--text-secondary) m-0 leading-normal max-h-min">
            {{ violation.description }}
          </p>

          <template #footer>
            <UCollapsible :default-open="false">
              <UButton
                variant="ghost"
                color="neutral"
                size="xs"
                :label="t(isPass ? 'issues.whyItMattersOnly' : 'issues.whyItMatters')"
                trailing-icon="i-lucide-chevron-down"
                class="group"
                :ui="{ trailingIcon: 'group-data-[state=open]:rotate-180 transition-transform duration-200' }"
              />
              <template #content>
                <div class="flex flex-col gap-2 pt-2 text-(--text-secondary) leading-normal">
                  <div
                    v-if="whyText(violation.tags)"
                    class="flex flex-col gap-1 py-2 px-2.5 bg-(--brand-soft) rounded border-l-[3px] border-l-(--brand)"
                  >
                    <p
                      class="text-(length:--al-font-size-caption) font-semibold text-(--text-muted) uppercase tracking-[0.06em] m-0"
                    >
                      {{ t('issues.whySection') }}
                    </p>
                    <p class="text-(length:--al-font-size-detail) m-0 leading-normal">
                      {{ whyText(violation.tags) }}
                    </p>
                  </div>

                  <template v-if="!isPass">
                    <template
                      v-for="node in violation.nodes"
                      :key="node.html"
                    >
                      <div
                        v-if="node.failureSummary"
                        class="flex flex-col gap-1.5 py-2 px-2.5 rounded-none"
                      >
                        <p class="text-(length:--al-font-size-caption) font-semibold uppercase tracking-[0.06em] m-0">
                          {{ t('issues.howToFixSection') }}
                        </p>
                        <template
                          v-for="(section, si) in parseFailureSummary(node.failureSummary)"
                          :key="si"
                        >
                          <p class="text-(length:--al-font-size-detail) font-semibold text-(--text-primary) mb-0.5">
                            {{ section.directive }}
                          </p>
                          <ul class="m-0 px-4.5 flex flex-col gap-1 list-disc">
                            <li
                              v-for="(item, ii) in section.items"
                              :key="ii"
                              class="text-(length:--al-font-size-detail) text-(--text-secondary) leading-normal"
                            >
                              {{ item }}
                            </li>
                          </ul>
                        </template>
                      </div>
                      <div
                        v-if="node.none.length"
                        class="flex flex-col gap-1.5"
                      >
                        <div
                          v-for="check in node.none"
                          :key="check.id"
                          class="flex flex-col gap-0.5"
                        >
                          <span
                            class="text-(length:--al-font-size-caption) font-semibold text-(--text-muted) uppercase"
                          >
                            {{ formatRuleId(check.id) }}
                          </span>
                          <p class="text-(length:--al-font-size-detail) text-(--text-secondary) m-0 leading-[1.4]">
                            {{ check.message }}
                          </p>
                        </div>
                      </div>
                    </template>

                    <div class="flex flex-col gap-1.5">
                      <button
                        v-if="violation.learnTopicId"
                        type="button"
                        class="inline-flex items-center text-(length:--al-font-size-detail) text-(--brand) bg-transparent border-0 p-0 cursor-pointer hover:text-(--brand-hover) hover:underline self-start"
                        @click="focusLearnTopic(violation.learnTopicId)"
                      >
                        {{ t('issues.learnMoreInApp') }}
                        <span
                          class="i-lucide-arrow-right text-xs ml-1"
                          aria-hidden="true"
                        />
                      </button>
                      <a
                        v-if="violation.helpUrl"
                        :href="violation.helpUrl"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="inline-flex items-center text-(length:--al-font-size-detail) text-(--brand) no-underline hover:text-(--brand-hover) hover:underline self-start"
                      >
                        {{ t('issues.learnMore') }}
                        <span
                          class="i-lucide-external-link text-xs ml-1"
                          aria-hidden="true"
                        />
                      </a>
                    </div>
                  </template>

                  <a
                    v-if="isPass && violation.helpUrl"
                    :href="violation.helpUrl"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="inline-flex items-center text-(length:--al-font-size-detail) text-(--brand) no-underline hover:text-(--brand-hover) hover:underline"
                  >
                    {{ t('issues.learnMore') }}
                    <span
                      class="i-lucide-external-link text-xs ml-1"
                      aria-hidden="true"
                    />
                  </a>
                </div>
              </template>
            </UCollapsible>
          </template>
        </UCard>
      </div>
    </template>
  </UCollapsible>
</template>
