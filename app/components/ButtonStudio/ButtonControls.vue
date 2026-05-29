<script setup lang="ts">
import type { BaseButtonProps } from '~/types/button'
import { buttonDefinition } from '~/components/inspected/button/definition'
import ContentSection from './sections/ContentSection.vue'
import AriaSection from './sections/AriaSection.vue'
import TextSection from './sections/TextSection.vue'
import DimensionsSection from './sections/DimensionsSection.vue'
import BorderSection from './sections/BorderSection.vue'
import ColoursSection from './sections/ColoursSection.vue'
import FocusSection from './sections/FocusSection.vue'

const model = defineModel<Partial<BaseButtonProps> & { wrappers?: string[] }>({ required: true })

const tagName = buttonDefinition.tagName
const { naturalSize } = useNaturalSize(model, tagName)
const defaults = useButtonStudioDefaults(tagName)

const isImageInput = computed(() => model.value.renderAs === 'input-image')
const isButtonTag = computed(() => !(model.value.renderAs ?? 'button').startsWith('input-'))

watch(isButtonTag, (buttonTag) => {
  if (!buttonTag && model.value.contentType === 'icon') {
    model.value.contentType = 'text'
  }
})

const GENERIC_DEFAULT_LABEL = buttonDefinition.defaultProps.label ?? ''

const VARIANT_DEFAULT_LABELS: Record<string, string> = {
  'button-submit': 'Save changes',
  'button-reset': 'Discard changes',
  'input-submit': 'Save changes',
  'input-reset': 'Discard changes'
}

const ALL_KNOWN_DEFAULTS = new Set<string>([
  ...Object.values(VARIANT_DEFAULT_LABELS),
  GENERIC_DEFAULT_LABEL,
  ''
])

const VARIANTS_WRAPPED_IN_FORM_BY_DEFAULT = [
  'button-submit',
  'button-reset',
  'input-submit',
  'input-reset',
  'input-image'
]
const FORM_WRAPPER_KEY = 'form'

watch(() => model.value.renderAs, (newRenderAs) => {
  // Label: swap to variant default only when the user hasn't typed
  // something bespoke (current value matches any known default).
  if (ALL_KNOWN_DEFAULTS.has(model.value.label ?? '')) {
    model.value.label = VARIANT_DEFAULT_LABELS[newRenderAs ?? ''] ?? GENERIC_DEFAULT_LABEL
  }

  // Container: variant choice wins. Submit-like variants force Form;
  // non-submit-variants only clear Form (a deliberately picked Link or
  // Button container survives the variant switch).
  const shouldWrap = VARIANTS_WRAPPED_IN_FORM_BY_DEFAULT.includes(newRenderAs ?? '')
  const currentKey = (model.value.wrappers ?? [])[0]
  if (shouldWrap) {
    if (currentKey !== FORM_WRAPPER_KEY) model.value.wrappers = [FORM_WRAPPER_KEY]
  } else if (currentKey === FORM_WRAPPER_KEY) {
    model.value.wrappers = []
  }
})
</script>

<template>
  <div class="flex flex-col gap-4">
    <ControlsIntro :element-name="buttonDefinition.name.toLowerCase()" />

    <ContentSection v-model="model" />
    <USeparator />

    <AriaSection v-model="model" />
    <USeparator />

    <TextSection
      v-if="!isImageInput"
      v-model="model"
      :defaults="defaults"
    />
    <USeparator v-if="!isImageInput" />

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
      :hide-bg-and-text="isImageInput"
    />
    <USeparator />

    <FocusSection v-model="model" />
  </div>
</template>
