<script setup lang="ts">
const { t } = useI18n()
</script>

<template>
  <div class="flex items-center justify-center h-full">
    <div class="text-center max-w-md">
      <h2 class="text-xl font-medium mb-2" style="color: var(--text-primary)">
        {{ t('home.welcome') }}
      </h2>
      <p style="color: var(--text-secondary)">
        {{ t('home.instruction') }}
      </p>
    </div>
  </div>
</template>
