<script setup lang="ts">
// Static reduction of the CodeDrawer - HTML/CSS tabs, a code block, and the two
// copy buttons. Reuses codeDrawer.copyInline / copyClasses; the heading is sample
// copy; the snippet + tab labels are inline literals.
const { t } = useI18n();
</script>

<template>
  <div class="w-[400px] bg-(--surface) border border-(--border) rounded-md overflow-hidden">
    <div class="flex items-center justify-between py-1.5 px-3 border-b border-(--border)">
      <span
        class="inline-flex items-center gap-1.5 text-(length:--al-font-size-detail) font-semibold text-(--text-primary)"
      >
        <UIcon
          name="i-lucide-code"
          class="size-3.5 text-(--text-muted)"
        />
        {{ t("onboarding.visuals.code.title") }}
      </span>
      <UIcon
        name="i-lucide-chevron-down"
        class="size-3.5 text-(--text-muted)"
      />
    </div>
    <div class="p-3 flex flex-col gap-2.5">
      <span class="inline-flex">
        <span
          class="py-0.5 px-2.5 text-(length:--al-font-size-caption) font-semibold border border-(--border-strong) bg-(--brand) text-(--on-brand)"
          >HTML</span
        >
        <span
          class="py-0.5 px-2.5 text-(length:--al-font-size-caption) font-semibold border border-l-0 border-(--border-strong) bg-(--surface) text-(--text-primary)"
          >CSS</span
        >
        <span
          class="py-0.5 px-2.5 text-(length:--al-font-size-caption) font-semibold border border-l-0 border-(--border-strong) bg-(--surface) text-(--text-primary)"
          >JavaScript</span
        >
      </span>
      <div
        class="p-2.5 bg-(--bg) border border-(--border) rounded-md font-mono text-(length:--al-font-size-caption) text-(--text-primary) leading-relaxed break-all"
      >
        &lt;button type="button"&gt;Trigger click event&lt;/button&gt;
      </div>
      <div class="flex gap-2">
        <span
          class="inline-flex items-center gap-1.5 py-1 px-2.5 border border-(--border-strong) text-(length:--al-font-size-caption) font-semibold text-(--text-primary)"
        >
          <UIcon
            name="i-lucide-copy"
            class="size-3"
          />
          {{ t("codeDrawer.copyInline") }}
        </span>
        <span
          class="inline-flex items-center gap-1.5 py-1 px-2.5 border border-(--border-strong) text-(length:--al-font-size-caption) font-semibold text-(--text-primary)"
        >
          <UIcon
            name="i-lucide-copy"
            class="size-3"
          />
          {{ t("codeDrawer.copyClasses") }}
        </span>
      </div>
    </div>
  </div>
</template>
