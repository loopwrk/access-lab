<script setup lang="ts">
import { renderButton } from '~/components/inspected/button/render'
import { useCustomRules } from '~/composables/useCustomRules'
import { targetSizeAA, targetSizeAAA } from '~/rules/button/target-size'

const previewRef = ref<{ render: (html: string, css?: string) => void } | null>(null)

const buttonProps = ref<Partial<Record<string, unknown>>>({})
let renderTimer: ReturnType<typeof setTimeout> | null = null

const customRules = useCustomRules([targetSizeAA, targetSizeAAA])
const { setHtml } = useRenderedHtml()

watch(buttonProps, () => {
  if (renderTimer) clearTimeout(renderTimer)
  renderTimer = setTimeout(() => {
    const html = renderButton(buttonProps.value as any)
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
