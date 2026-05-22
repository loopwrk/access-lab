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

const { t } = useI18n()
</script>

<template>
  <div class="flex flex-col gap-3">
    <!-- Critical section -->
    <UCollapsible :default-open="true">
      <UButton variant="ghost" color="error" block size="sm" class="justify-between pl-2"
        :label="t('issues.criticalSection', { count: criticalViolations.length })" trailing-icon="i-lucide-chevron-down"
        :ui="{ trailingIcon: 'group-data-[state=open]:rotate-180 transition-transform duration-200' }" />

      <template #content>
        <div v-if="criticalViolations.length === 0" class="issues-empty py-2 pl-2">
          {{ t('issues.noCritical') }}
        </div>

        <div v-else class="flex flex-col gap-3 py-2 px-1">
          <UCard v-for="violation in criticalViolations" :key="violation.id" variant="outline" class="issue-card">
            <template #header>
              <div class="flex flex-col gap-1 max-h-min p-0">
                <UBadge :label="formatRuleId(violation.id)" class="mb-1" :color="impactColor(violation.impact)"
                  variant="soft" size="md" />
                <h3 class="issue-heading">{{ violation.help }}</h3>
              </div>
            </template>

            <p class="issue-body max-h-min">{{ violation.description }}</p>

            <template #footer>
              <UCollapsible :default-open="false">
                <UButton variant="ghost" color="neutral" size="xs" :label="t('issues.whyItMatters')"
                  trailing-icon="i-lucide-chevron-down" class="group"
                  :ui="{ trailingIcon: 'group-data-[state=open]:rotate-180 transition-transform duration-200' }" />
                <template #content>
                  <div class="issue-collapsible-content">
                    <p>{{ t('issues.nextSteps') }}</p>
                    <a v-if="violation.helpUrl" :href="violation.helpUrl" target="_blank" rel="noopener noreferrer"
                      class="issue-help-link">
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

    <!-- Warnings section -->
    <UCollapsible :default-open="true">
      <UButton variant="ghost" color="warning" block size="sm" class="justify-between pl-2"
        :label="t('issues.warningsSection', { count: warningViolations.length })" trailing-icon="i-lucide-chevron-down"
        :ui="{ trailingIcon: 'group-data-[state=open]:rotate-180 transition-transform duration-200' }" />

      <template #content>
        <div v-if="warningViolations.length === 0" class="issues-empty py-2 pl-2">
          {{ t('issues.noWarnings') }}
        </div>

        <div v-else class="flex flex-col gap-3 py-2 px-1">
          <UCard v-for="violation in warningViolations" :key="violation.id" variant="outline" class="issue-card">
            <template #header>
              <div class="flex flex-col gap-1 max-h-min">
                <UBadge :label="formatRuleId(violation.id)" class="mb-1" :color="impactColor(violation.impact)"
                  variant="soft" size="md" />
                <h3 class="issue-heading">{{ violation.help }}</h3>
              </div>
            </template>

            <p class="issue-body max-h-min">{{ violation.description }}</p>

            <template #footer>
              <UCollapsible :default-open="false">
                <UButton variant="ghost" color="neutral" size="xs" :label="t('issues.whyItMatters')"
                  trailing-icon="i-lucide-chevron-down" class="group"
                  :ui="{ trailingIcon: 'group-data-[state=open]:rotate-180 transition-transform duration-200' }" />
                <template #content>
                  <div class="issue-collapsible-content">
                    <p>{{ t('issues.nextSteps') }}</p>
                    <a v-if="violation.helpUrl" :href="violation.helpUrl" target="_blank" rel="noopener noreferrer"
                      class="issue-help-link">
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

    <!-- Passing section -->
    <UCollapsible :default-open="false">
      <UButton variant="ghost" color="success" block size="sm" class="justify-between pl-2"
        :label="t('issues.passingSection', { count: passes.length })" trailing-icon="i-lucide-chevron-down"
        :ui="{ trailingIcon: 'group-data-[state=open]:rotate-180 transition-transform duration-200' }" />

      <template #content>
        <div v-if="passes.length === 0" class="issues-empty py-2 pl-2">
          {{ t('issues.noPassing') }}
        </div>

        <div v-else class="flex flex-col gap-3 py-2 px-1">
          <UCard v-for="pass in passes" :key="pass.id" variant="outline" class="issue-card">
            <template #header>
              <div class="flex flex-col gap-1 max-h-min">
                <UBadge :label="formatRuleId(pass.id)" class="mb-1" color="success" variant="soft" size="md" />
                <h3 class="issue-heading">{{ pass.help }}</h3>
              </div>
            </template>

            <p class="issue-body max-h-min">{{ pass.description }}</p>

            <template #footer>
              <UCollapsible :default-open="false">
                <UButton variant="ghost" color="neutral" size="xs" :label="t('issues.whyItMatters')"
                  trailing-icon="i-lucide-chevron-down" class="group"
                  :ui="{ trailingIcon: 'group-data-[state=open]:rotate-180 transition-transform duration-200' }" />
                <template #content>
                  <div class="issue-collapsible-content">
                    <p>{{ t('issues.nextSteps') }}</p>
                    <a v-if="pass.helpUrl" :href="pass.helpUrl" target="_blank" rel="noopener noreferrer"
                      class="issue-help-link">
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

<style scoped>
.issue-heading {
  font-size: var(--al-font-size-body);
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
  line-height: 1.3;
}

.issue-body {
  font-size: var(--al-font-size-body);
  color: var(--text-secondary);
  margin: 0;
  line-height: 1.5;
}

.issue-collapsible-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-top: 8px;
  font-size: var(--al-font-size-body);
  color: var(--text-secondary);
  line-height: 1.5;
}

.issue-help-link {
  display: inline-flex;
  align-items: center;
  font-size: var(--al-font-size-detail);
  color: var(--brand);
  text-decoration: none;
}

.issue-help-link:hover {
  color: var(--brand-hover);
  text-decoration: underline;
}

.issues-empty {
  font-size: var(--al-font-size-body);
  color: var(--text-muted);
  margin: 0;
}
</style>
