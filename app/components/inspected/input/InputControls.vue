<script setup lang="ts">
import type { InputProps } from './definition'
import { inputDefinition } from './definition'
import { useUnitConversion } from '~/composables/useUnitConversion'
import type { CssUnit, CssLength } from '~/composables/useUnitConversion'

const props = defineProps<{
  modelValue: Partial<InputProps>
}>()

const emit = defineEmits<{
  'update:modelValue': [value: Partial<InputProps>]
}>()

function update<K extends keyof InputProps>(key: K, value: InputProps[K]) {
  emit('update:modelValue', { ...props.modelValue, [key]: value })
}

const { t } = useI18n()
const unitConv = useUnitConversion()
const { focusLearnTopic } = useInspectorTab()

const fontSizeEnabled = ref(false)
const colorsEnabled = ref(false)

const _HARDCODED = {
  fontSize: 14,
  bg: '#FFFFFF',
  fgText: '#000000',
  borderColor: '#888888'
}

const DEFAULTS = computed(() => ({
  fontSize: _HARDCODED.fontSize,
  bg: _HARDCODED.bg,
  fgText: _HARDCODED.fgText,
  borderColor: _HARDCODED.borderColor
}))

const bgColor = computed({
  get: () => props.modelValue.bg ?? DEFAULTS.value.bg,
  set: (value: string) => update('bg', value)
})

const fgTextColor = computed({
  get: () => props.modelValue.fgText ?? DEFAULTS.value.fgText,
  set: (value: string) => update('fgText', value)
})

const borderColorComputed = computed({
  get: () => props.modelValue.borderColor ?? DEFAULTS.value.borderColor,
  set: (value: string) => update('borderColor', value)
})

const { ratio: contrastRatio, verdict: contrastVerdict } = useContrast(
  fgTextColor,
  bgColor,
  {
    fontSizePx: () => {
      const f = props.modelValue.fontSize
      if (!f) return DEFAULTS.value.fontSize
      return unitConv.lengthToPx(f)
    },
    bold: false
  }
)

function toggleFontSize(value: boolean | 'indeterminate') {
  if (value === true) {
    update('fontSize', unitConv.fromPx(DEFAULTS.value.fontSize, 'rem'))
  } else {
    update('fontSize', undefined as unknown as CssLength)
  }
  fontSizeEnabled.value = value === true
}

function toggleColors(value: boolean | 'indeterminate') {
  if (value === true) {
    emit('update:modelValue', {
      ...props.modelValue,
      bg: DEFAULTS.value.bg,
      fgText: DEFAULTS.value.fgText,
      borderColor: DEFAULTS.value.borderColor
    })
  } else {
    const next = { ...props.modelValue }
    delete next.bg
    delete next.fgText
    delete next.borderColor
    emit('update:modelValue', next)
  }
  colorsEnabled.value = value === true
}

const typeOptions = [
  { value: 'text', label: 'text' },
  { value: 'email', label: 'email' },
  { value: 'tel', label: 'tel' },
  { value: 'url', label: 'url' },
  { value: 'password', label: 'password' },
  { value: 'number', label: 'number' },
  { value: 'search', label: 'search' }
]

function displayLength(length: CssLength | undefined, fallbackPx: number): string {
  return length ? String(length.value) : String(fallbackPx)
}

function pxOrFallback(length: CssLength | undefined, fallbackPx: number): number {
  return length ? unitConv.lengthToPx(length) : fallbackPx
}

function unitFor(length: CssLength | undefined): CssUnit {
  return length?.unit ?? 'px'
}

function changeUnit<K extends keyof InputProps>(key: K, newUnit: CssUnit) {
  const current = props.modelValue[key]
  if (!unitConv.isCssLength(current)) return
  if (current.unit === newUnit) return
  update(key, unitConv.convertLength(current, newUnit) as InputProps[K])
}

const showLabel = computed({
  get: () => props.modelValue.showLabel !== false,
  set: (value: boolean) => update('showLabel', value)
})

const required = computed({
  get: () => props.modelValue.required === true,
  set: (value: boolean) => update('required', value)
})
</script>

<template>
  <div class="flex flex-col gap-4">
    <ControlsIntro :element-name="inputDefinition.name.toLowerCase()" />


    <UFormField class="flex flex-col">
      <template #label>
        <a href="#topic-vague-label" class="control-group-title control-label-link"
          @click.prevent="focusLearnTopic('vague-label')">
          {{ t('controls.input.label') }}
          <UIcon name="i-lucide-arrow-up-right" class="control-label-link-icon" aria-hidden="true" />
        </a>
      </template>
      <UInput :model-value="modelValue.label ?? ''" :placeholder="t('controls.input.labelPlaceholder')" class="w-full"
        @update:model-value="update('label', $event)" />
    </UFormField>

    <USeparator />

    <fieldset class="flex flex-col gap-2 border-0 p-0 m-0">
      <legend class="flex items-center justify-between w-full">
        <span class="control-group-title">{{ t('controls.input.showLabel') }}</span>
        <USwitch v-model="showLabel" size="xs" color="primary" />
      </legend>
      <UFormField v-if="!showLabel" class="flex flex-col">
        <template #label>
          <span class="control-group-title">{{ t('controls.input.ariaLabel') }}</span>
        </template>
        <UInput :model-value="modelValue.ariaLabel ?? ''" :placeholder="t('controls.input.ariaLabelPlaceholder')"
          class="w-full" @update:model-value="update('ariaLabel', $event)" />
      </UFormField>
    </fieldset>

    <USeparator />
    <UFormField class="flex flex-col">
      <template #label>
        <span class="control-group-title">{{ t('controls.input.placeholder') }}</span>
      </template>
      <UInput :model-value="modelValue.placeholder ?? ''" :placeholder="t('controls.input.placeholderHint')"
        class="w-full" @update:model-value="update('placeholder', $event)" />
    </UFormField>

    <USeparator />
    <UFormField class="flex flex-col">
      <template #label>
        <span class="control-group-title">{{ t('controls.input.type') }}</span>
      </template>
      <USelect :model-value="modelValue.type ?? 'email'" :items="typeOptions" size="sm" class="w-full"
        @update:model-value="update('type', $event as InputProps['type'])" />
    </UFormField>

    <USeparator />
    <fieldset class="flex flex-col gap-2 border-0 p-0 m-0">
      <legend class="flex items-center justify-between w-full">
        <span class="control-group-title">{{ t('controls.input.required') }}</span>
        <USwitch v-model="required" size="xs" color="primary" />
      </legend>
    </fieldset>

    <USeparator />

    <UFormField class="flex flex-col">
      <template #label>
        <span class="control-group-title">{{ t('controls.input.helpText') }}</span>
      </template>
      <UInput :model-value="modelValue.helpText ?? ''" :placeholder="t('controls.input.helpTextPlaceholder')"
        class="w-full" @update:model-value="update('helpText', $event)" />
    </UFormField>

    <USeparator />

    <!-- TEXT -->
    <fieldset class="flex flex-col gap-3 border-0 p-0 m-0">
      <div>
        <div class="flex items-center justify-between mb-1.5">
          <span class="control-group-title font-medium text-(--text-secondary)">{{ t('controls.fontSize') }}</span>
          <USwitch :model-value="fontSizeEnabled" size="xs" color="primary" @update:model-value="toggleFontSize" />
        </div>
        <div :class="[fontSizeEnabled ? '' : 'opacity-50']" class="flex items-center gap-3">
          <USlider :model-value="pxOrFallback(modelValue.fontSize, DEFAULTS.fontSize)" :min="8" :max="128" :step="2"
            color="primary" size="sm" :disabled="!fontSizeEnabled" class="flex-1"
            @update:model-value="update('fontSize', unitConv.fromSliderPx(Number($event), unitFor(modelValue.fontSize)))" />
          <div v-if="fontSizeEnabled" class="flex items-center gap-1">
            <UInput :model-value="displayLength(modelValue.fontSize, DEFAULTS.fontSize)" size="xs" type="number"
              class="w-11 [&>input]:text-right [&>input]:-moz-appearance-textfield [&>input::-webkit-outer-spin-button]:appearance-none [&>input::-webkit-inner-spin-button]:appearance-none"
              :disabled="!fontSizeEnabled"
              @update:model-value="update('fontSize', { value: Number($event), unit: unitFor(modelValue.fontSize) })" />
            <USelect :model-value="unitFor(modelValue.fontSize)" :items="unitConv.unitOptions" size="xs" class="w-16"
              :disabled="!fontSizeEnabled" @update:model-value="changeUnit('fontSize', $event as CssUnit)" />
          </div>
        </div>
      </div>
    </fieldset>

    <USeparator />

    <!-- COLOURS -->
    <fieldset class="flex flex-col gap-3 border-0 p-0 m-0">
      <legend class="flex items-center justify-between w-full mb-1.5">
        <span class="control-group-title">{{ t('controls.colours') }}</span>
        <USwitch :model-value="colorsEnabled" size="xs" color="primary" @update:model-value="toggleColors" />
      </legend>

      <div :class="[colorsEnabled ? '' : 'opacity-50 pointer-events-none']" class="flex flex-col gap-3">
        <ColorPicker v-slot="{ show }" v-model="bgColor" with-alpha with-initial-color with-eye-dropper with-hex-input
          with-rgb-input>
          <div class="flex items-center justify-between gap-3">
            <button type="button" class="color-swatch" :disabled="!colorsEnabled" @click="show">
              <div class="color-swatch-inner" :style="{ backgroundColor: bgColor }" />
            </button>
            <div class="flex flex-col flex-1 min-w-0">
              <span class="color-label-title">{{ t('controls.background') }}</span>
              <span class="color-label-hex">{{ bgColor }}</span>
            </div>
            <UInput :model-value="bgColor" size="sm" :disabled="!colorsEnabled" class="w-24 shrink-0"
              @update:model-value="update('bg', $event)" />
          </div>
        </ColorPicker>

        <ColorPicker v-slot="{ show }" v-model="fgTextColor" with-alpha with-initial-color with-eye-dropper
          with-hex-input with-rgb-input>
          <div class="flex items-center justify-between gap-3">
            <button type="button" class="color-swatch" :disabled="!colorsEnabled" @click="show">
              <div class="color-swatch-inner" :style="{ backgroundColor: fgTextColor }" />
            </button>
            <div class="flex flex-col flex-1 min-w-0">
              <span class="color-label-title">{{ t('controls.textColor') }}</span>
              <span class="color-label-hex">{{ fgTextColor }}</span>
            </div>
            <UInput :model-value="fgTextColor" size="sm" :disabled="!colorsEnabled" class="w-24 shrink-0"
              @update:model-value="update('fgText', $event)" />
          </div>
        </ColorPicker>

        <ContrastBadge :ratio="contrastRatio" :verdict="contrastVerdict" />

        <ColorPicker v-slot="{ show }" v-model="borderColorComputed" with-alpha with-initial-color with-eye-dropper
          with-hex-input with-rgb-input>
          <div class="flex items-center justify-between gap-3">
            <button type="button" class="color-swatch" :disabled="!colorsEnabled" @click="show">
              <div class="color-swatch-inner" :style="{ backgroundColor: borderColorComputed }" />
            </button>
            <div class="flex flex-col flex-1 min-w-0">
              <span class="color-label-title">{{ t('controls.borderColor') }}</span>
              <span class="color-label-hex">{{ borderColorComputed }}</span>
            </div>
            <UInput :model-value="borderColorComputed" size="sm" :disabled="!colorsEnabled" class="w-24 shrink-0"
              @update:model-value="update('borderColor', $event)" />
          </div>
        </ColorPicker>
      </div>
    </fieldset>
  </div>
</template>

<style scoped>
.control-group-title {
  font-size: var(--al-font-size-caption);
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin: 0;
}

.color-swatch {
  width: 40px;
  height: 40px;
  padding: 4px;
  border-radius: 6px;
  border: 2px solid var(--border-strong);
  background: transparent;
  cursor: pointer;
  flex-shrink: 0;
}

.color-swatch:focus-visible {
  outline: 3px solid var(--focus-ring);
  outline-offset: 0;
}

.color-swatch:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.color-swatch-inner {
  width: 100%;
  height: 100%;
  border-radius: 3px;
}

.color-label-title {
  font-size: var(--al-font-size-heading);
  font-weight: 500;
  color: var(--text-primary);
}

.color-label-hex {
  font-size: var(--al-font-size-detail);
  color: var(--text-muted);
  font-family: var(--al-font-mono);
}

.control-label-link {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: var(--text-primary);
  text-decoration: none;
  cursor: pointer;
}

.control-label-link:hover,
.control-label-link:focus-visible {
  color: var(--brand);
  text-decoration: underline;
  text-underline-offset: 2px;
}

.control-label-link:focus-visible {
  outline: 3px solid var(--focus-ring);
  outline-offset: 2px;
  border-radius: 2px;
}

.control-label-link-icon {
  font-size: var(--al-font-size-detail);
  opacity: 0.7;
}
</style>
