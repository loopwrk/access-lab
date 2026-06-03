<script setup lang="ts">
/**
 * Stub UI shown when the user navigates to a component whose definition
 * is flagged `placeholder: true`. Sits in place of the full studio in
 * `pages/components/[component].vue`.
 *
 */
defineProps<{
  name: string;
}>();

const { t } = useI18n();
</script>

<template>
  <section
    class="flex-1 flex items-center justify-center p-8 min-h-0"
    role="region"
    :aria-label="t('comingSoon.ariaLabel')"
  >
    <UCard
      variant="outline"
      class="w-full max-w-md"
    >
      <div class="flex flex-col gap-5 items-center text-center">
        <UIcon
          name="i-lucide-construction"
          class="text-(length:--al-font-size-display) text-(--brand) shrink-0"
          aria-hidden="true"
        />
        <h2
          class="m-0 text-balance text-(length:--al-font-size-heading) font-semibold text-(--text-primary) leading-tight"
        >
          {{ t('comingSoon.title', { name }) }}
        </h2>
        <p class="m-0 text-balance text-(length:--al-font-size-body) text-(--text-secondary) leading-normal">
          {{ t('comingSoon.body') }}
        </p>
      </div>
    </UCard>
  </section>
</template>
