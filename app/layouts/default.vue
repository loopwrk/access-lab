<script setup lang="ts">
import { useTheme } from '~/composables/useTheme'
import { useFont } from '~/composables/useFont'
import type { FontSize } from "~/types/typography"
import type { TabsItem, NavigationMenuItem } from '@nuxt/ui'

const { t } = useI18n()
const theme = useTheme()
const font = useFont()

// Font options
const fonts = [
  { label: 'Figtree', value: 'Figtree Variable', family: 'Figtree Variable' },
  { label: 'Dyslexic', value: 'OpenDyslexicRegular', family: 'OpenDyslexicRegular' },
  { label: 'Atkinson', value: 'Atkinson Hyperlegible', family: 'Atkinson Hyperlegible' },
  { label: 'Comic Sans', value: '"Comic Sans MS", "Comic Sans", cursive', family: '"Comic Sans MS", "Comic Sans", cursive' }
]

interface SizeOption {
  label: string;
  value: FontSize;
}

const sizes: SizeOption[] = [
  { label: 'S', value: '87.5%' },
  { label: 'M', value: '100%' },
  { label: 'L', value: '112.5%' },
  { label: 'XL', value: '131.25%' }
]

// Sidebar collapse state
const sidebarOpen = ref(true)

// Inspector tab state
const activeTab = ref('controls')

const tabItems = computed<TabsItem[]>(() => [
  { label: t('inspector.controls'), value: 'controls' },
  { label: t('inspector.issues'), value: 'issues' },
  { label: t('inspector.manual'), value: 'manual' },
  { label: t('inspector.learn'), value: 'learn' }
])

// Component nav items
const activeComponent = ref('button')

const navItems = computed<NavigationMenuItem[][]>(() => [
  [
    { label: t('nav.components'), type: 'label' },
    { label: t('nav.button'), value: 'button', icon: 'i-lucide-square-mouse-pointer' },
    { label: t('nav.accordion'), value: 'accordion', icon: 'i-lucide-chevrons-down-up' },
    { label: t('nav.carousel'), value: 'carousel', icon: 'i-lucide-images' },
    { label: t('nav.modal'), value: 'modal', icon: 'i-lucide-rectangle-ellipsis' },
    { label: t('nav.menu'), value: 'menu', icon: 'i-lucide-menu' },
    { label: t('nav.tooltip'), value: 'tooltip', icon: 'i-lucide-message-circle' },
    { label: t('nav.tabs'), value: 'tabs', icon: 'i-lucide-panels-top-left' },
    { label: t('nav.formField'), value: 'form-field', icon: 'i-lucide-form-input' }
  ]
  // TODO: Introduce framework styles after vanilla components are in place
  // [
  //   { label: t('nav.frameworkStyle'), type: 'label' },
  //   { label: t('nav.none'), value: 'none', icon: 'i-lucide-code' }
  // ]
])

async function skipToPanel(tabName: 'controls' | 'issues', elementId: string) {
  activeTab.value = tabName

  const target = document.getElementById(elementId)
  if (target) {
    target.focus()
  }
}
</script>

<template>
  <div class="app-shell">
    <!-- Skip links -->
    <div class="skip-links">
      <a href="#main-content" class="skip-link">{{ t('skipLinks.main') }}</a>
      <a href="#controls-panel" class="skip-link" @click="skipToPanel('controls', 'controls-panel')">
        {{ t('skipLinks.controls') }}
      </a>
      <a href="#issues-panel" class="skip-link" @click="skipToPanel('issues', 'issues-panel')">
        {{ t('skipLinks.issues') }}
      </a>
    </div>

    <!-- App bar -->
    <header class="appbar" role="banner" :aria-label="t('appBar.ariaLabel')">
      <div class="appbar-left">
        <!-- Brand -->
        <NuxtLink to="/" class="brand">
          <span class="brand-mark" aria-hidden="true" />
          <span class="brand-text">{{ t('appBar.brand') }}</span>
        </NuxtLink>
      </div>

      <div class="appbar-right">
        <!-- Font picker -->
        <UFieldGroup size="sm">
          <UButton v-for="fontFamily in fonts" :key="fontFamily.value"
            :color="font.family === fontFamily.value ? 'primary' : 'neutral'"
            :variant="font.family === fontFamily.value ? 'solid' : 'ghost'"
            :style="{ fontFamily: `${fontFamily.family}` }" @click="
              font.setFont(fontFamily.value)">
            {{ fontFamily.label }}
          </UButton>
        </UFieldGroup>

        <!-- Size picker -->
        <UFieldGroup size="sm">
          <UButton v-for="s in sizes" :key="s.value" :color="font.size === s.value ? 'primary' : 'neutral'"
            :variant="font.size === s.value ? 'solid' : 'ghost'" @click="font.setSize(s.value)">
            {{ s.label }}
          </UButton>
        </UFieldGroup>

        <!-- High contrast toggle -->
        <UFieldGroup size="sm">
          <UButton :color="theme.isHighContrast ? 'primary' : 'neutral'"
            :variant="theme.isHighContrast ? 'solid' : 'ghost'" icon="i-lucide-contrast"
            :aria-pressed="theme.isHighContrast" @click="theme.toggleContrast()">
            {{ t('theme.highContrast') }}
          </UButton>
        </UFieldGroup>

        <!-- Theme toggle -->
        <UFieldGroup size="sm">
          <UButton :color="!theme.isDark ? 'primary' : 'neutral'" :variant="!theme.isDark ? 'solid' : 'ghost'"
            icon="i-lucide-sun" :aria-pressed="!theme.isDark" @click="theme.isDark && theme.toggleMode()">
            {{ t('theme.light') }}
          </UButton>
          <UButton :color="theme.isDark ? 'primary' : 'neutral'" :variant="theme.isDark ? 'solid' : 'ghost'"
            icon="i-lucide-moon" :aria-pressed="theme.isDark" @click="!theme.isDark && theme.toggleMode()">
            {{ t('theme.dark') }}
          </UButton>
        </UFieldGroup>

        <!-- Sidebar toggle -->
        <UButton color="neutral" variant="ghost" size="sm" icon="i-lucide-panel-left"
          :aria-label="sidebarOpen ? t('sidebar.toggleClose') : t('sidebar.toggleOpen')"
          @click="sidebarOpen = !sidebarOpen" />
      </div>
    </header>

    <div class="app-body">
      <!-- Left sidebar -->
      <aside v-show="sidebarOpen" class="sidebar" :aria-label="t('sidebar.ariaLabel')">
        <UNavigationMenu v-model="activeComponent" :items="navItems" orientation="vertical" highlight
          highlight-color="primary"
          :ui="{ link: 'text-sm py-2.5 pl-3', linkLabel: 'truncate', label: 'text-md pl-3 pt-3' }" />
      </aside>

      <!-- Collapsed sidebar rail -->
      <div v-show="!sidebarOpen" class="sidebar-rail" :aria-label="t('sidebar.ariaLabel')">
        <button class="sidebar-rail-btn" :aria-label="t('sidebar.toggleOpen')" @click="sidebarOpen = true">
          <span aria-hidden="true" class="i-lucide-panel-left text-lg" />
        </button>
      </div>

      <!-- Main content -->
      <main id="main-content" class="main" tabindex="-1">
        <!-- Preview toolbar -->
        <div class="preview-toolbar">
          <div class="preview-toolbar-left">
            <h1 class="preview-title">
              {{ t('preview.title') }}
            </h1>
          </div>

          <div class="preview-toolbar-right">
            <UBadge color="error" variant="soft" size="md" :label="t('counter.critical')" />
            <UBadge color="warning" variant="soft" size="md" :label="t('counter.warnings')" />
            <UBadge color="success" variant="soft" size="md" :label="t('counter.passing')" />
          </div>
        </div>

        <!-- Preview area -->
        <div class="preview-area">
          <slot />
        </div>

        <!-- Code panel (collapsed by default) -->
        <UCollapsible class="code-drawer">
          <UButton label="Generated HTML" color="neutral" variant="ghost" block trailing-icon="i-lucide-chevron-down"
            class="group"
            :ui="{ trailingIcon: 'group-data-[state=open]:rotate-180 transition-transform duration-200' }" />
          <template #content>
            <div class="code-drawer-body">
              <pre class="code-block">&lt;button&gt;Save changes&lt;/button&gt;</pre>
              <UButton size="xs" variant="outline" color="neutral">
                Copy to clipboard
              </UButton>
            </div>
          </template>
        </UCollapsible>
      </main>

      <!-- Right inspector -->
      <aside class="inspector" aria-label="Inspection panel">
        <UTabs v-model="activeTab" :items="tabItems" variant="link" color="primary" size="sm" :content="false"
          :ui="{ list: 'justify-around', label: 'overflow-visible whitespace-nowrap' }" />

        <!-- Tab panels -->
        <div class="inspector-panels">
          <div v-show="activeTab === 'controls'" id="controls-panel" class="inspector-panel" tabindex="0">
            <p class="text-muted">
              Controls panel placeholder
            </p>
          </div>

          <div v-show="activeTab === 'issues'" id="issues-panel" class="inspector-panel" tabindex="0">
            <p class="text-muted">
              Issues panel placeholder
            </p>
          </div>

          <div v-show="activeTab === 'manual'" class="inspector-panel" tabindex="0">
            <p class="text-muted">
              Manual review panel placeholder
            </p>
          </div>

          <div v-show="activeTab === 'learn'" class="inspector-panel" tabindex="0">
            <p class="text-muted">
              Learn panel placeholder
            </p>
          </div>
        </div>
      </aside>
    </div>
  </div>
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

/* ── App bar ────────────────────────────────────────────────────── */
.appbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 20px;
  border-bottom: 1px solid var(--border);
  background: var(--bg);
  gap: 16px;
  flex-wrap: wrap;
}

.appbar-left,
.appbar-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

/* Brand mark */
.brand {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  font-weight: 500;
  color: var(--text-primary);
  font-size: var(--al-font-size-brand);
  letter-spacing: -0.01em;
  text-decoration: none;
}

.brand-mark {
  width: 22px;
  height: 22px;
  background: var(--brand);
  border-radius: 5px;
  position: relative;
  flex-shrink: 0;
}

.brand-mark::after {
  content: '';
  position: absolute;
  inset: 4px;
  background: var(--on-brand);
  border-radius: 2px;
  clip-path: polygon(0 0, 100% 0, 100% 100%, 50% 100%, 50% 50%, 0 50%);
}

/* ── Left sidebar ───────────────────────────────────────────────── */
.sidebar {
  width: 260px;
  border-right: 1px solid var(--border);
  background: var(--bg);
  overflow-y: auto;
  flex-shrink: 0;
}

/* Collapsed icon rail */
.sidebar-rail {
  width: 44px;
  border-right: 1px solid var(--border);
  background: var(--bg);
  display: flex;
  flex-direction: column;
  padding-top: 12px;
  align-items: center;
  flex-shrink: 0;
}

.sidebar-rail-btn {
  width: 36px;
  height: 36px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  color: var(--text-secondary);
  border-radius: 6px;
  cursor: pointer;
}

.sidebar-rail-btn:hover {
  background: var(--brand-soft);
  color: var(--text-primary);
}

.sidebar-rail-btn:focus-visible {
  outline: 3px solid var(--focus-ring);
  outline-offset: 0;
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

/* Preview toolbar */
.preview-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 20px;
  border-bottom: 1px solid var(--border);
  background: var(--surface);
  gap: 16px;
  flex-wrap: wrap;
}

.preview-toolbar-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.preview-title {
  font-size: var(--al-font-size-heading);
  font-weight: 500;
  color: var(--text-primary);
  margin: 0;
}

.preview-toolbar-right {
  display: flex;
  gap: 8px;
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
.code-drawer {
  border-top: 1px solid var(--border);
  background: var(--surface);
}

.code-drawer-body {
  padding: 0 20px 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.code-block {
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: 4px;
  padding: 12px 16px;
  font-size: var(--al-font-size-body);
  color: var(--text-primary);
  margin: 0;
  overflow-x: auto;
}

/* ── Right inspector ────────────────────────────────────────────── */
.inspector {
  width: 320px;
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
