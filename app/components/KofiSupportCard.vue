<script setup lang="ts">
const { t } = useI18n();

const KOFI_URL = "https://ko-fi.com/accesslab";
</script>

<template>
  <div class="w-full max-w-[21rem] rounded-[14px] border border-(--border) bg-(--surface) p-7">
    <h2 class="mt-3 text-[1.3125rem] font-bold leading-tight text-(--text-primary)">
      {{ t("support.kofi.heading") }}
    </h2>

    <p class="mt-2 text-[1rem] leading-[1.55] text-(--text-secondary)">
      {{ t("support.kofi.body") }}
    </p>

    <a
      :href="KOFI_URL"
      target="_blank"
      rel="noopener noreferrer"
      class="mt-6 inline-flex items-center gap-2.5 rounded-[10px] bg-[#29abe0] px-5 py-[13px] font-bold text-white no-underline hover:bg-[#2196c6] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--focus-ring) motion-safe:transition-colors"
    >
      <UIcon
        name="i-simple-icons-kofi"
        class="size-[22px] shrink-0"
        aria-hidden="true"
      />
      <span class="text-[1rem]">{{ t("support.kofi.cta") }}</span>
      <span class="sr-only">{{ t("support.kofi.newTab") }}</span>
    </a>
  </div>
</template>
