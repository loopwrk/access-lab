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

const { t } = useI18n()
</script>

<template>
  <div class="flex flex-col gap-3">
    <template v-if="violations.length === 0">
      <div v-if="passes.length > 0" class="pass-summary">
        <UBadge color="success" variant="soft" size="sm">
          {{ t('issues.passSummary', { count: passes.length }) }}
        </UBadge>
      </div>
      <p class="issues-empty">{{ t('issues.empty') }}</p>
    </template>

    <template v-else>
      <UCard v-for="violation in violations" :key="violation.id" variant="outline" class="issue-card">
        <template #header>
          <div class="flex flex-col gap-1 max-h-min">
            <UBadge :label="violation.id" :color="impactColor(violation.impact)" variant="soft" size="md" />
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

      <div v-if="passes.length > 0" class="pass-summary">
        <span class="pass-summary-text">
          + {{ t('issues.passSummary', { count: passes.length }) }}
        </span>
      </div>
    </template>
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

.pass-summary {
  display: flex;
  align-items: center;
}

.pass-summary-text {
  font-size: var(--al-font-size-detail);
  color: var(--text-muted);
}
</style>
