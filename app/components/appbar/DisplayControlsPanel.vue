<script setup lang="ts">
import { fontOptions, sizeOptions } from "~/utils/displayControlOptions";

const { t } = useI18n();
const { family, size, setFont, setSize } = useFont();
const { isDark, isHighContrast, setMode, toggleContrast } = useTheme();
</script>

<template>
  <div class="grid gap-6">
    <!-- Font family -->
    <fieldset class="min-w-0 border-0 p-0 m-0">
      <legend class="mb-2 font-semibold text-(--text-primary)">
        {{ t("appBar.display.font") }}
      </legend>
      <div class="grid gap-2">
        <UButton
          v-for="option in fontOptions"
          :key="option.value"
          block
          class="min-h-11 justify-center"
          :color="family === option.value ? 'primary' : 'neutral'"
          :variant="family === option.value ? 'solid' : 'outline'"
          :aria-pressed="family === option.value"
          :style="{ fontFamily: option.family }"
          @click="setFont(option.value)"
        >
          {{ option.label }}
        </UButton>
      </div>
    </fieldset>

    <!-- Text size -->
    <fieldset class="min-w-0 border-0 p-0 m-0">
      <legend class="mb-2 font-semibold text-(--text-primary)">
        {{ t("appBar.display.textSize") }}
      </legend>
      <div class="grid grid-cols-4 gap-2">
        <UButton
          v-for="option in sizeOptions"
          :key="option.value"
          class="min-h-11 justify-center"
          :color="size === option.value ? 'primary' : 'neutral'"
          :variant="size === option.value ? 'solid' : 'outline'"
          :aria-pressed="size === option.value"
          @click="setSize(option.value)"
        >
          {{ option.label }}
        </UButton>
      </div>
    </fieldset>

    <!-- Contrast -->
    <fieldset class="min-w-0 border-0 p-0 m-0">
      <legend class="mb-2 font-semibold text-(--text-primary)">
        {{ t("appBar.display.contrast") }}
      </legend>
      <UButton
        block
        class="min-h-11 justify-center"
        icon="i-lucide-contrast"
        :color="isHighContrast ? 'primary' : 'neutral'"
        :variant="isHighContrast ? 'solid' : 'outline'"
        :aria-pressed="isHighContrast"
        @click="toggleContrast()"
      >
        {{ t("theme.highContrast") }}
      </UButton>
    </fieldset>

    <!-- Theme -->
    <fieldset class="min-w-0 border-0 p-0 m-0">
      <legend class="mb-2 font-semibold text-(--text-primary)">
        {{ t("appBar.display.theme") }}
      </legend>
      <div class="grid grid-cols-2 gap-2">
        <UButton
          class="min-h-11 justify-center"
          icon="i-lucide-sun"
          :color="!isDark ? 'primary' : 'neutral'"
          :variant="!isDark ? 'solid' : 'outline'"
          :aria-pressed="!isDark"
          @click="setMode('light')"
        >
          {{ t("theme.light") }}
        </UButton>
        <UButton
          class="min-h-11 justify-center"
          icon="i-lucide-moon"
          :color="isDark ? 'primary' : 'neutral'"
          :variant="isDark ? 'solid' : 'outline'"
          :aria-pressed="isDark"
          @click="setMode('dark')"
        >
          {{ t("theme.dark") }}
        </UButton>
      </div>
    </fieldset>
  </div>
</template>
