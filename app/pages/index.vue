<script setup lang="ts">
/**
 * Root → default-component redirect.
 *
 * The studio always works against a specific component, so `/` has no
 * meaningful landing of its own. Redirecting here keeps the default in
 * one place (rather than buried in a nuxt.config routeRule) and lets us
 * change the default later by editing this single line.
 *
 */
await navigateTo('/components/buttons/action-triggers', { replace: true })
</script>

<template>
  <div />
</template>
