<script setup lang="ts">
/**
 * The `<legend>` for a controls fieldset. Renders the section title, and when
 * `learnTopic` is given, turns the title into a `LearnLink` to that topic.
 * One place owns the legend's classes so every section heading stays visually
 * consistent.
 */
import LearnLink from "./LearnLink.vue";

defineProps<{ label: string; learnTopic?: string }>();
</script>

<template>
  <legend class="control-group-title mb-1.5">
    <LearnLink
      v-if="learnTopic"
      :topic="learnTopic"
      :label="label"
    />
    <template v-else>{{ label }}</template>
  </legend>
</template>
