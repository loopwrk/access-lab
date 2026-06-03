<script setup lang="ts">
import { getDefinition } from "~/components/inspected";

definePageMeta({
  key: (route) => route.fullPath,
});

const route = useRoute();
const pattern = Array.isArray(route.params.pattern)
  ? route.params.pattern[0]
  : route.params.pattern;

const definition = getDefinition(`buttons-${pattern ?? ""}`);
if (!definition) {
  throw createError({
    statusCode: 404,
    statusMessage: `Button pattern "${pattern}" not found`,
    fatal: true,
  });
}
</script>

<template>
  <ComponentStudio :definition="definition" />
</template>
