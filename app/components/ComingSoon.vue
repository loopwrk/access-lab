<script setup lang="ts">
/**
 * Stub UI shown when the user navigates to a component whose definition
 * is flagged `placeholder: true`. Sits in place of the full studio in
 * `pages/components/[component].vue`.
 *
 */
defineProps<{
  name: string
}>()

const { t } = useI18n()
</script>

<template>
  <section class="coming-soon" role="region" :aria-label="t('comingSoon.ariaLabel')">
    <UCard variant="outline" class="coming-soon-card">
      <div class="flex flex-col gap-5 items-center text-center">
        <UIcon name="i-lucide-construction" class="text-(length:--al-font-size-display) text-(--brand) shrink-0"
          aria-hidden="true" />
        <h2 class="coming-soon-title m-0">{{ t('comingSoon.title', { name }) }}</h2>
        <p class="coming-soon-body m-0">{{ t('comingSoon.body') }}</p>
      </div>
    </UCard>
  </section>
</template>

<style scoped>
.coming-soon {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32px;
  min-height: 0;
}

.coming-soon-card {
  width: 100%;
  max-width: 28rem;
}

.coming-soon-title,
.coming-soon-body {
  text-wrap: balance;
}

.coming-soon-title {
  font-size: var(--al-font-size-heading);
  font-weight: 600;
  color: var(--text-primary);
  line-height: 1.2;
}

.coming-soon-body {
  font-size: var(--al-font-size-body);
  line-height: 1.5;
  color: var(--text-secondary);
}
</style>
