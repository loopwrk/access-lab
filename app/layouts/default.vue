<script setup lang="ts">
import { useMediaQuery } from '@vueuse/core'

const isBelowDesktop = useMediaQuery('(max-width: 1023px)')

const { t } = useI18n()

// Sidebar collapse state
const sidebarOpen = ref(true)

// Shared with the inspector — skip links flip the active tab on the
// way to focusing the panel container.
const { activeTab } = useInspectorTab()

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

      <AppInspector />
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
