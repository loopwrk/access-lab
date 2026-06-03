<script setup lang="ts">
const { allViolations: violations } = useAllViolations();
const results = useAxeResults();
const passes = computed(() => results.value.passes);

const criticalViolations = computed(() =>
  violations.value.filter((v) => v.impact === "critical" || v.impact === "serious"),
);

const warningViolations = computed(() =>
  violations.value.filter((v) => v.impact === "moderate" || v.impact === "minor"),
);

const { t } = useI18n();
</script>

<template>
  <div class="flex flex-col gap-3">
    <IssueSection
      color="error"
      :label="t('issues.criticalSection', { count: criticalViolations.length })"
      :empty-message="t('issues.noCritical')"
      :violations="criticalViolations"
    />

    <IssueSection
      color="warning"
      :label="t('issues.warningsSection', { count: warningViolations.length })"
      :empty-message="t('issues.noWarnings')"
      :violations="warningViolations"
    />

    <IssueSection
      color="success"
      :label="t('issues.passingSection', { count: passes.length })"
      :empty-message="t('issues.noPassing')"
      :violations="passes"
      is-pass
    />
  </div>
</template>
