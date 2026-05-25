<script setup lang="ts">
type ImpactValue = 'minor' | 'moderate' | 'serious' | 'critical' | null

interface CheckResult {
  id: string
  impact?: ImpactValue
  message: string
  data: unknown
}

interface NodeResult {
  html: string
  impact?: ImpactValue
  target: string[]
  any: CheckResult[]
  all: CheckResult[]
  none: CheckResult[]
  failureSummary?: string
}

interface AxeResult {
  id: string
  description: string
  help: string
  helpUrl: string
  impact?: ImpactValue
  tags: string[]
  nodes: NodeResult[]
}

const { allViolations: violations } = useAllViolations()
const results = useAxeResults()
const passes = computed(() => results.value.passes)

const criticalViolations = computed(() =>
  violations.value.filter(v => v.impact === 'critical' || v.impact === 'serious')
)

const warningViolations = computed(() =>
  violations.value.filter(v => v.impact === 'moderate' || v.impact === 'minor')
)

function impactColor(impact: ImpactValue | undefined): 'error' | 'warning' | 'info' | 'neutral' {
  switch (impact) {
    case 'critical':
      return 'error'
    case 'serious':
      return 'error'
    case 'moderate':
      return 'warning'
    case 'minor':
      return 'warning'
    default:
      return 'neutral'
  }
}

const ACRONYMS = new Set(['aa', 'aaa', 'wcag', 'aria', 'html', 'css', 'svg', 'url', 'id'])

function formatRuleId(id: string): string {
  return id.split('-').map(word =>
    ACRONYMS.has(word) ? word.toUpperCase() : word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ')
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

const { t } = useI18n()
const { focusPanel } = useInspectorTab()
</script>

<template>
  <div class="flex flex-col gap-3">
    <!-- Critical section -->
    <UCollapsible :default-open="true">
      <UButton variant="ghost" color="error" block size="sm" class="justify-between pl-2"
        :label="t('issues.criticalSection', { count: criticalViolations.length })" trailing-icon="i-lucide-chevron-down"
        :ui="{ trailingIcon: 'group-data-[state=open]:rotate-180 transition-transform duration-200' }" />

      <template #content>
        <div v-if="criticalViolations.length === 0"
          class="text-(length:--al-font-size-body) text-(--text-muted) m-0 py-2 pl-2">
          {{ t('issues.noCritical') }}
        </div>

        <div v-else class="flex flex-col gap-3 py-2 px-1">
          <UCard v-for="violation in criticalViolations" :key="violation.id" variant="outline" class="issue-card">
            <template #header>
              <div class="flex flex-col gap-1 max-h-min p-0">
                <UBadge :label="formatRuleId(violation.id)" class="mb-1" :color="impactColor(violation.impact)"
                  variant="soft" size="md" />
                <h3 class="text-(length:--al-font-size-body) text-(--text-primary) leading-[1.3] font-semibold m-0">{{
                  violation.help }}
                </h3>
              </div>
            </template>

            <p class="text-(length:--al-font-size-body) text-(--text-secondary) m-0 leading-normal max-h-min">
              {{
                violation.description }}</p>

            <template #footer>
              <UCollapsible :default-open="false">
                <UButton variant="ghost" color="neutral" size="xs" :label="t('issues.whyItMatters')"
                  trailing-icon="i-lucide-chevron-down" class="group"
                  :ui="{ trailingIcon: 'group-data-[state=open]:rotate-180 transition-transform duration-200' }" />
                <template #content>
                  <div class="flex flex-col gap-2 pt-2 text-(--text-secondary) leading-normal">
                    <div v-if="tagWhy(violation.tags)"
                      class="flex flex-col gap-1 py-2 px-2.5 bg-(--brand-soft) rounded border-l-[3px] border-l-(--brand)">
                      <p
                        class="text-(length:--al-font-size-caption) font-semibold text-(--text-muted) uppercase tracking-[0.06em] m-0">
                        {{ t('issues.whySection') }}</p>
                      <p class="text-(length:--al-font-size-detail) m-0 leading-normal">
                        {{ tagWhy(violation.tags) }}</p>
                    </div>
                    <template v-for="node in violation.nodes" :key="node.html">
                      <div v-if="node.failureSummary" class="flex flex-col gap-1.5 py-2 px-2.5 rounded-none">
                        <p class="text-(length:--al-font-size-caption) font-semibold uppercase tracking-[0.06em] m-0">
                          {{ t('issues.howToFixSection') }}</p>
                        <template v-for="(section, si) in parseFailureSummary(node.failureSummary)" :key="si">
                          <p class="text-(length:--al-font-size-detail) font-semibold text-(--text-primary) mb-0.5">
                            {{ section.directive }}</p>
                          <ul class="m-0 px-4.5 flex flex-col gap-1 list-disc">
                            <li v-for="(item, ii) in section.items" :key="ii"
                              class="text-(length:--al-font-size-detail) text-(--text-secondary) leading-normal">{{ item
                              }}</li>
                          </ul>
                        </template>
                      </div>
                      <div v-if="node.none.length" class="flex flex-col gap-1.5">
                        <div v-for="check in node.none" :key="check.id" class="flex flex-col gap-0.5">
                          <span
                            class="text-(length:--al-font-size-caption) font-semibold text-(--text-muted) uppercase">{{
                              formatRuleId(check.id) }}</span>
                          <p class="text-(length:--al-font-size-detail) text-(--text-secondary) m-0 leading-[1.4]">
                            {{
                              check.message }}</p>
                        </div>
                      </div>
                    </template>
                    <div class="flex flex-col gap-1.5">
                      <button v-if="violation.learnTopicId" type="button"
                        class="inline-flex items-center text-(length:--al-font-size-detail) text-(--brand) bg-transparent border-0 p-0 cursor-pointer hover:text-(--brand-hover) hover:underline self-start"
                        @click="focusPanel('learn', violation.learnTopicId)">
                        {{ t('issues.learnMoreInApp') }}
                        <span class="i-lucide-arrow-right text-xs ml-1" aria-hidden="true" />
                      </button>
                      <a v-if="violation.helpUrl" :href="violation.helpUrl" target="_blank" rel="noopener noreferrer"
                        class="inline-flex items-center text-(length:--al-font-size-detail) text-(--brand) no-underline hover:text-(--brand-hover) hover:underline self-start">
                        {{ t('issues.learnMore') }}
                        <span class="i-lucide-external-link text-xs ml-1" aria-hidden="true" />
                      </a>
                    </div>
                  </div>
                </template>
              </UCollapsible>
            </template>
          </UCard>
        </div>
      </template>
    </UCollapsible>

    <!-- Warnings section -->
    <UCollapsible :default-open="true">
      <UButton variant="ghost" color="warning" block size="sm" class="justify-between pl-2"
        :label="t('issues.warningsSection', { count: warningViolations.length })" trailing-icon="i-lucide-chevron-down"
        :ui="{ trailingIcon: 'group-data-[state=open]:rotate-180 transition-transform duration-200' }" />

      <template #content>
        <div v-if="warningViolations.length === 0"
          class="text-(length:--al-font-size-body) text-(--text-muted) m-0 py-2 pl-2">
          {{ t('issues.noWarnings') }}
        </div>

        <div v-else class="flex flex-col gap-3 py-2 px-1">
          <UCard v-for="violation in warningViolations" :key="violation.id" variant="outline" class="issue-card">
            <template #header>
              <div class="flex flex-col gap-1 max-h-min">
                <UBadge :label="formatRuleId(violation.id)" class="mb-1" :color="impactColor(violation.impact)"
                  variant="soft" size="md" />
                <h3 class="text-(length:--al-font-size-body) text-(--text-primary) leading-[1.3] font-semibold m-0">{{
                  violation.help }}
                </h3>
              </div>
            </template>

            <p class="text-(length:--al-font-size-body) text-(--text-secondary) m-0 leading-normal max-h-[min-content]">
              {{
                violation.description }}</p>

            <template #footer>
              <UCollapsible :default-open="false">
                <UButton variant="ghost" color="neutral" size="xs" :label="t('issues.whyItMatters')"
                  trailing-icon="i-lucide-chevron-down" class="group"
                  :ui="{ trailingIcon: 'group-data-[state=open]:rotate-180 transition-transform duration-200' }" />
                <template #content>
                  <div class="flex flex-col gap-2 pt-2 text-(--text-secondary) leading-normal">
                    <div v-if="tagWhy(violation.tags)"
                      class="flex flex-col gap-1 py-2 px-2.5 bg-(--brand-soft) rounded border-l-[3px] border-l-(--brand)">
                      <p class="text-(length:--al-font-size-caption) font-semibold uppercase tracking-[0.06em] m-0">
                        {{ t('issues.whySection') }}</p>
                      <p class="text-(length:--al-font-size-detail) m-0 leading-normal">
                        {{ tagWhy(violation.tags) }}</p>
                    </div>
                    <template v-for="node in violation.nodes" :key="node.html">
                      <div v-if="node.failureSummary" class="flex flex-col gap-1.5 py-2 px-2.5 rounded-none">
                        <p class="text-(length:--al-font-size-caption) font-semibold uppercase tracking-[0.06em] m-0">
                          {{ t('issues.howToFixSection') }}</p>
                        <template v-for="(section, si) in parseFailureSummary(node.failureSummary)" :key="si">
                          <p class="text-(length:--al-font-size-detail) font-semibold text-(--text-primary) mb-0.5">
                            {{ section.directive }}</p>
                          <ul class="m-0 px-4.5 flex flex-col gap-1 list-disc">
                            <li v-for="(item, ii) in section.items" :key="ii"
                              class="text-(length:--al-font-size-detail) text-(--text-secondary) leading-normal">{{ item
                              }}</li>
                          </ul>
                        </template>
                      </div>
                      <div v-if="node.none.length" class="flex flex-col gap-1.5">
                        <div v-for="check in node.none" :key="check.id" class="flex flex-col gap-0.5">
                          <span
                            class="text-(length:--al-font-size-caption) font-semibold text-(--text-muted) uppercase">{{
                              formatRuleId(check.id) }}</span>
                          <p class="text-(length:--al-font-size-detail) text-(--text-secondary) m-0 leading-[1.4]">
                            {{
                              check.message }}</p>
                        </div>
                      </div>
                    </template>
                    <div class="flex flex-col gap-1.5">
                      <button v-if="violation.learnTopicId" type="button"
                        class="inline-flex items-center text-(length:--al-font-size-detail) text-(--brand) bg-transparent border-0 p-0 cursor-pointer hover:text-(--brand-hover) hover:underline self-start"
                        @click="focusPanel('learn', violation.learnTopicId)">
                        {{ t('issues.learnMoreInApp') }}
                        <span class="i-lucide-arrow-right text-xs ml-1" aria-hidden="true" />
                      </button>
                      <a v-if="violation.helpUrl" :href="violation.helpUrl" target="_blank" rel="noopener noreferrer"
                        class="inline-flex items-center text-(length:--al-font-size-detail) text-(--brand) no-underline hover:text-(--brand-hover) hover:underline self-start">
                        {{ t('issues.learnMore') }}
                        <span class="i-lucide-external-link text-xs ml-1" aria-hidden="true" />
                      </a>
                    </div>
                  </div>
                </template>
              </UCollapsible>
            </template>
          </UCard>
        </div>
      </template>
    </UCollapsible>

    <!-- Passing section -->
    <UCollapsible :default-open="false">
      <UButton variant="ghost" color="success" block size="sm" class="justify-between pl-2"
        :label="t('issues.passingSection', { count: passes.length })" trailing-icon="i-lucide-chevron-down"
        :ui="{ trailingIcon: 'group-data-[state=open]:rotate-180 transition-transform duration-200' }" />

      <template #content>
        <div v-if="passes.length === 0" class="text-(length:--al-font-size-body) text-(--text-muted) m-0 py-2 pl-2">
          {{ t('issues.noPassing') }}
        </div>

        <div v-else class="flex flex-col gap-3 py-2 px-1">
          <UCard v-for="pass in passes" :key="pass.id" variant="outline" class="issue-card">
            <template #header>
              <div class="flex flex-col gap-1 max-h-min">
                <UBadge :label="formatRuleId(pass.id)" class="mb-1" color="success" variant="soft" size="md" />
                <h3 class="text-(length:--al-font-size-body) text-(--text-primary) leading-[1.3] font-semibold m-0">{{
                  pass.help }}</h3>
              </div>
            </template>

            <p class="text-(length:--al-font-size-body) text-(--text-secondary) m-0 leading-normal max-h-min">
              {{
                pass.description }}</p>

            <template #footer>
              <UCollapsible :default-open="false">
                <UButton variant="ghost" color="neutral" size="xs" :label="t('issues.whyItMattersOnly')"
                  trailing-icon="i-lucide-chevron-down" class="group"
                  :ui="{ trailingIcon: 'group-data-[state=open]:rotate-180 transition-transform duration-200' }" />
                <template #content>
                  <div class="flex flex-col gap-2 pt-2 text-(--text-secondary) leading-normal">
                    <div v-if="tagWhy(pass.tags)"
                      class="flex flex-col gap-1 py-2 px-2.5 bg-(--brand-soft) rounded border-l-[3px] border-l-(--brand)">
                      <p class="text-(length:--al-font-size-caption) font-semibold uppercase tracking-[0.06em] m-0">
                        {{ t('issues.whySection') }}</p>
                      <p class="text-(length:--al-font-size-detail) m-0 leading-normal">
                        {{ tagWhy(pass.tags) }}</p>
                    </div>
                    <a v-if="pass.helpUrl" :href="pass.helpUrl" target="_blank" rel="noopener noreferrer"
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
  </div>
</template>
