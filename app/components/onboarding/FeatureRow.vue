<script setup lang="ts">
import type { Component } from "vue";

// A single feature row inside the onboarding tour: a text column (icon tile +
// title + description) on the left and an optional decorative visual on the
// right. The two columns share the width via flex; the visual is wrapped in an
// aria-hidden container - the text carries the meaning, the visual just shows it.
withDefaults(
  defineProps<{
    icon: string;
    title: string;
    description: string;
    visual?: Component;
  }>(),
  { visual: undefined },
);
</script>

<template>
  <li class="flex items-start gap-8">
    <div class="flex-1 min-w-0 flex gap-3">
      <span
        class="inline-flex items-center justify-center size-[42px] flex-none bg-(--brand-soft) text-(--brand) rounded-md"
      >
        <UIcon
          :name="icon"
          class="size-[28px]"
          aria-hidden="true"
        />
      </span>
      <div class="flex flex-col gap-1">
        <span class="text-(length:--al-font-size-display) font-semibold text-(--text-primary)">
          {{ title }}
        </span>
        <span class="text-(length:--al-font-size-body) text-(--text-secondary) leading-normal">
          {{ description }}
        </span>
      </div>
    </div>

    <!-- The visual sits in a flex-none column so it keeps its own (content-driven)
         width and is pushed to the right edge by the flex-1 text column. -->
    <div
      v-if="visual"
      class="flex-none"
      aria-hidden="true"
    >
      <component :is="visual" />
    </div>
  </li>
</template>
