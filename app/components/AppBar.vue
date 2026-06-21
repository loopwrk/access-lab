<script setup lang="ts">
import DisplayControlsPanel from "./appbar/DisplayControlsPanel.vue";
import { fontOptions, sizeOptions } from "~/utils/displayControlOptions";

const { t } = useI18n();
const { isDark, isHighContrast, setMode, toggleContrast } = useTheme();
const { family: fontFamily, size: fontSize, setFont, setSize } = useFont();
const { open: openOnboarding } = useOnboarding();

// On mobile while the reader is open, the logo should not navigate -
// "/" would close the reader and dump the user onto MobileBlocker,
// which contradicts the rule that reader is the only mobile surface.
//
// We render the same `<NuxtLink>` on server and client (so SSR HTML
// matches client hydration - no element-type swap on mount) and
// suppress the click in JS only when the mobile-in-reader condition
// holds. Visually identical to today's UX without the hydration flicker.
const isBelowDesktop = useIsBelowDesktop();
const { isOpen: readModeOpen } = useReadMode();

function onLogoClick(event: MouseEvent) {
  if (readModeOpen.value && isBelowDesktop.value) {
    event.preventDefault();
  }
}

const displaySettingsOpen = ref(false);
</script>

<template>
  <header
    role="banner"
    :aria-label="t('appBar.ariaLabel')"
    class="flex items-center justify-between flex-wrap gap-4 py-3 px-5 border-b border-(--border) bg-(--bg)"
  >
    <div class="flex items-center gap-4">
      <NuxtLink
        to="/"
        class="inline-flex items-center gap-1 font-medium text-(length:--al-font-size-brand) text-(--text-primary) tracking-[-0.01em] no-underline"
        @click="onLogoClick"
      >
        <UIcon
          name="i-lucide-message-square-dot"
          class="size-4"
          aria-hidden="true"
        />
        <span>{{ t("appBar.brand") }}</span>
      </NuxtLink>
    </div>

    <!--
      Desktop control strip. Hidden below `lg` (1024px), which is also
      the 320 CSS px a desktop user reaches at 400% zoom - at that width
      eleven controls cannot share one row at AAA 44px target size, so
      they move into the Display settings sheet below.
    -->
    <div class="hidden lg:flex items-center gap-4">
      <!-- Replay the onboarding. Studio-only: the modal lives in the
           studio layout, hidden while the reader is open. -->
      <UTooltip
        v-if="!readModeOpen"
        :text="t('onboarding.replay')"
      >
        <UButton
          color="neutral"
          variant="ghost"
          size="sm"
          icon="i-lucide-circle-help"
          :aria-label="t('onboarding.replay')"
          @click="openOnboarding"
        />
      </UTooltip>

      <!-- Font family picker -->
      <UFieldGroup size="sm">
        <UButton
          v-for="option in fontOptions"
          :key="option.value"
          :color="fontFamily === option.value ? 'primary' : 'neutral'"
          :variant="fontFamily === option.value ? 'solid' : 'ghost'"
          :style="{ fontFamily: option.family }"
          @click="setFont(option.value)"
        >
          {{ option.label }}
        </UButton>
      </UFieldGroup>

      <!-- Font size picker -->
      <UFieldGroup size="sm">
        <UButton
          v-for="option in sizeOptions"
          :key="option.value"
          :color="fontSize === option.value ? 'primary' : 'neutral'"
          :variant="fontSize === option.value ? 'solid' : 'ghost'"
          @click="setSize(option.value)"
        >
          {{ option.label }}
        </UButton>
      </UFieldGroup>

      <!-- High-contrast toggle -->
      <UFieldGroup size="sm">
        <UButton
          :color="isHighContrast ? 'primary' : 'neutral'"
          :variant="isHighContrast ? 'solid' : 'ghost'"
          icon="i-lucide-contrast"
          :aria-pressed="isHighContrast"
          @click="toggleContrast()"
        >
          {{ t("theme.highContrast") }}
        </UButton>
      </UFieldGroup>

      <!-- Light / Dark toggle -->
      <UFieldGroup size="sm">
        <UButton
          :color="!isDark ? 'primary' : 'neutral'"
          :variant="!isDark ? 'solid' : 'ghost'"
          icon="i-lucide-sun"
          :aria-pressed="!isDark"
          @click="setMode('light')"
        >
          {{ t("theme.light") }}
        </UButton>
        <UButton
          :color="isDark ? 'primary' : 'neutral'"
          :variant="isDark ? 'solid' : 'ghost'"
          icon="i-lucide-moon"
          :aria-pressed="isDark"
          @click="setMode('dark')"
        >
          {{ t("theme.dark") }}
        </UButton>
      </UFieldGroup>
    </div>

    <UDrawer
      v-model:open="displaySettingsOpen"
      class="lg:hidden"
      :title="t('appBar.display.title')"
      :description="t('appBar.display.description')"
      :ui="{ header: 'pe-12' }"
    >
      <UButton
        class="min-h-11"
        color="neutral"
        variant="subtle"
        icon="i-lucide-sliders-horizontal"
      >
        {{ t("appBar.display.trigger") }}
      </UButton>

      <template #body>
        <UButton
          :aria-label="t('appBar.display.close')"
          icon="i-lucide-x"
          color="neutral"
          variant="ghost"
          class="absolute end-3 top-3 min-h-11 min-w-11 justify-center"
          @click="displaySettingsOpen = false"
        />
        <DisplayControlsPanel />
      </template>
    </UDrawer>
  </header>
</template>
