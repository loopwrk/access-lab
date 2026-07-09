<script setup lang="ts">
import type { TabsItem } from "@nuxt/ui";
import type { FontSize } from "~/types/typography";

const { t } = useI18n();
const { activeTab } = useInspectorTab();
const { simulatedRootPx } = useUnitConversion();
const { size: textSize } = useFont();

const INSPECTOR_WIDTH_BY_TEXT_SIZE: Record<FontSize, string> = {
  "100%": "404.8px",
  "112.5%": "440px",
  "131.25%": "475px",
  "150%": "513px",
};

const inspectorWidth = computed(() => INSPECTOR_WIDTH_BY_TEXT_SIZE[textSize.value]);

const rootRemOpen = ref(false);
usePreviewIframeOutsideClick(() => {
  if (rootRemOpen.value) rootRemOpen.value = false;
});

const tabItems = computed<TabsItem[]>(() => [
  { label: t("inspector.controls"), value: "controls" },
  { label: t("inspector.issues"), value: "issues" },
  { label: t("inspector.manual"), value: "manual" },
  { label: t("inspector.learn"), value: "learn" },
]);

const rootRemLabels = computed(() => ({
  trigger: t("controls.rootRem.trigger"),
  title: t("controls.rootRem.title"),
  description: t("controls.rootRem.description", { rem: "1rem" }),
  unit: t("controls.rootRem.unit"),
  equals: t("controls.rootRem.equals"),
  learn: t("controls.rootRem.learn"),
  slider: t("controls.rootRem.slider"),
  presetsGroup: t("controls.rootRem.presetsGroup"),
  pixelsWord: t("controls.rootRem.pixelsWord"),
}));
</script>

<template>
  <aside
    :aria-label="t('inspector.ariaLabel')"
    :style="{ width: inspectorWidth }"
    class="shrink-0 flex flex-col min-h-0 border-l border-(--border) bg-(--bg)"
  >
    <InspectorTabBar
      v-model="activeTab"
      :items="tabItems"
      :rounded="false"
    />

    <div class="flex-1 min-h-0 overflow-y-auto">
      <div
        v-show="activeTab === 'controls'"
        :id="INSPECTOR_PANEL_IDS.controls"
        role="tabpanel"
        tabindex="-1"
        :aria-label="t('inspector.controls')"
        class="p-4"
      >
        <div class="-mt-4 -mx-4 mb-4 border-b border-(--border)">
          <ControlsUtilityRow>
            <template #start>
              <RootRemControl
                v-model="simulatedRootPx"
                v-model:open="rootRemOpen"
                :labels="rootRemLabels"
                @learn="openLearnTopic('rem-units')"
              />
            </template>
            <template #end>
              <div :id="UTILITY_RESET_CELL_ID" />
            </template>
          </ControlsUtilityRow>
        </div>
      </div>

      <div
        v-show="activeTab === 'issues'"
        :id="INSPECTOR_PANEL_IDS.issues"
        role="tabpanel"
        tabindex="-1"
        :aria-label="t('inspector.issues')"
        class="p-4"
      />

      <div
        v-show="activeTab === 'manual'"
        :id="INSPECTOR_PANEL_IDS.manual"
        role="tabpanel"
        tabindex="-1"
        :aria-label="t('inspector.manual')"
        class="p-4"
      />

      <div
        v-show="activeTab === 'learn'"
        :id="INSPECTOR_PANEL_IDS.learn"
        role="tabpanel"
        tabindex="-1"
        :aria-label="t('inspector.learn')"
        class="p-4"
      />
    </div>
  </aside>
</template>
