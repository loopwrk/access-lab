<script setup lang="ts">
import { buttonDefinition } from '~/components/inspected/button/definition'
import { useCustomRules } from '~/composables/useCustomRules'
import { useDomRules } from '~/composables/useDomRules'
import { contentOverflow } from '~/rules/shared/overflow'

const previewRef = ref<{ render: (html: string, css?: string) => void } | null>(null)

const buttonProps = ref<Partial<Record<string, unknown>>>({ ...buttonDefinition.defaultProps })
let renderTimer: ReturnType<typeof setTimeout> | null = null

const customRules = useCustomRules(buttonDefinition.rules)
// Shared DOM-based rules — applied to every inspected component because the
// concerns they cover (overflow, eventually clipping, etc.) aren't specific
// to one element type.
useDomRules([contentOverflow])
const { setHtml } = useRenderedHtml()

watch(buttonProps, () => {
  if (renderTimer) clearTimeout(renderTimer)
  renderTimer = setTimeout(() => {
    const html = buttonDefinition.render(buttonProps.value as any)
    previewRef.value?.render(html)
    setHtml(html)
    customRules.evaluate(buttonProps.value)
  }, 10)
}, { deep: true, immediate: true })
</script>

<template>
  <div class="page-home">
    <div class="home-preview">
      <PreviewIframe ref="previewRef" />
    </div>
  </div>
  <Teleport to="#controls-panel">
    <ControlsPanel v-model="buttonProps" />
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
.page-home {
  display: flex;
  flex: 1;
  height: 100%;
  min-height: 0;
}

.home-preview {
  flex: 1;
  display: flex;
  min-width: 0;
}
</style>
