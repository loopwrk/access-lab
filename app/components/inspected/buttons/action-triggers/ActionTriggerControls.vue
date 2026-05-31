<script setup lang="ts">
import type { BaseButtonProps } from '~/types/button'
import { actionTriggerDefinition } from './definition'
import ResetDefaultsSection from '~/components/ButtonStudio/sections/ResetDefaultsSection.vue'
import ContentSection from '~/components/ButtonStudio/sections/ContentSection.vue'
import AriaSection from '~/components/ButtonStudio/sections/AriaSection.vue'
import TextSection from '~/components/ButtonStudio/sections/TextSection.vue'
import DimensionsSection from '~/components/ButtonStudio/sections/DimensionsSection.vue'
import BorderSection from '~/components/ButtonStudio/sections/BorderSection.vue'
import ColoursSection from '~/components/ButtonStudio/sections/ColoursSection.vue'
import FocusSection from '~/components/ButtonStudio/sections/FocusSection.vue'

const model = defineModel<Partial<BaseButtonProps> & { wrappers?: string[] }>({ required: true })

const tagName = actionTriggerDefinition.tagName
const { naturalSize } = useNaturalSize(model, tagName)
const defaults = useButtonStudioDefaults(tagName)
</script>

<template>
  <div class="flex flex-col gap-4">
    <ResetDefaultsSection v-model="model" />
    <USeparator />

    <ContentSection v-model="model" />
    <USeparator />

    <AriaSection v-model="model" />
    <USeparator />

    <TextSection
      v-model="model"
      :defaults="defaults"
    />
    <USeparator />

    <DimensionsSection
      v-model="model"
      :defaults="defaults"
      :natural-size="naturalSize"
    />
    <USeparator />

    <BorderSection
      v-model="model"
      :defaults="defaults"
    />
    <USeparator />

    <ColoursSection
      v-model="model"
      :defaults="defaults"
    />
    <USeparator />

    <FocusSection v-model="model" />
  </div>
</template>
