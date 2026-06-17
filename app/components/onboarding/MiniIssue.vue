<script setup lang="ts">
// Static reduction of an IssueSection violation card. Reuses contrast.verdictAA
// and issues.whyItMatters; the rule id is an inline literal; the title/description
// are sample copy. Severity-tinted rule badge mirrors the real issue cards.
const { t } = useI18n();
</script>

<template>
  <div class="w-[400px] bg-(--surface) border border-(--border) rounded-md overflow-hidden">
    <div class="p-3 flex flex-col gap-2">
      <div class="flex gap-1.5">
        <UBadge
          color="error"
          variant="soft"
          size="sm"
          :ui="{ base: 'rounded-none font-mono' }"
        >
          color-contrast
        </UBadge>
        <UBadge
          color="info"
          variant="outline"
          size="sm"
          :ui="{ base: 'rounded-none' }"
        >
          {{ t("contrast.verdictAA") }}
        </UBadge>
      </div>
      <span
        class="text-(length:--al-font-size-detail) font-semibold text-(--text-primary) leading-snug"
      >
        {{ t("onboarding.visuals.issue.title") }}
      </span>
      <span class="text-(length:--al-font-size-caption) text-(--text-secondary) leading-normal">
        {{ t("onboarding.visuals.issue.description") }}
      </span>
    </div>
    <div
      class="py-2 px-3 border-t border-(--border) flex items-center gap-1.5 text-(length:--al-font-size-caption) font-semibold text-(--text-muted)"
    >
      {{ t("issues.whyItMatters") }}
      <UIcon
        name="i-lucide-chevron-down"
        class="size-3.5"
      />
    </div>
  </div>
</template>
