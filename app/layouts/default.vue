<script setup lang="ts">
/**
 * Studio layout. Hosts the AppBar, sidebar, preview area, code
 * drawer and inspector — everything needed for the component-auditing
 * workflow on `/components/*` and the root redirect.
 *
 * The reader (`/learn/*`) lives in its own `learn` layout, which is
 * why none of the read-mode plumbing (overlays, inert toggles,
 * teleport targets) appears here any more — that whole flow is now
 * a real route hop.
 */
const isBelowDesktop = useIsBelowDesktop()

const { t } = useI18n()

const { activeTab } = useInspectorTab()

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
  </div>

  <!--
    Mobile blocker covers the studio (not designed for narrow
    viewports). The `learn` layout doesn't render it, so reading is
    deliberately mobile-usable — see `layouts/learn.vue`.
  -->
  <MobileBlocker />
</template>
