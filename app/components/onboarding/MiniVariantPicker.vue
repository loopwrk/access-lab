<script setup lang="ts">
// Static reduction of VariantPicker, using the Checkbox element's variants as the
// example. Reuses the real picker's class vocabulary (uppercase label, brand-soft
// chip, surface-2 code chip, brand left-rule, the success "Recommended" badge) and
// the real checkbox variant copy. Code snippets are inline literals (entity-encoded),
// identical in every locale.
const { t } = useI18n();
</script>

<template>
  <div class="w-[420px]">
    <!-- Markup chip -->
    <div class="inline-flex items-stretch border border-(--border) bg-(--surface-2) mb-2">
      <span
        class="flex items-center px-2.5 text-(length:--al-font-size-caption) font-semibold uppercase tracking-wider text-(--text-muted)"
      >
        {{ t("variantPicker.markup") }}
      </span>
      <span class="self-stretch w-px bg-(--border)" />
      <span
        class="inline-flex items-center gap-1.5 px-2.5 py-1 bg-(--brand-soft) text-(--brand) font-mono text-(length:--al-font-size-detail)"
      >
        <code>&lt;input type="checkbox"&gt;</code>
        <UIcon
          name="i-lucide-chevron-down"
          class="size-3.5"
        />
      </span>
    </div>

    <!-- Open "Render as" list -->
    <div class="bg-(--surface) border border-(--border-strong) shadow-lg">
      <div class="px-3 py-2 bg-(--brand-soft) border-b border-(--border)">
        <span
          class="text-(length:--al-font-size-caption) font-semibold uppercase tracking-wider text-(--text-muted)"
        >
          {{ t("variantPicker.title") }}
        </span>
      </div>

      <div class="border-l-4 border-(--brand) bg-(--brand-soft) px-3 py-2.5 flex flex-col gap-1.5">
        <span class="flex items-center gap-2 flex-wrap">
          <code
            class="font-mono text-(length:--al-font-size-detail) bg-(--surface-2) text-(--text-primary) px-2 py-0.5"
            >&lt;input type="checkbox"&gt;</code
          >
          <UBadge
            color="success"
            variant="soft"
            size="sm"
            :ui="{ base: 'rounded-none uppercase tracking-wider' }"
          >
            {{ t("variantPicker.recommended") }}
          </UBadge>
        </span>
        <span class="text-(length:--al-font-size-detail) text-(--text-secondary)">
          {{ t("components.checkbox.variants.input-checkbox.statusNote") }}
        </span>
      </div>

      <div
        class="border-l-4 border-transparent border-t border-(--border) px-3 py-2.5 flex flex-col gap-1.5"
      >
        <code
          class="font-mono text-(length:--al-font-size-detail) bg-(--surface-2) text-(--text-primary) px-2 py-0.5 self-start"
          >&lt;div role="checkbox"&gt;</code
        >
        <span
          class="inline-flex items-start gap-1.5 text-(length:--al-font-size-detail) text-(--text-secondary)"
        >
          <UIcon
            name="i-lucide-info"
            class="size-3.5 mt-0.5 shrink-0 text-(--info)"
          />
          {{ t("components.checkbox.variants.div-checkbox.statusNote") }}
        </span>
      </div>
    </div>
  </div>
</template>
