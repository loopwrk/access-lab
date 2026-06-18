<script setup lang="ts">
defineProps<{ topic: string; label: string }>();
const { focusLearnTopic } = useInspectorTab();
</script>

<template>
  <a
    :href="`#topic-${topic}`"
    class="control-label-link"
    @click.stop.prevent="focusLearnTopic(topic)"
  >
    {{ label }}
    <UIcon
      name="i-lucide-arrow-up-right"
      class="control-label-link-icon"
      aria-hidden="true"
    />
  </a>
</template>
