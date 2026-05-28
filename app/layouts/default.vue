<script setup lang="ts">
import { useMediaQuery } from '@vueuse/core'
import { useTheme } from '~/composables/useTheme'
import { useFont } from '~/composables/useFont'
import { useAxeCounts, useAllViolations } from '~/composables/useAxeResults'
import type { FontSize } from "~/types/typography"
import type { TabsItem, NavigationMenuItem } from '@nuxt/ui'

const isBelowDesktop = useMediaQuery('(max-width: 1023px)')

const { t } = useI18n()
const theme = useTheme()
const font = useFont()
const { criticalCount, warningCount, passingCount } = useAxeCounts()
const { allViolations } = useAllViolations()
const criticalViolationIds = computed(() =>
  allViolations.value
    .filter(v => v.impact === 'critical' || v.impact === 'serious')
    .map(v => v.id)
)
const warningViolationIds = computed(() =>
  allViolations.value
    .filter(v => v.impact === 'moderate' || v.impact === 'minor')
    .map(v => v.id)
)
const { activeComponentName } = useStudioToolbar()
const { renderedHtml } = useRenderedHtml()

const previewTitle = computed(() => activeComponentName.value ?? t('preview.title'))
const { convert: toClassHtml } = useInlineToClass()

const copied = ref<'inline' | 'class' | 'error' | null>(null)

async function copyHtml(mode: 'inline' | 'class') {
  const text = mode === 'inline'
    ? renderedHtml.value
    : (toClassHtml(renderedHtml.value) ?? renderedHtml.value)
  try {
    await navigator.clipboard.writeText(text)
    copied.value = mode
    setTimeout(() => { copied.value = null }, 800)
  } catch (err) {
    copied.value = mode;
    console.error('Failed to copy to clipboard:', err)
    copied.value = 'error'
    setTimeout(() => { copied.value = null }, 800)
  }
}

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

// Inspector tab state — shared composable so components teleported into the
// inspector panels (e.g. ControlsIntro) can switch tabs themselves.
const { activeTab } = useInspectorTab()

const tabItems = computed<TabsItem[]>(() => [
  { label: t('inspector.controls'), value: 'controls' },
  { label: t('inspector.issues'), value: 'issues' },
  { label: t('inspector.manual'), value: 'manual' },
  { label: t('inspector.learn'), value: 'learn' }
])

const route = useRoute()

const activeComponent = computed<string>(() => {
  const param = route.params.component
  if (Array.isArray(param)) return param[0] ?? 'button'
  return (param as string | undefined) ?? 'button'
})

const navItems = computed<NavigationMenuItem[][]>(() => [
  [
    { label: t('nav.components'), type: 'label' },
    { label: t('nav.button'), value: 'button', to: '/components/button', icon: 'i-lucide-square-mouse-pointer' },
    { label: t('nav.accordion'), value: 'accordion', to: '/components/accordion', icon: 'i-lucide-chevrons-down-up' },
    { label: t('nav.carousel'), value: 'carousel', to: '/components/carousel', icon: 'i-lucide-images' },
    { label: t('nav.modal'), value: 'modal', to: '/components/modal', icon: 'i-lucide-rectangle-ellipsis' },
    { label: t('nav.menu'), value: 'menu', to: '/components/menu', icon: 'i-lucide-menu' },
    { label: t('nav.tooltip'), value: 'tooltip', to: '/components/tooltip', icon: 'i-lucide-message-circle' },
    { label: t('nav.tabs'), value: 'tabs', to: '/components/tabs', icon: 'i-lucide-panels-top-left' }
  ],
  [
    { label: t('nav.forms'), type: 'label' },
    { label: t('nav.input'), value: 'input', to: '/components/input', icon: 'i-lucide-text-cursor-input' }

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
        <UNavigationMenu :model-value="activeComponent" :items="navItems" orientation="vertical" highlight
          highlight-color="primary"
          :ui="{ link: 'text-md py-2.5 pl-3', linkLabel: 'truncate', label: 'text-lg pl-3 pt-3' }" />
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
        <div
          class="flex flex-wrap items-center justify-between gap-4 py-2.5 px-5 border-b border-(--border) bg-(--surface)">
          <div class="flex items-center gap-3">
            <h1 class="m-0 font-medium text-(length:--al-font-size-heading) text-(--text-primary)">
              {{ previewTitle }}
            </h1>
            <div class="toolbar-chip inline-flex items-stretch border border-(--border) bg-(--surface-2)">
              <div id="preview-toolbar-variant" class="flex items-stretch" />
              <div id="preview-toolbar-wrappers" class="flex items-stretch" />
            </div>
          </div>

          <div class="flex gap-2">
            <AnimatedCountBadge color="error" :count="criticalCount" :noun="t('counter.criticalNoun')"
              :violation-ids="criticalViolationIds" />
            <AnimatedCountBadge color="warning" :count="warningCount" :noun="t('counter.warningsNoun', warningCount)"
              :violation-ids="warningViolationIds" />
            <AnimatedCountBadge color="success" :count="passingCount" :noun="t('counter.passingNoun')" />
          </div>
        </div>

        <!-- Preview area -->
        <div class="preview-area">
          <slot />
        </div>

        <UCollapsible default-open class="code-drawer">
          <UButton :label="t('codeDrawer.label')" color="neutral" variant="ghost" block
            trailing-icon="i-lucide-chevron-down" class="group"
            :ui="{ trailingIcon: 'group-data-[state=open]:rotate-180 transition-transform duration-200' }" />
          <template #content>
            <div class="flex flex-col gap-2 px-5 pb-4">
              <ProsePre v-if="renderedHtml" language="html" :code="renderedHtml">{{ renderedHtml }}</ProsePre>
              <p v-else class="text-(length:--al-font-size-body) text-(--text-muted) m-0 py-2">
                {{ t('codeDrawer.empty') }}
              </p>
              <p
                class="text-(length:--al-font-size-caption) font-semibold text-(--text-muted) uppercase tracking-[0.06em] m-0">
                {{ t('codeDrawer.copyLabel') }}
              </p>
              <div class="flex gap-2 justify-start">
                <UFieldGroup>
                  <UButton class="min-w-[110px] flex justify-center" size="md" variant="ghost" color="neutral"
                    :disabled="!renderedHtml" @click="copyHtml('inline')">
                    {{ copied === 'inline' ? t('codeDrawer.copied') : t('codeDrawer.copyInline') }}
                  </UButton>
                </UFieldGroup>
                <UFieldGroup>
                  <UButton class="min-w-[150px] flex justify-center" size="md" variant="ghost" color="neutral"
                    :disabled="!renderedHtml" @click="copyHtml('class')">
                    {{ copied === 'class' ? t('codeDrawer.copied') : t('codeDrawer.copyClasses') }}
                  </UButton>
                </UFieldGroup>
              </div>
            </div>
          </template>
        </UCollapsible>
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

          <div v-show="activeTab === 'issues'" id="issues-panel" class="inspector-panel" tabindex="0">
          </div>

          <div v-show="activeTab === 'manual'" id="manual-panel" class="inspector-panel" tabindex="0">
          </div>

          <div v-show="activeTab === 'learn'" id="learn-panel" class="inspector-panel" tabindex="0">
          </div>
        </div>
      </aside>
    </div>
  </div>

  <MobileBlocker />
</template>

<style scoped>
.toolbar-chip>div:empty {
  display: none;
}

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
