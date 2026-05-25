<script setup lang="ts">
/**
 * Full-viewport blocker shown below the `lg` breakpoint (1024px).
 *
 */
const { t } = useI18n()
</script>

<template>
  <aside class="mobile-blocker" role="region" :aria-label="t('mobileBlocker.ariaLabel')">
    <UCard class="mobile-blocker-card" variant="outline">
      <div class="flex flex-col gap-5 items-center text-center">
        <UIcon name="i-lucide-monitor" class="text-(length:--al-font-size-display) text-(--brand) shrink-0"
          aria-hidden="true" />
        <h1 class="mobile-blocker-title m-0">{{ t('mobileBlocker.title') }}</h1>
        <p class="mobile-blocker-body m-0 text-left">{{ t('mobileBlocker.p1') }}</p>
        <p class="mobile-blocker-footer m-0">{{ t('mobileBlocker.footer') }}</p>
      </div>
    </UCard>
  </aside>
</template>

<style scoped>
.mobile-blocker {
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: var(--bg);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  overflow-y: auto;
}

@media (min-width: 1024px) {
  .mobile-blocker {
    display: none;
  }
}

.mobile-blocker-card {
  width: 100%;
  max-width: 28rem;
}

.mobile-blocker-title,
.mobile-blocker-body,
.mobile-blocker-footer {
  text-wrap: balance;
}

.mobile-blocker-title {
  font-size: var(--al-font-size-heading);
  font-weight: 600;
  color: var(--text-primary);
  line-height: 1.2;
}

.mobile-blocker-body {
  font-size: var(--al-font-size-body);
  line-height: 1.5;
  color: var(--text-secondary);
}

.mobile-blocker-footer {
  font-size: var(--al-font-size-detail);
  color: var(--text-muted);
  font-weight: 500;
}
</style>
