<script setup lang="ts">
/**
 * Right-hand inspector pane.
 *
 * Owns the tab strip and the four panel containers. UTabs runs with
 * `:content="false"` so we manage the panels ourselves — each ID is a
 * teleport target that ComponentStudio writes its IssuesPanel /
 * ManualReviewPanel / LearnPanel / controls component into. The
 * controls panel additionally hosts the RootEmSlider directly.
 *
 * State is read from useInspectorTab(); the toolbar and other parts of
 * the app can switch tabs through the same composable.
 */
import type { TabsItem } from '@nuxt/ui'

const { t } = useI18n()
const { activeTab } = useInspectorTab()

const tabItems = computed<TabsItem[]>(() => [
  { label: t('inspector.controls'), value: 'controls' },
  { label: t('inspector.issues'), value: 'issues' },
  { label: t('inspector.manual'), value: 'manual' },
  { label: t('inspector.learn'), value: 'learn' }
])
</script>

<template>
  <aside
    :aria-label="t('inspector.ariaLabel')"
    class="w-[380px] shrink-0 flex flex-col overflow-y-auto border-l border-(--border) bg-(--bg)"
  >
    <UTabs
      v-model="activeTab"
      :items="tabItems"
      variant="link"
      color="primary"
      size="lg"
      :content="false"
      :ui="{ list: 'justify-around', label: 'overflow-visible whitespace-nowrap' }"
    />

    <!--
      Each panel is a tabpanel-shaped teleport target. tabindex=-1 keeps
      them out of the natural tab order while still allowing programmatic
      focus (used by the skip-to-controls / skip-to-issues links). The
      role and aria-label give assistive tech the tab-pattern relationship
      that UTabs doesn't wire because content rendering is disabled.
    -->
    <div class="flex-1 overflow-y-auto">
      <div
        v-show="activeTab === 'controls'"
        id="controls-panel"
        role="tabpanel"
        tabindex="-1"
        :aria-label="t('inspector.controls')"
        class="h-[1vh] p-4"
      >
        <RootEmSlider />
      </div>

      <div
        v-show="activeTab === 'issues'"
        id="issues-panel"
        role="tabpanel"
        tabindex="-1"
        :aria-label="t('inspector.issues')"
        class="h-[1vh] p-4"
      />

      <div
        v-show="activeTab === 'manual'"
        id="manual-panel"
        role="tabpanel"
        tabindex="-1"
        :aria-label="t('inspector.manual')"
        class="h-[1vh] p-4"
      />

      <div
        v-show="activeTab === 'learn'"
        id="learn-panel"
        role="tabpanel"
        tabindex="-1"
        :aria-label="t('inspector.learn')"
        class="h-[1vh] p-4"
      />
    </div>
  </aside>
</template>
