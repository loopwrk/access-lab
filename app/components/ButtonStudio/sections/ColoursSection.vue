<script setup lang="ts">
import type { BaseButtonProps } from '~/types/button'
import type { ButtonStudioDefaults } from '~/composables/useButtonStudioDefaults'

const props = defineProps<{
  defaults: ButtonStudioDefaults
  // When true (input-image), background and text-colour swatches are
  // hidden — the image provides its own visible content; only the
  // border colour applies.
  hideBgAndText?: boolean
}>()
const model = defineModel<Partial<BaseButtonProps>>({ required: true })
const { update } = useButtonControlsModel(model)

const unitConv = useUnitConversion()
const { t } = useI18n()

const { enabled, toggle } = useToggleableSection(model, {
  enable: () => ({
    bg: props.defaults.bg,
    fgText: props.defaults.fgText,
    borderColor: props.defaults.borderColor
  }),
  disable: () => ({ bg: undefined, fgText: undefined, borderColor: undefined })
})

const bgColor = computed({
  get: () => model.value.bg ?? props.defaults.bg,
  set: (value: string) => update('bg', value)
})

const fgTextColor = computed({
  get: () => model.value.fgText ?? props.defaults.fgText,
  set: (value: string) => update('fgText', value)
})

const borderColorComputed = computed({
  get: () => model.value.borderColor ?? props.defaults.borderColor,
  set: (value: string) => update('borderColor', value)
})

const { ratio: contrastRatio, verdict: contrastVerdict } = useContrast(
  fgTextColor,
  bgColor,
  {
    fontSizePx: () => {
      const f = model.value.fontSize
      if (!f) return props.defaults.fontSize
      return unitConv.lengthToPx(f)
    },
    bold: false
  }
)
</script>

<template>
  <fieldset class="flex flex-col gap-3 border-0 p-0 m-0">
    <legend class="flex items-center justify-between w-full mb-1.5">
      <span class="control-group-title">{{ t('controls.colours') }}</span>
      <USwitch
        :model-value="enabled"
        size="xs"
        color="primary"
        @update:model-value="toggle"
      />
    </legend>

    <div
      :class="[enabled ? '' : 'opacity-50 pointer-events-none']"
      class="flex flex-col gap-3"
    >
      <template v-if="!hideBgAndText">
        <ColorPicker
          v-slot="{ show }"
          v-model="bgColor"
          with-alpha
          with-initial-color
          with-eye-dropper
          with-hex-input
          with-rgb-input
        >
          <div class="flex items-center justify-between gap-3">
            <button
              type="button"
              class="color-swatch"
              :disabled="!enabled"
              @click="show"
            >
              <div
                class="color-swatch-inner"
                :style="{ backgroundColor: bgColor }"
              />
            </button>
            <div class="flex flex-col flex-1 min-w-0">
              <span class="color-label-title">{{ t('controls.background') }}</span>
              <span class="color-label-hex">{{ bgColor }}</span>
            </div>
            <UInput
              :model-value="bgColor"
              size="sm"
              :disabled="!enabled"
              class="w-24 shrink-0"
              @update:model-value="update('bg', String($event))"
            />
          </div>
        </ColorPicker>

        <ColorPicker
          v-slot="{ show }"
          v-model="fgTextColor"
          with-alpha
          with-initial-color
          with-eye-dropper
          with-hex-input
          with-rgb-input
        >
          <div class="flex items-center justify-between gap-3">
            <button
              type="button"
              class="color-swatch"
              :disabled="!enabled"
              @click="show"
            >
              <div
                class="color-swatch-inner"
                :style="{ backgroundColor: fgTextColor }"
              />
            </button>
            <div class="flex flex-col flex-1 min-w-0">
              <span class="color-label-title">{{ t('controls.textColor') }}</span>
              <span class="color-label-hex">{{ fgTextColor }}</span>
            </div>
            <UInput
              :model-value="fgTextColor"
              size="sm"
              :disabled="!enabled"
              class="w-24 shrink-0"
              @update:model-value="update('fgText', String($event))"
            />
          </div>
        </ColorPicker>

        <ContrastBadge
          :ratio="contrastRatio"
          :verdict="contrastVerdict"
        />
      </template>

      <ColorPicker
        v-slot="{ show }"
        v-model="borderColorComputed"
        with-alpha
        with-initial-color
        with-eye-dropper
        with-hex-input
        with-rgb-input
      >
        <div class="flex items-center justify-between gap-3">
          <button
            type="button"
            class="color-swatch"
            :disabled="!enabled"
            @click="show"
          >
            <div
              class="color-swatch-inner"
              :style="{ backgroundColor: borderColorComputed }"
            />
          </button>
          <div class="flex flex-col flex-1 min-w-0">
            <span class="color-label-title">{{ t('controls.borderColor') }}</span>
            <span class="color-label-hex">{{ borderColorComputed }}</span>
          </div>
          <UInput
            :model-value="borderColorComputed"
            size="sm"
            :disabled="!enabled"
            class="w-24 shrink-0"
            @update:model-value="update('borderColor', String($event))"
          />
        </div>
      </ColorPicker>
    </div>
  </fieldset>
</template>
