<script setup lang="ts">
import type { AxeResult, ImpactValue } from '~/types/axe'

const props = defineProps<{
  color: 'error' | 'warning' | 'success'
  label: string
  emptyMessage: string
  violations: AxeResult[]
  /** Pass section renders a slimmer footer (no failure summary, no learn-topic button). */
  isPass?: boolean
}>()

const { t } = useI18n()
const { focusLearnTopic } = useInspectorTab()

// Violation sections auto-expand as soon as the first issue arrives so the
// user doesn't have to click to see what failed. Once the user toggles the
// section manually, their choice wins — we stop auto-opening, even if new
// violations land later. The passing section opts out and stays closed by
// default to keep the panel focused on what needs attention.
const isOpen = ref(false)
const userHasToggled = ref(false)

watch(
  () => props.violations.length,
  (count) => {
    if (props.isPass) return
    if (userHasToggled.value) return
    if (count > 0) isOpen.value = true
  },
  { immediate: true }
)

function onOpenChange(next: boolean) {
  userHasToggled.value = true
  isOpen.value = next
}

function impactColor(impact: ImpactValue | undefined): 'error' | 'warning' | 'info' | 'neutral' {
  switch (impact) {
    case 'critical':
    case 'serious':
      return 'error'
    case 'moderate':
    case 'minor':
      return 'warning'
    default:
      return 'neutral'
  }
}

const ACRONYMS = new Set(['wcag', 'aria', 'html', 'css', 'svg', 'url', 'id'])

function formatRuleId(id: string): string {
  const withoutLevel = id.replace(/-aaa?$/, '')
  return withoutLevel.split('-').map(word =>
    ACRONYMS.has(word) ? word.toUpperCase() : word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ')
}

type RuleClassification = 'A' | 'AA' | 'AAA' | 'Best Practice'

const TAG_TO_LEVEL: Array<[string, 'A' | 'AA' | 'AAA']> = [
  ['wcag2aaa', 'AAA'],
  ['wcag22aaa', 'AAA'],
  ['wcag2aa', 'AA'],
  ['wcag21aa', 'AA'],
  ['wcag22aa', 'AA'],
  ['wcag2a', 'A'],
  ['wcag21a', 'A'],
  ['wcag22a', 'A']
]

function classificationFromTags(tags: string[] | undefined): RuleClassification | null {
  if (!tags) return null
  for (const [tag, level] of TAG_TO_LEVEL) {
    if (tags.includes(tag)) return level
  }
  if (tags.includes('best-practice')) return 'Best Practice'
  return null
}

function classificationColor(classification: RuleClassification): 'info' | 'neutral' {
  return classification === 'Best Practice' ? 'neutral' : 'info'
}

interface FailureSection {
  directive: string
  items: string[]
}

function parseFailureSummary(summary: string): FailureSection[] {
  const sections: FailureSection[] = []
  const lines = summary.split('\n')

  let currentSection: FailureSection | null = null

  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed) continue

    if (/^fix (?:any|all) of the following:/i.test(trimmed)) {
      currentSection = { directive: trimmed, items: [] }
      sections.push(currentSection)
    } else if (currentSection) {
      const item = trimmed.replace(/^[-•]\s*/, '').trim()
      if (item) {
        currentSection.items.push(item)
      }
    }
  }

  return sections
}

const TAG_WHY: Record<string, string> = {
  'cat.color': 'Affects users with low vision, color blindness, or anyone in bright or dim lighting conditions.',
  'cat.aria': 'Affects screen reader users — ARIA communicates role, state, and properties to assistive technology.',
  'cat.forms': 'Affects all users filling out forms, especially screen reader users and people with cognitive disabilities.',
  'cat.keyboard': 'Affects keyboard-only users and people using switches, head wands, or eye-tracking input.',
  'cat.language': 'Affects screen reader users — incorrect language settings cause mispronunciation.',
  'cat.name-role-value': 'Affects screen reader users — elements need proper names, roles, and values to be understood by assistive technology.',
  'cat.semantics': 'Affects screen reader users navigating by landmarks, headings, and element types.',
  'cat.sensory-and-visual-cues': 'Affects low-vision and color-blind users who cannot rely on visual cues alone.',
  'cat.structure': 'Affects screen reader users relying on heading hierarchy and landmark regions to navigate the page.',
  'cat.text-alternatives': 'Affects blind and low-vision users who rely on text descriptions of images, icons, and non-text content.',
  'cat.time-and-media': 'Affects users with cognitive disabilities, people who are deaf or hard-of-hearing, and anyone who needs more time to consume content.',
  'wcag2a': 'WCAG Level A — the most basic web accessibility features. Failure means some users cannot use the page at all.',
  'wcag2aa': 'WCAG Level AA — addresses the most common barriers for users with disabilities. Required by most accessibility regulations.',
  'wcag2aaa': 'WCAG Level AAA — the highest standard, ensuring the best possible experience for all users.',
  'wcag21a': 'WCAG Level A — the most basic web accessibility features. Failure means some users cannot use the page at all.',
  'wcag21aa': 'WCAG Level AA — addresses the most common barriers for users with disabilities. Required by most accessibility regulations.',
  'wcag22a': 'WCAG Level A — the most basic web accessibility features. Failure means some users cannot use the page at all.',
  'wcag22aa': 'WCAG Level AA — addresses the most common barriers for users with disabilities. Required by most accessibility regulations.',
  'wcag22aaa': 'WCAG Level AAA — the highest standard, ensuring the best possible experience for all users.',
  'best-practice': 'Not a formal WCAG requirement, but a strongly recommended practice for an inclusive user experience.'
}

const PRINCIPLE_WHY: Record<string, string> = {
  '1': 'WCAG Principle 1 — Perceivable. Content must be presented in ways all users can perceive. Affects blind, low-vision, deaf, and hard-of-hearing users.',
  '2': 'WCAG Principle 2 — Operable. Interface components must be usable by everyone. Affects keyboard-only users, motor-impaired users, and people using alternative input devices.',
  '3': 'WCAG Principle 3 — Understandable. Content and operation must be clear. Affects people with cognitive disabilities, learning difficulties, and non-native speakers.',
  '4': 'WCAG Principle 4 — Robust. Content must work with current and future assistive technologies.'
}

function tagWhy(tags: string[]): string | null {
  for (const tag of tags) {
    if (TAG_WHY[tag]) return TAG_WHY[tag]

    const scMatch = tag.match(/^wcag(\d)(?:\d)(?:\d)(?:\d)?$/)
    if (scMatch?.[1] && PRINCIPLE_WHY[scMatch[1]]) return PRINCIPLE_WHY[scMatch[1]] ?? null
  }

  return null
}
</script>

<template>
  <UCollapsible :open="isOpen" @update:open="onOpenChange">
    <UButton variant="ghost" :color="color" block size="sm" class="justify-between pl-2"
      :label="label" trailing-icon="i-lucide-chevron-down"
      :ui="{ trailingIcon: 'group-data-[state=open]:rotate-180 transition-transform duration-200' }" />

    <template #content>
      <div v-if="violations.length === 0"
        class="text-(length:--al-font-size-body) text-(--text-muted) m-0 py-2 pl-2">
        {{ emptyMessage }}
      </div>

      <div v-else class="flex flex-col gap-3 py-2 px-1">
        <UCard v-for="violation in violations" :key="violation.id" variant="outline" class="issue-card">
          <template #header>
            <div class="flex flex-col gap-1 max-h-min p-0">
              <div class="flex flex-wrap items-center gap-1.5 mb-1">
                <UBadge :label="formatRuleId(violation.id)"
                  :color="isPass ? 'success' : impactColor(violation.impact)" variant="soft" size="md" />
                <UBadge v-if="classificationFromTags(violation.tags)"
                  :label="classificationFromTags(violation.tags) ?? ''"
                  :color="classificationColor(classificationFromTags(violation.tags)!)" variant="outline" size="md" />
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
              <UButton variant="ghost" color="neutral" size="xs"
                :label="t(isPass ? 'issues.whyItMattersOnly' : 'issues.whyItMatters')"
                trailing-icon="i-lucide-chevron-down" class="group"
                :ui="{ trailingIcon: 'group-data-[state=open]:rotate-180 transition-transform duration-200' }" />
              <template #content>
                <div class="flex flex-col gap-2 pt-2 text-(--text-secondary) leading-normal">
                  <div v-if="tagWhy(violation.tags)"
                    class="flex flex-col gap-1 py-2 px-2.5 bg-(--brand-soft) rounded border-l-[3px] border-l-(--brand)">
                    <p
                      class="text-(length:--al-font-size-caption) font-semibold text-(--text-muted) uppercase tracking-[0.06em] m-0">
                      {{ t('issues.whySection') }}
                    </p>
                    <p class="text-(length:--al-font-size-detail) m-0 leading-normal">
                      {{ tagWhy(violation.tags) }}
                    </p>
                  </div>

                  <template v-if="!isPass">
                    <template v-for="node in violation.nodes" :key="node.html">
                      <div v-if="node.failureSummary" class="flex flex-col gap-1.5 py-2 px-2.5 rounded-none">
                        <p class="text-(length:--al-font-size-caption) font-semibold uppercase tracking-[0.06em] m-0">
                          {{ t('issues.howToFixSection') }}
                        </p>
                        <template v-for="(section, si) in parseFailureSummary(node.failureSummary)" :key="si">
                          <p class="text-(length:--al-font-size-detail) font-semibold text-(--text-primary) mb-0.5">
                            {{ section.directive }}
                          </p>
                          <ul class="m-0 px-4.5 flex flex-col gap-1 list-disc">
                            <li v-for="(item, ii) in section.items" :key="ii"
                              class="text-(length:--al-font-size-detail) text-(--text-secondary) leading-normal">
                              {{ item }}
                            </li>
                          </ul>
                        </template>
                      </div>
                      <div v-if="node.none.length" class="flex flex-col gap-1.5">
                        <div v-for="check in node.none" :key="check.id" class="flex flex-col gap-0.5">
                          <span
                            class="text-(length:--al-font-size-caption) font-semibold text-(--text-muted) uppercase">
                            {{ formatRuleId(check.id) }}
                          </span>
                          <p class="text-(length:--al-font-size-detail) text-(--text-secondary) m-0 leading-[1.4]">
                            {{ check.message }}
                          </p>
                        </div>
                      </div>
                    </template>

                    <div class="flex flex-col gap-1.5">
                      <button v-if="violation.learnTopicId" type="button"
                        class="inline-flex items-center text-(length:--al-font-size-detail) text-(--brand) bg-transparent border-0 p-0 cursor-pointer hover:text-(--brand-hover) hover:underline self-start"
                        @click="focusLearnTopic(violation.learnTopicId)">
                        {{ t('issues.learnMoreInApp') }}
                        <span class="i-lucide-arrow-right text-xs ml-1" aria-hidden="true" />
                      </button>
                      <a v-if="violation.helpUrl" :href="violation.helpUrl" target="_blank" rel="noopener noreferrer"
                        class="inline-flex items-center text-(length:--al-font-size-detail) text-(--brand) no-underline hover:text-(--brand-hover) hover:underline self-start">
                        {{ t('issues.learnMore') }}
                        <span class="i-lucide-external-link text-xs ml-1" aria-hidden="true" />
                      </a>
                    </div>
                  </template>

                  <a v-if="isPass && violation.helpUrl" :href="violation.helpUrl" target="_blank"
                    rel="noopener noreferrer"
                    class="inline-flex items-center text-(length:--al-font-size-detail) text-(--brand) no-underline hover:text-(--brand-hover) hover:underline">
                    {{ t('issues.learnMore') }}
                    <span class="i-lucide-external-link text-xs ml-1" aria-hidden="true" />
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
