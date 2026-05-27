<script setup lang="ts">
const iframeRef = useTemplateRef<HTMLIFrameElement>('iframe')

const {
  violations,
  passes,
  incomplete,
  isReady,
  errorMessage,
  criticalCount,
  warningCount,
  passingCount
} = useAxeAudit(iframeRef)

const pendingRender = ref<{ html: string; css?: string; rootFontSize?: number } | null>(null)

function send(html: string, css?: string, rootFontSize?: number) {
  const iframe = iframeRef.value
  if (!iframe || !iframe.contentWindow) return

  iframe.contentWindow.postMessage(
    { type: 'preview:render', html, css: css ?? '', rootFontSize },
    window.location.origin
  )
}

/**
 * Render an HTML fragment into the iframe shell.
 *
 * `rootFontSize` (CSS px) sets the iframe's root font-size so rem-based
 * CSS in the rendered HTML resolves against the same base the controls
 * panel uses.
 */
function render(html: string, css?: string, rootFontSize?: number) {
  if (isReady.value) {
    send(html, css, rootFontSize)
  } else {
    pendingRender.value = { html, css, rootFontSize }
  }
}

watch(isReady, (ready) => {
  if (ready && pendingRender.value) {
    send(pendingRender.value.html, pendingRender.value.css, pendingRender.value.rootFontSize)
    pendingRender.value = null
  }
})

defineExpose({ render, violations, passes, incomplete, criticalCount, warningCount, passingCount })

const { t } = useI18n()
</script>

<template>
  <div class="preview-iframe-wrap">
    <iframe ref="iframe" src="/preview-shell.html" title="Component preview"
      sandbox="allow-scripts allow-same-origin allow-forms" class="preview-iframe" />
    <div v-if="!isReady" class="preview-placeholder">
      <p class="text-muted">
        Loading preview…
      </p>
    </div>
  </div>
</template>

<style scoped>
.preview-iframe-wrap {
  position: relative;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--surface-2);
}

.preview-iframe {
  width: 100%;
  height: 100%;
  border: none;
  background-color: #FFFFFF;
}

.preview-placeholder {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}
</style>
