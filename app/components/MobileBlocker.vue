<script setup lang="ts">
/**
 * Full-viewport blocker shown below the `lg` breakpoint (1024px).
 *
 */
const { t } = useI18n();
</script>

<template>
  <aside
    class="fixed inset-0 z-[1000] bg-(--bg) flex items-center justify-center p-6 overflow-y-auto lg:hidden"
    role="region"
    :aria-label="t('mobileBlocker.ariaLabel')"
  >
    <UCard
      class="w-full max-w-md"
      variant="outline"
    >
      <div class="flex flex-col gap-5 items-center text-center">
        <UIcon
          name="i-lucide-monitor"
          class="text-(length:--al-font-size-display) text-(--brand) shrink-0"
          aria-hidden="true"
        />
        <h1
          class="m-0 text-balance text-(length:--al-font-size-heading) font-semibold text-(--text-primary) leading-tight"
        >
          {{ t('mobileBlocker.title') }}
        </h1>
        <p
          class="m-0 text-balance text-left text-(length:--al-font-size-body) text-(--text-secondary) leading-normal"
        >
          {{ t('mobileBlocker.p1') }}
        </p>
        <p class="m-0 text-balance text-(length:--al-font-size-detail) text-(--text-muted) font-medium">
          {{ t('mobileBlocker.footer') }}
        </p>
      </div>
    </UCard>
  </aside>
</template>
