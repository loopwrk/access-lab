<script setup lang="ts">
import { getDefinition } from '~/components/inspected'

definePageMeta({
  key: route => route.fullPath
})

const route = useRoute()
const slug = Array.isArray(route.params.component)
  ? route.params.component[0]
  : route.params.component

const definition = getDefinition(slug ?? '')
if (!definition) {
  throw createError({
    statusCode: 404,
    statusMessage: `Component "${slug}" not found`,
    fatal: true
  })
}
</script>

<template>
  <ComingSoon v-if="definition.placeholder" :name="definition.name" />
  <ComponentStudio v-else :definition="definition" />
</template>
