<script setup lang="ts">
import type { BaseButtonProps } from '~/types/button'
import type { DisclosureBehaviour } from '../shared/types'
import { disclosureTriggerDefinition } from './definition'
import ResetDefaultsSection from '~/components/ButtonStudio/sections/ResetDefaultsSection.vue'
import ContentSection from '~/components/ButtonStudio/sections/ContentSection.vue'
import AriaSection from '~/components/ButtonStudio/sections/AriaSection.vue'
import DisclosureStateSection from '~/components/ButtonStudio/sections/DisclosureStateSection.vue'
import TextSection from '~/components/ButtonStudio/sections/TextSection.vue'
import DimensionsSection from '~/components/ButtonStudio/sections/DimensionsSection.vue'
import BorderSection from '~/components/ButtonStudio/sections/BorderSection.vue'
import ColoursSection from '~/components/ButtonStudio/sections/ColoursSection.vue'
import FocusSection from '~/components/ButtonStudio/sections/FocusSection.vue'

type DisclosureModel = Partial<BaseButtonProps> & {
  wrappers?: string[]
  disclosureBehaviour?: DisclosureBehaviour
  disclosureExpanded?: boolean
  disclosureShowControls?: boolean
}

const model = defineModel<DisclosureModel>({ required: true })

const tagName = disclosureTriggerDefinition.tagName
const { naturalSize } = useNaturalSize(model, tagName)
const defaults = useButtonStudioDefaults(tagName)

// Iframe click bridge: each activation of the trigger flips
// disclosureExpanded, which re-renders the iframe with the new ARIA
// state (when the behaviour exposes it) and either reveals or hides the
// sibling panel via the `hidden` attribute.
function handleMessage(event: MessageEvent) {
  if (event.data?.type !== 'demo:click') return
  model.value.disclosureExpanded = !model.value.disclosureExpanded
}

onMounted(() => window.addEventListener('message', handleMessage))
onBeforeUnmount(() => window.removeEventListener('message', handleMessage))
</script>

<template>
  <div class="flex flex-col gap-4">
    <ResetDefaultsSection v-model="model" />
    <USeparator />

    <ContentSection v-model="model" />
    <USeparator />

    <AriaSection v-model="model" />
    <USeparator />

    <DisclosureStateSection v-model="model" />
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
