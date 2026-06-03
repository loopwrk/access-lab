<template>
  <a
    :href="href"
    :target="isExternal ? '_blank' : target"
    :rel="isExternal ? 'noopener noreferrer' : rel"
  >
    <slot />
    <span
      v-if="isExternal"
      aria-hidden="true"
    >
      <Icon
        name="lucide:external-link"
        size="16"
        class="inline-block ml-1"
      />
    </span>
  </a>
</template>

<script setup lang="ts">
const props = defineProps<{
  href: string;
  target?: string;
  rel?: string;
}>();

const isExternal = computed(() =>
  props.href?.startsWith("http://") || props.href?.startsWith("https://"),
);
</script>
