<script setup lang="ts">
/**
 * Component studio route — `/components/:component`.
 *
 * Reads the route slug, looks up the matching definition from the registry,
 * and drives the studio off it. Unknown or unimplemented slugs throw a 404.
 *
 */
import { getDefinition } from '~/components/inspected'
import { useCustomRules } from '~/composables/useCustomRules'
import { useDomRules } from '~/composables/useDomRules'
import { contentOverflow } from '~/rules/shared/overflow'
import { invisibleText } from '~/rules/shared/invisible-text'

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

const previewRef = ref<{ render: (html: string, css?: string) => void } | null>(null)
const componentProps = ref<Partial<Record<string, unknown>>>({ ...definition.defaultProps })

let renderTimer: ReturnType<typeof setTimeout> | null = null

const customRules = useCustomRules([...definition.rules, invisibleText])

useDomRules([contentOverflow])

const { setHtml } = useRenderedHtml()

watch(componentProps, () => {
  if (renderTimer) clearTimeout(renderTimer)
  renderTimer = setTimeout(() => {
    const html = definition.render(componentProps.value)
    previewRef.value?.render(html)
    setHtml(html)
    customRules.evaluate(componentProps.value)
  }, 10)
}, { deep: true, immediate: true })
</script>

<template>
  <div class="page-component">
    <div class="component-preview">
      <PreviewIframe ref="previewRef" />
    </div>
  </div>
  <Teleport to="#controls-panel">
    <ControlsPanel v-model="componentProps" />
  </Teleport>
  <Teleport to="#issues-panel">
    <IssuesPanel />
  </Teleport>
  <Teleport to="#manual-panel">
    <ManualReviewPanel />
  </Teleport>
  <Teleport to="#learn-panel">
    <LearnPanel />
  </Teleport>
</template>

<style scoped>
.page-component {
  display: flex;
  flex: 1;
  height: 100%;
  min-height: 0;
}

.component-preview {
  flex: 1;
  display: flex;
  min-width: 0;
}
</style>
