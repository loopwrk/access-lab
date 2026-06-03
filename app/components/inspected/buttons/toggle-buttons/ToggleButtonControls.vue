<script setup lang="ts">
import type { BaseButtonProps } from '~/types/button'
import type { ToggleBehaviour } from '../shared/types'
import { toggleButtonDefinition } from './definition'
import ResetDefaultsSection from '~/components/ButtonStudio/sections/ResetDefaultsSection.vue'
import ContentSection from '~/components/ButtonStudio/sections/ContentSection.vue'
import AriaSection from '~/components/ButtonStudio/sections/AriaSection.vue'
import ToggleStateSection from '~/components/ButtonStudio/sections/ToggleStateSection.vue'
import TextSection from '~/components/ButtonStudio/sections/TextSection.vue'
import DimensionsSection from '~/components/ButtonStudio/sections/DimensionsSection.vue'
import BorderSection from '~/components/ButtonStudio/sections/BorderSection.vue'
import ColoursSection from '~/components/ButtonStudio/sections/ColoursSection.vue'
import FocusSection from '~/components/ButtonStudio/sections/FocusSection.vue'

type ToggleModel = Partial<BaseButtonProps> & {
  wrappers?: string[]
  toggleBehaviour?: ToggleBehaviour
  togglePressed?: boolean
}

const model = defineModel<ToggleModel>({ required: true })

const tagName = toggleButtonDefinition.tagName
const { naturalSize } = useNaturalSize(model, tagName)
const defaults = useButtonStudioDefaults(tagName)

// Iframe click bridge: when the inspected button is activated inside
// the iframe, preview-shell.html posts `demo:click` back to the host.
// For an active toggle behaviour, that activation flips togglePressed
// here — which re-renders the iframe with the new ARIA state and the
// pressed-state CSS class, so a real screen reader announces the change.
usePreviewMessage({
  'demo:click': () => {
    const behaviour = model.value.toggleBehaviour
    if (!behaviour || behaviour === 'none') return
    model.value.togglePressed = !model.value.togglePressed
  }
})
</script>

<template>
  <div class="flex flex-col gap-4">
    <ResetDefaultsSection v-model="model" />
    <USeparator />

    <ContentSection v-model="model" />
    <USeparator />

    <AriaSection v-model="model" />
    <USeparator />

    <ToggleStateSection v-model="model" />
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
