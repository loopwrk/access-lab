<script setup lang="ts">
import { useTheme } from '~/composables/useTheme'
import { useFont } from '~/composables/useFont'
import type { FontSize } from "~/types/typography"
import type { TabsItem } from '@nuxt/ui'

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
  value: FontSize; // This forces 'value' to match your union type exactly
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

const tabItems: TabsItem[] = [
  { label: 'Controls', value: 'controls' },
  { label: 'Issues', value: 'issues' },
  { label: 'Manual', value: 'manual' },
  { label: 'Learn', value: 'learn' }
]

// Component nav items
const components = [
  { id: 'button', label: 'Button', issues: 3 },
  { id: 'accordion', label: 'Accordion', issues: 5 },
  { id: 'carousel', label: 'Carousel', issues: 7 },
  { id: 'modal', label: 'Modal / Dialog', issues: 4 },
  { id: 'menu', label: 'Menu / Dropdown', issues: 2 },
  { id: 'tooltip', label: 'Tooltip', issues: 1 },
  { id: 'tabs', label: 'Tabs', issues: 6 },
  { id: 'form-field', label: 'Form Field', issues: 4 }
]

const activeComponent = ref('button')
</script>

<template>
  <div class="app-shell">
    <!-- Skip links -->
    <div class="skip-links">
      <a href="#main-content" class="skip-link">Skip to main content</a>
      <a href="#controls-panel" class="skip-link">Skip to controls</a>
      <a href="#issues-panel" class="skip-link">Skip to issues</a>
    </div>

    <!-- App bar -->
    <header class="appbar" role="banner" aria-label="Application bar">
      <div class="appbar-left">
        <!-- Brand -->
        <NuxtLink to="/" class="brand">
          <span class="brand-mark" aria-hidden="true" />
          <span class="brand-text">AccessLab</span>
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

        <!-- High contrast toggle (single-button field group for visual parity with the segmented pickers) -->
        <UFieldGroup size="sm">
          <UButton :color="theme.isHighContrast ? 'primary' : 'neutral'"
            :variant="theme.isHighContrast ? 'solid' : 'ghost'" icon="i-lucide-contrast"
            :aria-pressed="theme.isHighContrast" @click="theme.toggleContrast()">
            High contrast
          </UButton>
        </UFieldGroup>

        <!-- Theme toggle -->
        <UFieldGroup size="sm">
          <UButton :color="!theme.isDark ? 'primary' : 'neutral'" :variant="!theme.isDark ? 'solid' : 'ghost'"
            icon="i-lucide-sun" :aria-pressed="!theme.isDark" @click="theme.isDark && theme.toggleMode()">
            Light
          </UButton>
          <UButton :color="theme.isDark ? 'primary' : 'neutral'" :variant="theme.isDark ? 'solid' : 'ghost'"
            icon="i-lucide-moon" :aria-pressed="theme.isDark" @click="!theme.isDark && theme.toggleMode()">
            Dark
          </UButton>
        </UFieldGroup>

        <!-- Sidebar toggle -->
        <UButton color="neutral" variant="ghost" size="sm" icon="i-lucide-panel-left"
          :aria-label="sidebarOpen ? 'Close sidebar' : 'Open sidebar'" @click="sidebarOpen = !sidebarOpen" />
      </div>
    </header>

    <div class="app-body">
      <!-- Left sidebar -->
      <aside v-show="sidebarOpen" class="sidebar" aria-label="Component navigation">
        <nav class="sidebar-nav">
          <!-- Components section -->
          <div class="sidebar-section">
            <h2 class="sidebar-section-title">
              Components
            </h2>
            <ul class="sidebar-list" role="list">
              <li v-for="comp in components" :key="comp.id">
                <button class="sidebar-item" :class="{ 'is-active': activeComponent === comp.id }"
                  @click="activeComponent = comp.id">
                  <span class="sidebar-item-label">{{ comp.label }}</span>
                </button>
              </li>
            </ul>
          </div>

          <!-- Framework section -->
          <div class="sidebar-section">
            <h2 class="sidebar-section-title">
              Framework style
            </h2>
            <ul class="sidebar-list" role="list">
              <li>
                <button class="sidebar-item is-active">
                  <span class="sidebar-item-label">None (bare HTML)</span>
                </button>
              </li>
            </ul>
          </div>
        </nav>
      </aside>

      <!-- Collapsed sidebar icon rail -->
      <div v-show="!sidebarOpen" class="sidebar-rail" aria-label="Component navigation" role="navigation">
        <button class="sidebar-rail-btn" aria-label="Open sidebar" @click="sidebarOpen = true">
          <span aria-hidden="true" class="i-lucide-panel-left text-lg" />
        </button>
      </div>

      <!-- Main content -->
      <main id="main-content" class="main" tabindex="-1">
        <!-- Preview toolbar -->
        <div class="preview-toolbar">
          <div class="preview-toolbar-left">
            <h1 class="preview-title">
              Button
            </h1>
          </div>

          <div class="preview-toolbar-right">
            <!-- Counter pills -->
            <span class="counter-pill counter-critical">3 critical</span>
            <span class="counter-pill counter-warning">2 warnings</span>
            <span class="counter-pill counter-pass">8 passing</span>
          </div>
        </div>

        <!-- Preview area -->
        <div class="preview-area">
          <slot />
        </div>

        <!-- Code panel (collapsed by default) -->
        <details class="code-drawer">
          <summary class="code-drawer-summary">
            Generated HTML
            <span aria-hidden="true" class="i-lucide-chevron-down text-sm" />
          </summary>
          <div class="code-drawer-body">
            <pre class="code-block">&lt;button&gt;Save changes&lt;/button&gt;</pre>
            <UButton size="xs" variant="outline" color="neutral">
              Copy to clipboard
            </UButton>
          </div>
        </details>
      </main>

      <!-- Right inspector -->
      <aside class="inspector" aria-label="Inspection panel">
        <UTabs
          v-model="activeTab"
          :items="tabItems"
          variant="link"
          color="primary"
          size="sm"
          :content="false"
          :ui="{ list: 'justify-around', label: 'overflow-visible whitespace-nowrap' }"
        />

        <!-- Tab panels -->
        <div class="inspector-panels">
          <div v-if="activeTab === 'controls'" id="controls-panel" class="inspector-panel" tabindex="0">
            <p class="text-muted">
              Controls panel placeholder
            </p>
          </div>

          <div v-if="activeTab === 'issues'" id="issues-panel" class="inspector-panel" tabindex="0">
            <p class="text-muted">
              Issues panel placeholder
            </p>
          </div>

          <div v-if="activeTab === 'manual'" class="inspector-panel" tabindex="0">
            <p class="text-muted">
              Manual review panel placeholder
            </p>
          </div>

          <div v-if="activeTab === 'learn'" class="inspector-panel" tabindex="0">
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

.sidebar-nav {
  padding: 12px 8px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.sidebar-section {
  padding-top: 8px;
}

.sidebar-section-title {
  font-size: var(--al-font-size-caption);
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--text-muted);
  padding: 8px 14px 6px;
  margin: 0;
}

.sidebar-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.sidebar-item {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 9px 14px;
  color: var(--text-secondary);
  text-decoration: none;
  border-radius: 4px;
  text-align: left;
  cursor: pointer;
  background: transparent;
  border: none;
  font-size: var(--al-font-size-nav);
  font-family: inherit;
}

.sidebar-item:hover {
  background: var(--brand-soft);
  color: var(--text-primary);
}

.sidebar-item.is-active {
  background: var(--brand-soft);
  color: var(--text-primary);
  font-weight: 500;
}

.sidebar-item:focus-visible {
  outline: 3px solid var(--focus-ring);
  outline-offset: -1px;
}

.sidebar-item-label {
  flex: 1;
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

/* Counter pills */
.counter-pill {
  font-size: var(--al-font-size-caption);
  font-weight: 500;
  padding: 2px 10px;
  border-radius: 999px;
}

.counter-critical {
  background: var(--error-soft);
  color: var(--error);
}

.counter-warning {
  background: var(--warn-soft);
  color: var(--warn);
}

.counter-pass {
  background: var(--success-soft);
  color: var(--success);
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

.code-drawer-summary {
  padding: 10px 20px;
  font-size: var(--al-font-size-detail);
  font-weight: 500;
  color: var(--text-secondary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.code-drawer-summary:hover {
  color: var(--text-primary);
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
