<script setup lang="ts">
import type { AxeResult, CheckResult, ImpactValue } from "~/types/axe";
import { severityBucket, type RuleClassification } from "~/utils/issueFormatting";

const props = defineProps<{
  color: "error" | "warning" | "success";
  label: string;
  emptyMessage: string;
  violations: AxeResult[];
  /** Pass section renders a slimmer footer (no failure summary, no learn-topic button). */
  isPass?: boolean;
}>();

const { t } = useI18n();

const SECTION_LABEL_CLASS =
  "text-(length:--al-font-size-caption) font-bold uppercase tracking-[0.06em] mt-0 mb-[5px]";
const SECTION_BODY_CLASS = "text-(length:--al-font-size-detail) leading-normal";

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
  switch (severityBucket(impact)) {
    case "critical":
      return "error";
    case "warning":
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

// A rule can supply its own "why it matters" key for a message tuned to that
// rule's real impact; otherwise fall back to the generic, tag-based blurb.
function whyMattersText(violation: AxeResult): string | null {
  return violation.whyItMattersKey ? t(violation.whyItMattersKey) : whyText(violation.tags);
}

function howToFixText(violation: AxeResult): string | null {
  return violation.howToFixKey ? t(violation.howToFixKey) : null;
}

// A single axe violation carries one node per failing element, and each node
// repeats the same fix guidance. Collapse them to the distinct messages so the
// "How to fix" / finding detail render once; the affected-element count is
// surfaced separately (see issues.elementsAffected).
function uniqueFailureSummaries(violation: AxeResult): string[] {
  const summaries = violation.nodes
    .map((node) => node.failureSummary)
    .filter((summary): summary is string => Boolean(summary));
  return [...new Set(summaries)];
}

function uniqueNoneChecks(violation: AxeResult): CheckResult[] {
  const seen = new Map<string, CheckResult>();
  for (const node of violation.nodes) {
    for (const check of node.none) {
      const key = `${check.id}::${check.message}`;
      if (!seen.has(key)) seen.set(key, check);
    }
  }
  return [...seen.values()];
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
      size="md"
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
          :class="`issue-car issue-card--${color} bg-(--color-surface)`"
          :ui="{
            header: 'pl-4 pr-4.5 sm:pl-4 sm:pr-4.5',
            body: 'pl-4 pr-4.5 sm:pl-4 sm:pr-4.5',
            footer: 'pl-4 pr-4.5 sm:pl-4 sm:pr-4.5',
          }"
        >
          <template #header>
            <div class="flex flex-col gap-1 max-h-min p-0">
              <div class="flex flex-wrap items-center gap-1.5 mb-1 p-0">
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
              <h3
                class="text-(length:--al-font-size-violation-heading) text-(--text-primary) leading-[1.3] font-bold m-0"
              >
                {{ violation.help }}
              </h3>
            </div>
          </template>

          <p
            class="text-(length:--al-font-size-body) text-(--text-secondary) m-0 leading-normal max-h-min"
          >
            {{ violation.description }}
          </p>
          <p
            v-if="!isPass && violation.nodes.length > 1"
            class="text-(length:--al-font-size-detail) text-(--text-muted) mt-1.5 mb-0"
          >
            {{ t("issues.elementsAffected", { count: violation.nodes.length }) }}
          </p>

          <template #footer>
            <UCollapsible :default-open="false">
              <UButton
                variant="ghost"
                color="neutral"
                size="md"
                block
                :label="t(isPass ? 'issues.whyItMattersOnly' : 'issues.whyItMatters')"
                leading-icon="i-lucide-info"
                trailing-icon="i-lucide-chevron-down"
                class="group gap-2.5 rounded-lg border border-(--border) bg-(--bg) px-4 py-3 mb-2 hover:bg-(--brand-soft)"
                :ui="{
                  label:
                    'flex-1 text-left text-(--text-primary) text-(length:--al-font-size-heading) font-semibold',
                  leadingIcon: 'size-5 text-(--brand)',
                  trailingIcon:
                    'size-5 text-(--text-muted) group-data-[state=open]:rotate-180 transition-transform duration-200',
                }"
              />
              <template #content>
                <div class="flex flex-col gap-2 pt-2 text-(--text-secondary) leading-normal">
                  <div
                    v-if="whyMattersText(violation)"
                    class="flex flex-col rounded-l-none rounded-r-lg border-l-4 border-l-(--brand) bg-(--brand-soft) mb-4 px-[14px] py-[11px]"
                  >
                    <p :class="[SECTION_LABEL_CLASS, 'text-(--brand-strong)']">
                      {{ t("issues.whySection") }}
                    </p>
                    <p :class="[SECTION_BODY_CLASS, 'm-0']">
                      {{ whyMattersText(violation) }}
                    </p>
                  </div>

                  <template v-if="!isPass">
                    <div
                      v-for="(summary, si) in uniqueFailureSummaries(violation)"
                      :key="si"
                      class="flex flex-col py-2 px-2.5"
                    >
                      <p :class="SECTION_LABEL_CLASS">
                        {{ t("issues.howToFixSection") }}
                      </p>
                      <template
                        v-for="(section, sj) in parseFailureSummary(summary)"
                        :key="sj"
                      >
                        <p
                          class="text-(length:--al-font-size-detail) font-semibold text-(--text-primary) mb-0.5"
                          :class="{ 'mt-2': sj > 0 }"
                        >
                          {{ section.directive }}
                        </p>
                        <ul class="m-0 px-4.5 flex flex-col gap-1 list-disc">
                          <li
                            v-for="(item, ii) in section.items"
                            :key="ii"
                            :class="[SECTION_BODY_CLASS, 'text-(--text-secondary)']"
                          >
                            {{ item }}
                          </li>
                        </ul>
                      </template>
                    </div>

                    <div
                      v-if="uniqueNoneChecks(violation).length"
                      class="flex flex-col gap-1.5"
                    >
                      <div
                        v-for="(check, ci) in uniqueNoneChecks(violation)"
                        :key="ci"
                        class="flex flex-col"
                      >
                        <span :class="SECTION_LABEL_CLASS">
                          {{
                            violation.detailLabelKey
                              ? t(violation.detailLabelKey)
                              : formatRuleId(check.id)
                          }}
                        </span>
                        <p :class="[SECTION_BODY_CLASS, 'text-(--text-secondary)', 'm-0']">
                          {{ check.message }}
                        </p>
                      </div>
                    </div>

                    <div
                      v-if="howToFixText(violation)"
                      class="flex flex-col py-2 pr-2.5"
                    >
                      <p :class="SECTION_LABEL_CLASS">
                        {{ t("issues.howToFixSection") }}
                      </p>
                      <p :class="[SECTION_BODY_CLASS, 'text-(--text-secondary)', 'm-0']">
                        {{ howToFixText(violation) }}
                      </p>
                    </div>

                    <div class="flex flex-col gap-1.5">
                      <button
                        v-if="violation.learnTopicId"
                        type="button"
                        class="inline-flex items-center text-(length:--al-font-size-detail) text-(--brand) bg-transparent border-0 p-0 cursor-pointer hover:text-(--brand-hover) hover:underline self-start"
                        @click="openLearnTopic(violation.learnTopicId)"
                      >
                        {{ t("issues.learnMoreInApp") }}
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
                        class="inline-flex items-center text-(length:--al-font-size-detail) font-semibold text-(--brand) underline hover:text-(--brand-hover) self-start"
                      >
                        {{ t("issues.learnMore") }}
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
                    {{ t("issues.learnMore") }}
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

<style scoped>
.issue-card {
  position: relative;
}

/* Full-height bar flush to the left edge; the card's rounded-lg + overflow-hidden
   clip it so it follows the top-left / bottom-left corners like a thick border. */
.issue-card::before {
  content: "";
  position: absolute;
  inset: 0 auto 0 0;
  width: 0.2rem;
  background: var(--issue-accent, var(--border-strong));
}

.issue-card--error {
  --issue-accent: var(--error);
}

.issue-card--warning {
  --issue-accent: var(--warning);
}

.issue-card--success {
  --issue-accent: var(--success);
}
</style>
