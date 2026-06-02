<script setup lang="ts">
const isBelowDesktop = useMediaQuery('(max-width: 1023px)')

const { t } = useI18n()

const { activeTab } = useInspectorTab()
const { isOpen: readModeOpen, activeTopicId: readModeTopicId, close: closeReadMode } = useReadMode()

function skipToPanel(tabName: 'controls' | 'issues') {
  activeTab.value = tabName
  document.getElementById(INSPECTOR_PANEL_IDS[tabName])?.focus()
}
function skipToMain() {
  const iframe = document.getElementById(PREVIEW_IFRAME_ID)
  focusPreviewContent(iframe instanceof HTMLIFrameElement ? iframe : null)
}
</script>

<template>
  <div :inert="isBelowDesktop" class="grid grid-rows-[auto_1fr] min-h-dvh bg-(--bg) text-(--text-secondary)">
    <div class="absolute z-50">
      <a href="#main-content"
        class="absolute sr-only top-2 py-2 px-4 bg-(--brand) text-(--on-brand) rounded-r font-medium no-underline focus:not-sr-only"
        @click.prevent="skipToMain">
        {{ t('skipLinks.main') }}
      </a>
      <a :href="`#${INSPECTOR_PANEL_IDS.controls}`"
        class="absolute sr-only top-2 py-2 px-4 bg-(--brand) text-(--on-brand) rounded-r font-medium no-underline focus:not-sr-only"
        @click.prevent="skipToPanel('controls')">
        {{ t('skipLinks.controls') }}
      </a>
      <a :href="`#${INSPECTOR_PANEL_IDS.issues}`"
        class="absolute sr-only top-2 py-2 px-4 bg-(--brand) text-(--on-brand) rounded-r font-medium no-underline focus:not-sr-only"
        @click.prevent="skipToPanel('issues')">
        {{ t('skipLinks.issues') }}
      </a>
    </div>

    <AppBar />


    <div class="relative grid grid-cols-[auto_1fr_auto] overflow-hidden">
      <div :inert="readModeOpen" class="contents">
        <AppSidebar />

        <main id="main-content" tabindex="-1" class="flex flex-col min-w-0 overflow-hidden focus:outline-none">
          <PreviewToolbar />

          <div class="flex-1 flex items-center justify-center overflow-auto p-6 bg-(--surface-2)">
            <slot />
          </div>

          <CodeDrawer />
        </main>

        <AppInspector />
      </div>

      <div id="read-mode-target" class="contents" />
    </div>

    <LazyReadModeOverlay v-if="readModeOpen && readModeTopicId" :topic-id="readModeTopicId" @close="closeReadMode" />
  </div>

  <MobileBlocker />
</template>
