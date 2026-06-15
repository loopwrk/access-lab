<script setup lang="ts">
import { getDefinition } from "~/components/inspected";

definePageMeta({
  key: (route) => route.fullPath,
});

const route = useRoute();
const slug = Array.isArray(route.params.component)
  ? route.params.component[0]
  : route.params.component;

const isLegacyButton = slug === "button";

if (isLegacyButton) {
  await navigateTo("/components/buttons/action-triggers", { replace: true });
}

const definition = isLegacyButton ? null : getDefinition(slug ?? "");

if (!definition && !isLegacyButton) {
  throw createError({
    statusCode: 404,
    statusMessage: `Component "${slug}" not found`,
    fatal: true,
  });
}
</script>

<template>
  <ComponentStudio
    v-if="definition"
    :definition="definition"
  />
</template>
