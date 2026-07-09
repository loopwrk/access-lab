<script setup lang="ts">
/**
 * Linked / Independent chip for four-sided spacing controls. `true` means
 * the sides are edited independently. One circle per side; linked pulls
 * them to a 1px gap, independent spreads them apart, so the icon itself
 * shows what the mode does.
 */
const independent = defineModel<boolean>({ required: true });

defineProps<{ disabled?: boolean }>();

const { t } = useI18n();

const SIDE_COUNT = 4;
</script>

<template>
  <button
    type="button"
    class="inline-flex items-center gap-[7px] h-7 px-2.5 rounded-[2px] text-xs font-bold tracking-[0.02em] cursor-pointer transition-colors focus-visible:outline-[3px] focus-visible:outline-(--focus-ring) focus-visible:outline-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
    :class="
      independent
        ? 'bg-transparent text-(--text-secondary) border border-(--border)'
        : 'bg-(--brand-soft) text-(--text-primary) border border-(--brand-soft-2)'
    "
    :disabled="disabled"
    @click="independent = !independent"
  >
    <span
      class="inline-flex items-center"
      :class="independent ? 'gap-1' : 'gap-px'"
      aria-hidden="true"
    >
      <span
        v-for="i in SIDE_COUNT"
        :key="i"
        class="size-[9px] shrink-0 rounded-full border-[1.5px] border-current"
      />
    </span>
    {{ independent ? t("controls.spacing.independent") : t("controls.spacing.linked") }}
  </button>
</template>
