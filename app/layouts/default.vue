<script setup lang="ts">
import { useMediaQuery } from '@vueuse/core'
import type { TabsItem } from '@nuxt/ui'

const isBelowDesktop = useMediaQuery('(max-width: 1023px)')

const { t } = useI18n()

// Sidebar collapse state
const sidebarOpen = ref(true)

// Inspector tab state — shared composable so components teleported into the
// inspector panels (e.g. ControlsIntro) can switch tabs themselves.
const { activeTab } = useInspectorTab()

const tabItems = computed<TabsItem[]>(() => [
  { label: t('inspector.controls'), value: 'controls' },
  { label: t('inspector.issues'), value: 'issues' },
  { label: t('inspector.manual'), value: 'manual' },
  { label: t('inspector.learn'), value: 'learn' }
])

async function skipToPanel(tabName: 'controls' | 'issues', elementId: string) {
  activeTab.value = tabName

  const target = document.getElementById(elementId)
  if (target) {
    target.focus()
  }
}
function skipToMain() {
  const iframe = document.querySelector<HTMLIFrameElement>('iframe[title="Component preview"]')
  focusPreviewContent(iframe)
}
</script>

<template>
  <div class="app-shell" :inert="isBelowDesktop">
    <!-- Skip links -->
    <div class="skip-links">
      <a href="#main-content" class="skip-link" @click.prevent="skipToMain">{{ t('skipLinks.main') }}</a>
      <a href="#controls-panel" class="skip-link" @click="skipToPanel('controls', 'controls-panel')">
        {{ t('skipLinks.controls') }}
      </a>
      <a href="#issues-panel" class="skip-link" @click="skipToPanel('issues', 'issues-panel')">
        {{ t('skipLinks.issues') }}
      </a>
    </div>

    <AppBar v-model:sidebar-open="sidebarOpen" />

    <div class="app-body">
      <AppSidebar v-model:open="sidebarOpen" />

      <!-- Main content -->
      <main id="main-content" class="main" tabindex="-1">
        <PreviewToolbar />

        <!-- Preview area -->
        <div class="preview-area">
          <slot />
        </div>

        <CodeDrawer />
      </main>

      <!-- Right inspector -->
      <aside class="inspector" aria-label="Inspection panel">
        <UTabs v-model="activeTab" :items="tabItems" variant="link" color="primary" size="lg" :content="false"
          :ui="{ list: 'justify-around', label: 'overflow-visible whitespace-nowrap' }" />

        <!-- Tab panels
          Content currently created in index.vue and
          teleported here during development and testing.
          Refactoring will take place once the content and
          structure of each panel is finalized.
        -->

        <div class="inspector-panels">
          <div v-show="activeTab === 'controls'" id="controls-panel" class="inspector-panel" tabindex="0">
            <RootEmSlider />
          </div>

          <div v-show="activeTab === 'issues'" id="issues-panel" class="inspector-panel" tabindex="0" />

          <div v-show="activeTab === 'manual'" id="manual-panel" class="inspector-panel" tabindex="0" />

          <div v-show="activeTab === 'learn'" id="learn-panel" class="inspector-panel" tabindex="0" />
        </div>
      </aside>
    </div>
  </div>

  <MobileBlocker />
</template>

<style scoped>
/* ── Shell grid ────────────────────────────────────────────────── */
.app-shell {
  display: grid;
  grid-template-rows: auto 1fr;
  min-height: 100dvh;
  background: var(--bg);
  color: var(--text-secondary);
}

.app-body {
  display: grid;
  grid-template-columns: auto 1fr auto;
  overflow: hidden;
}

/* ── Skip links ─────────────────────────────────────────────────── */
.skip-links {
  position: absolute;
  z-index: 100;
}

.skip-link {
  position: absolute;
  left: -9999px;
  top: 8px;
  padding: 8px 16px;
  background: var(--brand);
  color: var(--on-brand);
  border-radius: 0 4px 4px 0;
  font-weight: 500;
  text-decoration: none;
}

.skip-link:focus {
  left: 0;
}

/* ── Main content ───────────────────────────────────────────────── */
.main {
  display: flex;
  flex-direction: column;
  min-width: 0;
  overflow: hidden;
}

.main:focus {
  outline: none;
}

/* Preview area */
.preview-area {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--surface-2);
  padding: 24px;
  overflow: auto;
}

/* Code drawer */

/* ── Right inspector ────────────────────────────────────────────── */
.inspector {
  width: 380px;
  border-left: 1px solid var(--border);
  background: var(--bg);
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  flex-shrink: 0;
}

/* Inspector panels */
.inspector-panels {
  flex: 1;
  overflow-y: auto;
}

.inspector-panel {
  height: 1vh;
  padding: 16px;
}

/* ── Utility ────────────────────────────────────────────────────── */
.text-muted {
  color: var(--text-muted);
  font-size: var(--al-font-size-body);
}

.text-lg {
  font-size: var(--al-font-size-display);
}

.text-sm {
  font-size: var(--al-font-size-heading);
}
</style>
