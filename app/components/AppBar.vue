<script setup lang="ts">
import type { FontSize } from '~/types/typography'

const { t } = useI18n()
const theme = useTheme()
const font = useFont()

// On mobile while the reader is open, the logo should not navigate —
// "/" would close the reader and dump the user onto MobileBlocker,
// which contradicts the rule that reader is the only mobile surface.
//
// We render the same `<NuxtLink>` on server and client (so SSR HTML
// matches client hydration — no element-type swap on mount) and
// suppress the click in JS only when the mobile-in-reader condition
// holds. Visually identical to today's UX without the hydration jank.
const isBelowDesktop = useIsBelowDesktop()
const { isOpen: readModeOpen } = useReadMode()

function onLogoClick(event: MouseEvent) {
  if (readModeOpen.value && isBelowDesktop.value) {
    event.preventDefault()
  }
}

interface FontOption {
  label: string
  value: string
  family: string
}

const fonts: FontOption[] = [
  { label: 'Figtree', value: 'Figtree Variable', family: 'Figtree Variable' },
  { label: 'Dyslexic', value: 'OpenDyslexicRegular', family: 'OpenDyslexicRegular' },
  { label: 'Atkinson', value: 'Atkinson Hyperlegible', family: 'Atkinson Hyperlegible' },
  { label: 'Comic Sans', value: '"Comic Sans MS", "Comic Sans", cursive', family: '"Comic Sans MS", "Comic Sans", cursive' }
]

interface SizeOption {
  label: string
  value: FontSize
}

const sizes: SizeOption[] = [
  { label: 'S', value: '87.5%' },
  { label: 'M', value: '100%' },
  { label: 'L', value: '112.5%' },
  { label: 'XL', value: '131.25%' }
]
</script>

<template>
  <header role="banner" :aria-label="t('appBar.ariaLabel')"
    class="flex items-center justify-between flex-wrap gap-4 py-3 px-5 border-b border-(--border) bg-(--bg)">
    <div class="flex items-center gap-4">
      <NuxtLink to="/"
        class="inline-flex items-center gap-2.5 font-medium text-(length:--al-font-size-brand) text-(--text-primary) tracking-[-0.01em] no-underline"
        @click="onLogoClick">
        <span aria-hidden="true" class="
            relative shrink-0 w-[22px] h-[22px] bg-(--brand) rounded-[5px]
            after:content-[''] after:absolute after:inset-1 after:bg-(--on-brand) after:rounded-[2px]
            after:[clip-path:polygon(0_0,100%_0,100%_100%,50%_100%,50%_50%,0_50%)]
          " />
        <span>{{ t('appBar.brand') }}</span>
      </NuxtLink>
    </div>

    <div class="flex items-center gap-4">
      <!-- Font family picker -->
      <UFieldGroup size="sm">
        <UButton v-for="fontFamily in fonts" :key="fontFamily.value"
          :color="font.family === fontFamily.value ? 'primary' : 'neutral'"
          :variant="font.family === fontFamily.value ? 'solid' : 'ghost'" :style="{ fontFamily: fontFamily.family }"
          @click="font.setFont(fontFamily.value)">
          {{ fontFamily.label }}
        </UButton>
      </UFieldGroup>

      <!-- Font size picker -->
      <UFieldGroup size="sm">
        <UButton v-for="size in sizes" :key="size.value" :color="font.size === size.value ? 'primary' : 'neutral'"
          :variant="font.size === size.value ? 'solid' : 'ghost'" @click="font.setSize(size.value)">
          {{ size.label }}
        </UButton>
      </UFieldGroup>

      <!-- High-contrast toggle -->
      <UFieldGroup size="sm">
        <UButton :color="theme.isHighContrast ? 'primary' : 'neutral'"
          :variant="theme.isHighContrast ? 'solid' : 'ghost'" icon="i-lucide-contrast"
          :aria-pressed="theme.isHighContrast" @click="theme.toggleContrast()">
          {{ t('theme.highContrast') }}
        </UButton>
      </UFieldGroup>

      <!-- Light / Dark toggle -->
      <UFieldGroup size="sm">
        <UButton :color="!theme.isDark ? 'primary' : 'neutral'" :variant="!theme.isDark ? 'solid' : 'ghost'"
          icon="i-lucide-sun" :aria-pressed="!theme.isDark" @click="theme.setMode('light')">
          {{ t('theme.light') }}
        </UButton>
        <UButton :color="theme.isDark ? 'primary' : 'neutral'" :variant="theme.isDark ? 'solid' : 'ghost'"
          icon="i-lucide-moon" :aria-pressed="theme.isDark" @click="theme.setMode('dark')">
          {{ t('theme.dark') }}
        </UButton>
      </UFieldGroup>

    </div>
  </header>
</template>
