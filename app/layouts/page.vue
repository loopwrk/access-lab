<script setup lang="ts">
/**
 * Minimal layout for standalone site pages (Support, Contact) that sit
 * outside the studio and reader.
 */
</script>

<template>
  <div class="grid grid-rows-[auto_1fr] min-h-dvh bg-(--bg) text-(--text-secondary)">
    <AppBar :show-onboarding-replay="false" />
    <slot />
  </div>
</template>
