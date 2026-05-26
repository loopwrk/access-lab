<script setup lang="ts">
import type { ButtonProps } from '~/components/inspected/button/definition'
import { buttonDefinition } from '~/components/inspected/button/definition'
import { useUnitConversion } from '~/composables/useUnitConversion'
import type { CssUnit, CssLength } from '~/composables/useUnitConversion'

const paddingControls = [
  { id: 'top', key: 'paddingTop', label: 'T' },
  { id: 'right', key: 'paddingRight', label: 'R' },
  { id: 'bottom', key: 'paddingBottom', label: 'B' },
  { id: 'left', key: 'paddingLeft', label: 'L' }
] as const

const props = defineProps<{
  modelValue: Partial<ButtonProps>
}>()

const emit = defineEmits<{
  'update:modelValue': [value: Partial<ButtonProps>]
}>()

function update<K extends keyof ButtonProps>(key: K, value: ButtonProps[K]) {
  emit('update:modelValue', { ...props.modelValue, [key]: value })
}

function updatePadding(value: CssLength) {
  emit('update:modelValue', {
    ...props.modelValue,
    padding: value,
    paddingTop: value,
    paddingRight: value,
    paddingBottom: value,
    paddingLeft: value
  })
}

const { t } = useI18n()
const unitConv = useUnitConversion()
const { defaults: browserDefaults, measureIntrinsicSize } = useBrowserDefaults(buttonDefinition.tagName)

/**
 * Per-property unit picker handler. Reads the field's current unit
 * from its stored CssLength and writes a converted CssLength when the
 * picker changes, preserving the rendered pixel size at the moment of
 * switch.
 */
function changeUnit<K extends keyof ButtonProps>(key: K, newUnit: CssUnit) {
  const current = props.modelValue[key]
  if (!unitConv.isCssLength(current)) return
  if (current.unit === newUnit) return
  update(key, unitConv.convertLength(current, newUnit) as ButtonProps[K])
}

function changeGroupUnit(
  keys: readonly (keyof ButtonProps)[],
  newUnit: CssUnit
) {
  const next = { ...props.modelValue }
  let changed = false
  for (const k of keys) {
    const v = props.modelValue[k]
    if (unitConv.isCssLength(v) && v.unit !== newUnit) {
      ; (next as Record<string, unknown>)[k] = unitConv.convertLength(v, newUnit)
      changed = true
    }
  }
  if (changed) emit('update:modelValue', next)
}

const PADDING_KEYS = ['padding', 'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft'] as const
const BORDER_KEYS = ['borderWidth', 'borderTopWidth', 'borderRightWidth', 'borderBottomWidth', 'borderLeftWidth'] as const

/**
 * Build inline CSS reflecting the user's currently-enabled style overrides.
 * Used by intrinsic-size measurement so the slider snaps to a width/height
 * that matches what the iframe is actually rendering right now.
 *
 * IMPORTANT: this must mirror render.ts exactly. Specifically, we only emit
 * padding/border declarations when the user has *explicitly* set values —
 * otherwise we'd be overriding asymmetric UA defaults (e.g. button padding
 * is `1px 6px` in Chrome, not uniform) with a single uniform value and the
 * probe would measure smaller than the iframe.
 */
function buildEffectiveCss(): string {
  const m = props.modelValue
  const parts: string[] = []
  // Probe runs in the host page, so we resolve every CssLength to px
  // before constructing styles. The iframe will receive unit-faithful
  // CSS via the render function; the probe just needs accurate pixel
  // measurements that match what the iframe produces.
  const px = (length: CssLength | undefined): number =>
    length ? unitConv.lengthToPx(length) : 0

  if (fontSizeEnabled.value && m.fontSize != null) {
    parts.push(`font-size:${px(m.fontSize)}px`)
  }

  if (paddingEnabled.value) {
    const hasIndividual = m.paddingTop != null || m.paddingRight != null
      || m.paddingBottom != null || m.paddingLeft != null
    if (hasIndividual) {
      const fallback = m.padding
      const pt = px(m.paddingTop ?? fallback)
      const pr = px(m.paddingRight ?? fallback)
      const pb = px(m.paddingBottom ?? fallback)
      const pl = px(m.paddingLeft ?? fallback)
      parts.push(`padding:${pt}px ${pr}px ${pb}px ${pl}px`)
    } else if (m.padding != null) {
      parts.push(`padding:${px(m.padding)}px`)
    }
    // else: no explicit value, UA default padding applies via `all: revert`
  }

  if (borderEnabled.value) {
    const hasIndividual = m.borderTopWidth != null || m.borderRightWidth != null
      || m.borderBottomWidth != null || m.borderLeftWidth != null
    if (hasIndividual) {
      const fallback = m.borderWidth
      const bt = px(m.borderTopWidth ?? fallback)
      const br = px(m.borderRightWidth ?? fallback)
      const bb = px(m.borderBottomWidth ?? fallback)
      const bl = px(m.borderLeftWidth ?? fallback)
      parts.push(
        `border-top-width:${bt}px;border-right-width:${br}px;border-bottom-width:${bb}px;border-left-width:${bl}px;border-style:solid`
      )
    } else if (m.borderWidth != null && m.borderWidth.value > 0) {
      parts.push(`border-width:${px(m.borderWidth)}px;border-style:solid`)
    }
    // else: no explicit value, UA default border applies via `all: revert`
  }

  return parts.join(';')
}

/** Mirror render.ts: icon mode uses a span with a magnifying glass glyph. */
function probeContent(): { content: string, asHtml: boolean } {
  const m = props.modelValue
  if (m.contentType === 'icon') {
    return { content: '<span aria-hidden="true">&#128269;</span>', asHtml: true }
  }
  return { content: m.label || 'Click Me!', asHtml: false }
}

function rgbToHex(rgbStr: string): string {
  if (!rgbStr || !rgbStr.includes('rgb')) return '#efefef'
  const match = rgbStr.match(/\d+/g)
  if (!match) return '#efefef'
  const [r = 239, g = 239, b = 239] = match.map(Number)
  return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)
}

const isPaddingSplit = ref(false)
const isBorderSplit = ref(false)

// Every visual control defaults off so the previewed element renders with
// raw UA styles on first paint — matching AccessLab's "see the component as
// a browser renders it on a virgin HTML document" promise. Toggling any
// section on commits that section's UA default into modelValue, at which
// point the renderer takes over for that property. The native-vs-CSS
// rendering mode jump (most visible on borders) thus happens at the toggle,
// where it's explainable, not at first slider-drag. <ControlsIntro> in the
// template explains this to first-time users.
const widthEnabled = ref(false)
const heightEnabled = ref(false)
const fontSizeEnabled = ref(false)
const paddingEnabled = ref(false)
const borderEnabled = ref(false)
const colorsEnabled = ref(false)

const _HARDCODED = {
  width: 70,
  height: 21,
  fontSize: 14,
  padding: 0,
  borderWidth: 2,
  bg: '#EFEFEF',
  fgText: '#000000',
  borderColor: '#888888'
}

const DEFAULTS = computed(() => {
  const b = browserDefaults.value

  const getNum = (prop: string): number | undefined => {
    const v = b?.[prop]
    if (!v || v === 'none') return undefined
    const n = parseFloat(v)
    return isNaN(n) ? undefined : n
  }

  return {
    width: _HARDCODED.width,
    height: _HARDCODED.height,
    fontSize: getNum('fontSize') ?? _HARDCODED.fontSize,
    padding: getNum('paddingTop') ?? _HARDCODED.padding,
    borderWidth: getNum('borderTopWidth') ?? _HARDCODED.borderWidth,
    bg: rgbToHex(b?.['backgroundColor'] ?? '') || _HARDCODED.bg,
    fgText: rgbToHex(b?.color ?? '') || _HARDCODED.fgText,
    borderColor: rgbToHex(b?.['borderTopColor'] ?? '') || _HARDCODED.borderColor
  }
})

/**
 * Live intrinsic size of the rendered button — recomputed whenever anything
 * that affects the shrink-to-fit dimensions changes (label, contentType,
 * font size, padding, border, and the enabled flags that gate whether those
 * overrides apply). Used to drive the width/height slider position + readout
 * when the user hasn't committed an explicit value, so the slider visibly
 * tracks the button as the user types.
 *
 * Placed after DEFAULTS so that `immediate: true` doesn't hit a TDZ on the
 * enabled refs referenced via buildEffectiveCss().
 */
const naturalSize = ref<{ width: number, height: number }>({ width: 0, height: 0 })

function recomputeNaturalSize() {
  if (!import.meta.client) return
  const { content, asHtml } = probeContent()
  naturalSize.value = measureIntrinsicSize(content, buildEffectiveCss(), asHtml)
}

watch(
  () => {
    const m = props.modelValue
    return [
      m.label, m.contentType,
      m.fontSize,
      m.padding, m.paddingTop, m.paddingRight, m.paddingBottom, m.paddingLeft,
      m.borderWidth, m.borderTopWidth, m.borderRightWidth, m.borderBottomWidth, m.borderLeftWidth,
      fontSizeEnabled.value, paddingEnabled.value, borderEnabled.value
    ]
  },
  recomputeNaturalSize,
  { immediate: true }
)

function clearPadding() {
  const next = { ...props.modelValue }
  delete next.padding
  delete next.paddingTop
  delete next.paddingRight
  delete next.paddingBottom
  delete next.paddingLeft
  emit('update:modelValue', next)
}

function restorePadding() {
  updatePadding(unitConv.fromPx(DEFAULTS.value.padding, 'px'))
}

function clearBorder() {
  const next = { ...props.modelValue }
  delete next.borderWidth
  delete next.borderTopWidth
  delete next.borderRightWidth
  delete next.borderBottomWidth
  delete next.borderLeftWidth
  delete next.borderColor
  emit('update:modelValue', next)
}

function restoreBorder() {
  const bw = unitConv.fromPx(DEFAULTS.value.borderWidth, 'px')
  emit('update:modelValue', {
    ...props.modelValue,
    borderWidth: bw,
    borderTopWidth: bw,
    borderRightWidth: bw,
    borderBottomWidth: bw,
    borderLeftWidth: bw,
    borderColor: DEFAULTS.value.borderColor
  })
}

function clearColors() {
  const next = { ...props.modelValue }
  delete next.bg
  delete next.fgText
  delete next.borderColor
  emit('update:modelValue', next)
}

function restoreColors() {
  emit('update:modelValue', {
    ...props.modelValue,
    bg: DEFAULTS.value.bg,
    fgText: DEFAULTS.value.fgText,
    borderColor: DEFAULTS.value.borderColor
  })
}

function togglePadding(value: boolean | 'indeterminate') {
  if (value === true) { restorePadding() } else { clearPadding() }
  paddingEnabled.value = value === true
}

function toggleBorder(value: boolean | 'indeterminate') {
  if (value === true) { restoreBorder() } else { clearBorder() }
  borderEnabled.value = value === true
}

function toggleColors(value: boolean | 'indeterminate') {
  if (value === true) { restoreColors() } else { clearColors() }
  colorsEnabled.value = value === true
}

function toggleWidth(value: boolean | 'indeterminate') {
  if (value === true) {
    update('width', unitConv.fromPx(naturalSize.value.width || DEFAULTS.value.width, 'px'))
  } else {
    update('width', undefined as unknown as CssLength)
  }
  widthEnabled.value = value === true
}

function toggleHeight(value: boolean | 'indeterminate') {
  if (value === true) {
    update('height', unitConv.fromPx(naturalSize.value.height || DEFAULTS.value.height, 'px'))
  } else {
    update('height', undefined as unknown as CssLength)
  }
  heightEnabled.value = value === true
}

function toggleFontSize(value: boolean | 'indeterminate') {
  if (value === true) {
    update('fontSize', unitConv.fromPx(DEFAULTS.value.fontSize, 'rem'))
  } else {
    update('fontSize', undefined as unknown as CssLength)
  }
  fontSizeEnabled.value = value === true
}

const borderControls = [
  { id: 'top', key: 'borderTopWidth', label: 'T' },
  { id: 'right', key: 'borderRightWidth', label: 'R' },
  { id: 'bottom', key: 'borderBottomWidth', label: 'B' },
  { id: 'left', key: 'borderLeftWidth', label: 'L' }
] as const

function updateBorderWidth(value: CssLength) {
  emit('update:modelValue', {
    ...props.modelValue,
    borderWidth: value,
    borderTopWidth: value,
    borderRightWidth: value,
    borderBottomWidth: value,
    borderLeftWidth: value
  })
}

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

// Live WCAG contrast — uses the computed bg/fg (which already fall back
// through user value → UA default → hardcoded) so the badge always
// reflects what the iframe is actually rendering. The page backdrop
// stays at the default (#ffffff) because the preview iframe's body is
// unstyled. See research/contrast-calculation.md for the maths.
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

const { focusLearnTopic } = useInspectorTab()

function displayLength(length: CssLength | undefined, fallbackPx: number): string {
  return length ? String(length.value) : String(fallbackPx)
}

/**
 * Slider model-value: resolve CssLength to "slider px" (stable
 * reference of 16, independent of the simulated root) or use the px
 * fallback.
 */
function pxOrFallback(length: CssLength | undefined, fallbackPx: number): number {
  return length ? unitConv.lengthToSliderPx(length) : fallbackPx
}

/** Pick the unit a writeback should use for a given field. Returns the
 *  field's committed unit if there is one, otherwise px.
*/
function unitFor(length: CssLength | undefined): CssUnit {
  return length?.unit ?? 'px'
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <ControlsIntro :element-name="buttonDefinition.name.toLowerCase()" />

    <UFormField class="flex flex-col">
      <template #label>
        <a href="#topic-vague-label" class="control-group-title control-label-link"
          @click.prevent="focusLearnTopic('vague-label')">
          {{ t('controls.label') }}
          <UIcon name="i-lucide-arrow-up-right" class="control-label-link-icon" aria-hidden="true" />
        </a>
      </template>
      <UInput :model-value="modelValue.label ?? 'Button Label'" class="w-full"
        @update:model-value="update('label', $event)" />
    </UFormField>

    <USeparator />

    <!--
      Simulated browser root font-size. Drives both the iframe's <html>
      font-size (so rem in rendered CSS resolves against this base) and
      the controls panel's px <-> rem conversion.
    -->
    <fieldset class="flex flex-col gap-3 border-0 p-0 m-0">
      <legend class="flex items-center justify-between w-full mb-1.5">
        <a href="#topic-rem-units" class="control-group-title control-label-link"" @click.prevent="
          focusLearnTopic('rem-units')">
          {{ t('controls.simulatedRoot.label') }}
          <UIcon name="i-lucide-arrow-up-right" class="control-link-title-icon" aria-hidden="true" />
        </a>
        <span class="text-(length:--al-font-size-detail) text-(--text-muted) font-mono">
          {{ unitConv.simulatedRootPx.value }}px
        </span>
      </legend>
      <USlider :model-value="unitConv.simulatedRootPx.value" :min="12" :max="32" :step="1" color="primary" size="sm"
        @update:model-value="unitConv.simulatedRootPx.value = Number($event)" />
    </fieldset>

    <USeparator />

    <!-- TEXT -->
    <fieldset class="flex flex-col gap-3 border-0 p-0 m-0">
      <!-- <legend class="control-group-title mb-1.5">
        {{ t('controls.text') }}
      </legend> -->

      <div>
        <div class="flex items-center justify-between mb-1.5">
          <span class="control-group-title font-medium text-(--text-secondary)">{{
            t('controls.fontSize') }}</span>
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

    <!-- DIMENSIONS -->
    <fieldset class="flex flex-col gap-3 border-0 p-0 m-0">
      <!-- <legend class="control-group-title mb-1.5">
        {{ t('controls.dimensions') }}
      </legend> -->

      <div class="flex flex-col gap-3">
        <div class="mb-1">
          <div class="flex items-center justify-between mb-2">
            <span class="control-group-title font-medium text-(--text-secondary)">{{ t('controls.width')
            }}</span>
            <USwitch :model-value="widthEnabled" size="xs" color="primary" @update:model-value="toggleWidth" />
          </div>
          <div :class="[widthEnabled ? '' : 'opacity-50']" class="flex items-center gap-3">
            <USlider :model-value="pxOrFallback(modelValue.width, naturalSize.width || DEFAULTS.width)" :min="16"
              :max="400" :step="10" color="primary" size="sm" :disabled="!widthEnabled" class="flex-1"
              @update:model-value="update('width', unitConv.fromSliderPx(Number($event), unitFor(modelValue.width)))" />
            <div v-if="widthEnabled" class="flex items-center gap-1">
              <UInput :model-value="displayLength(modelValue.width, naturalSize.width || DEFAULTS.width)" size="xs"
                type="number"
                class="w-11 [&>input]:text-right [&>input]:-moz-appearance-textfield [&>input::-webkit-outer-spin-button]:appearance-none [&>input::-webkit-inner-spin-button]:appearance-none"
                :disabled="!widthEnabled"
                @update:model-value="update('width', { value: Number($event), unit: unitFor(modelValue.width) })" />
              <USelect :model-value="unitFor(modelValue.width)" :items="unitConv.unitOptions" size="xs" class="w-16"
                :disabled="!widthEnabled" @update:model-value="changeUnit('width', $event as CssUnit)" />
            </div>
          </div>
        </div>

        <div>
          <div class="flex items-center justify-between mb-2">
            <span class="control-group-title font-medium text-(--text-secondary)">{{
              t('controls.height')
            }}</span>
            <USwitch :model-value="heightEnabled" size="xs" color="primary" @update:model-value="toggleHeight" />
          </div>
          <div :class="[heightEnabled ? '' : 'opacity-50']" class="flex items-center gap-3">
            <USlider :model-value="pxOrFallback(modelValue.height, naturalSize.height || DEFAULTS.height)" :min="16"
              :max="400" :step="10" color="primary" size="sm" :disabled="!heightEnabled" class="flex-1"
              @update:model-value="update('height', unitConv.fromSliderPx(Number($event), unitFor(modelValue.height)))" />
            <div v-if="heightEnabled" class="flex items-center gap-1">
              <UInput :model-value="displayLength(modelValue.height, naturalSize.height || DEFAULTS.height)" size="xs"
                type="number" :step="unitConv.displayStep(10, unitFor(modelValue.height))"
                class="w-11 [&>input]:text-right [&>input]:-moz-appearance-textfield [&>input::-webkit-outer-spin-button]:appearance-none [&>input::-webkit-inner-spin-button]:appearance-none"
                :disabled="!heightEnabled"
                @update:model-value="update('height', { value: Number($event), unit: unitFor(modelValue.height) })" />
              <USelect :model-value="unitFor(modelValue.height)" :items="unitConv.unitOptions" size="xs" class="w-16"
                :disabled="!heightEnabled" @update:model-value="changeUnit('height', $event as CssUnit)" />
            </div>
          </div>
        </div>
      </div>
    </fieldset>

    <USeparator />

    <!-- PADDING -->
    <fieldset class="flex flex-col gap-3 border-0 p-0 m-0">
      <legend class="flex items-center justify-between w-full mb-1.5">
        <span class="control-group-title">{{ t('controls.padding') }}</span>
        <USwitch :model-value="paddingEnabled" size="xs" color="primary" @update:model-value="togglePadding" />
      </legend>

      <div :class="[paddingEnabled ? '' : 'opacity-50']">
        <UFormField class="control-field [&>div]:w-full [&_label]:w-full">
          <template #label>
            <span class="flex items-center justify-between w-full">
              <span />
              <UButton size="xs" variant="ghost" color="primary" class="pr-0" :disabled="!paddingEnabled"
                :icon="isPaddingSplit ? 'i-lucide-square' : 'i-lucide-grid-3x3'" trailing
                @click="isPaddingSplit = !isPaddingSplit">
                {{ isPaddingSplit ? 'Merge' : 'Split' }}
              </UButton>
            </span>
          </template>

          <div v-if="!isPaddingSplit" class="flex items-center gap-3">
            <USlider :model-value="pxOrFallback(modelValue.padding, DEFAULTS.padding)" :min="0" :max="120" :step="2"
              color="primary" size="sm" :disabled="!paddingEnabled" class="flex-1"
              @update:model-value="updatePadding(unitConv.fromSliderPx(Number($event), unitFor(modelValue.padding)))" />
            <div v-if="paddingEnabled" class="flex items-center gap-1">
              <UInput :model-value="displayLength(modelValue.padding, DEFAULTS.padding)" size="xs" type="number"
                class="w-11 [&>input]:text-right [&>input]:-moz-appearance-textfield [&>input::-webkit-outer-spin-button]:appearance-none [&>input::-webkit-inner-spin-button]:appearance-none"
                :disabled="!paddingEnabled"
                @update:model-value="updatePadding({ value: Number($event), unit: unitFor(modelValue.padding) })" />
              <USelect :model-value="unitFor(modelValue.padding)" :items="unitConv.unitOptions" size="xs" class="w-16"
                :disabled="!paddingEnabled" @update:model-value="changeGroupUnit(PADDING_KEYS, $event as CssUnit)" />
            </div>
          </div>

          <div v-else class="flex flex-col gap-2">
            <div v-for="dir in paddingControls" :key="dir.id" class="flex items-center gap-2">
              <label :for="`padding-${dir.id}`" class="control-split-label">{{ dir.label }}</label>
              <USlider :id="`padding-${dir.id}`"
                :model-value="pxOrFallback(modelValue[dir.key] ?? modelValue.padding, DEFAULTS.padding)" :min="0"
                :max="120" :step="2" color="primary" size="sm" :disabled="!paddingEnabled" class="flex-1"
                @update:model-value="update(dir.key, unitConv.fromSliderPx(Number($event), unitFor(modelValue[dir.key] ?? modelValue.padding)))" />
              <div v-if="paddingEnabled" class="flex items-center gap-1">
                <UInput :model-value="displayLength(modelValue[dir.key] ?? modelValue.padding, DEFAULTS.padding)"
                  size="xs" type="number"
                  :step="unitConv.displayStep(2, unitFor(modelValue[dir.key] ?? modelValue.padding))"
                  class="w-16 [&>input]:text-right [&>input]:-moz-appearance-textfield [&>input::-webkit-outer-spin-button]:appearance-none [&>input::-webkit-inner-spin-button]:appearance-none"
                  :disabled="!paddingEnabled"
                  @update:model-value="update(dir.key, { value: Number($event), unit: unitFor(modelValue[dir.key] ?? modelValue.padding) })" />
                <USelect :model-value="unitFor(modelValue[dir.key] ?? modelValue.padding)" :items="unitConv.unitOptions"
                  size="xs" class="w-16" :disabled="!paddingEnabled"
                  @update:model-value="changeGroupUnit(PADDING_KEYS, $event as CssUnit)" />
              </div>
            </div>
          </div>
        </UFormField>
      </div>
    </fieldset>

    <USeparator />

    <!-- BORDER -->
    <fieldset class="flex flex-col gap-3 border-0 p-0 m-0">
      <legend class="flex items-center justify-between w-full mb-1.5">
        <!-- <span class="control-group-title">{{ t('controls.border') }}</span> -->
        <USwitch :model-value="borderEnabled" size="xs" color="primary" @update:model-value="toggleBorder" />
      </legend>

      <div :class="[borderEnabled ? '' : 'opacity-50']">
        <UFormField class="control-field [&>div]:w-full [&_label]:w-full">
          <template #label>
            <span class="flex items-center justify-between w-full">
              <span class="control-group-title font-medium text-(--text-secondary)">{{ t('controls.borderWidth')
              }}</span>
              <UButton size="xs" variant="ghost" color="primary" class="pr-0" :disabled="!borderEnabled"
                :icon="isBorderSplit ? 'i-lucide-square' : 'i-lucide-grid-3x3'" trailing
                @click="isBorderSplit = !isBorderSplit">
                {{ isBorderSplit ? 'Merge' : 'Split' }}
              </UButton>
            </span>
          </template>

          <div v-if="!isBorderSplit" class="flex items-center gap-3">
            <USlider :model-value="pxOrFallback(modelValue.borderWidth, DEFAULTS.borderWidth)" :min="0" :max="20"
              :step="1" color="primary" size="sm" :disabled="!borderEnabled" class="flex-1"
              @update:model-value="updateBorderWidth(unitConv.fromSliderPx(Number($event), unitFor(modelValue.borderWidth)))" />
            <div v-if="borderEnabled" class="flex items-center gap-1">
              <UInput :model-value="displayLength(modelValue.borderWidth, DEFAULTS.borderWidth)" size="xs" type="number"
                class="w-11 [&>input]:text-right [&>input]:-moz-appearance-textfield [&>input::-webkit-outer-spin-button]:appearance-none [&>input::-webkit-inner-spin-button]:appearance-none"
                :disabled="!borderEnabled"
                @update:model-value="updateBorderWidth({ value: Number($event), unit: unitFor(modelValue.borderWidth) })" />
              <USelect :model-value="unitFor(modelValue.borderWidth)" :items="unitConv.unitOptions" size="xs"
                class="w-16" :disabled="!borderEnabled"
                @update:model-value="changeGroupUnit(BORDER_KEYS, $event as CssUnit)" />
            </div>
          </div>

          <div v-else class="flex flex-col gap-2">
            <div v-for="dir in borderControls" :key="dir.id" class="flex items-center gap-2">
              <label :for="`border-${dir.id}`" class="control-split-label">{{ dir.label }}</label>
              <USlider :id="`border-${dir.id}`"
                :model-value="pxOrFallback(modelValue[dir.key] ?? modelValue.borderWidth, DEFAULTS.borderWidth)"
                :min="0" :max="20" :step="1" color="primary" size="sm" :disabled="!borderEnabled" class="flex-1"
                @update:model-value="update(dir.key, unitConv.fromSliderPx(Number($event), unitFor(modelValue[dir.key] ?? modelValue.borderWidth)))" />
              <div v-if="borderEnabled" class="flex items-center gap-1">
                <UInput
                  :model-value="displayLength(modelValue[dir.key] ?? modelValue.borderWidth, DEFAULTS.borderWidth)"
                  size="xs" type="number"
                  :step="unitConv.displayStep(1, unitFor(modelValue[dir.key] ?? modelValue.borderWidth))"
                  class="w-16 [&>input]:text-right [&>input]:-moz-appearance-textfield [&>input::-webkit-outer-spin-button]:appearance-none [&>input::-webkit-inner-spin-button]:appearance-none"
                  :disabled="!borderEnabled"
                  @update:model-value="update(dir.key, { value: Number($event), unit: unitFor(modelValue[dir.key] ?? modelValue.borderWidth) })" />
                <USelect :model-value="unitFor(modelValue[dir.key] ?? modelValue.borderWidth)"
                  :items="unitConv.unitOptions" size="xs" class="w-16" :disabled="!borderEnabled"
                  @update:model-value="changeGroupUnit(BORDER_KEYS, $event as CssUnit)" />
              </div>
            </div>
          </div>
        </UFormField>
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

        <!-- Sits after bg + text because those are the pair the badge compares.
             Border colour follows separately below. -->
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

    <USeparator />

    <!-- ARIA -->
    <fieldset class="flex flex-col gap-3 border-0 p-0 m-0">
      <legend class="control-group-title mb-1.5">
        {{ t('controls.aria') }}
      </legend>

      <UFormField class="flex flex-col">
        <template #label>
          <span>{{ t('controls.contentType') }}</span>
        </template>
        <UFieldGroup size="sm">
          <UButton :color="(modelValue.contentType ?? 'text') === 'text' ? 'primary' : 'neutral'"
            :variant="(modelValue.contentType ?? 'text') === 'text' ? 'solid' : 'ghost'"
            @click="update('contentType', 'text')">
            {{ t('controls.contentTypeText') }}
          </UButton>
          <UButton :color="modelValue.contentType === 'icon' ? 'primary' : 'neutral'"
            :variant="modelValue.contentType === 'icon' ? 'solid' : 'ghost'" icon="i-lucide-search"
            @click="update('contentType', 'icon')">
            {{ t('controls.contentTypeIcon') }}
          </UButton>
        </UFieldGroup>
      </UFormField>

      <UFormField :label="t('controls.ariaLabel')" class="flex flex-col">
        <UInput :model-value="modelValue.ariaLabel ?? ''" :placeholder="t('controls.ariaLabelPlaceholder')"
          class="w-full" @update:model-value="update('ariaLabel', $event)" />
      </UFormField>
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

.control-split-label {
  font-size: var(--al-font-size-detail);
  font-weight: 500;
  color: var(--text-muted);
  width: 16px;
  text-align: center;
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

/* Section-title variant of the in-app Learn link. Inherits the
   uppercase tracked styling of `.control-group-title` so the legend
   still reads as a section header, while behaving as a link to a
   matching Learn-tab topic. */
.control-link-title {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: var(--al-font-size-caption);
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  text-decoration: none;
  cursor: pointer;
}

.control-link-title:hover,
.control-link-title:focus-visible {
  color: var(--brand);
  text-decoration: underline;
  text-underline-offset: 2px;
}

.control-link-title:focus-visible {
  outline: 3px solid var(--focus-ring);
  outline-offset: 2px;
  border-radius: 2px;
}

.control-link-title-icon {
  font-size: var(--al-font-size-detail);
  opacity: 0.7;
}
</style>
