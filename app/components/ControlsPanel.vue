<script setup lang="ts">
interface ButtonProps {
  label: string
  width: number
  height: number
  padding: number
  paddingTop: number
  paddingRight: number
  paddingBottom: number
  paddingLeft: number
  borderWidth: number
  borderTopWidth: number
  borderRightWidth: number
  borderBottomWidth: number
  borderLeftWidth: number
  fontSize: number
  bg: string
  fgText: string
  borderColor: string
  ariaLabel: string
  contentType: 'text' | 'icon'
}

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

function updatePadding(value: number) {
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

const isPaddingSplit = ref(false)
const isBorderSplit = ref(false)

const borderControls = [
  { id: 'top', key: 'borderTopWidth', label: 'T' },
  { id: 'right', key: 'borderRightWidth', label: 'R' },
  { id: 'bottom', key: 'borderBottomWidth', label: 'B' },
  { id: 'left', key: 'borderLeftWidth', label: 'L' }
] as const

function updateBorderWidth(value: number) {
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
  get: () => props.modelValue.bg ?? '#EFEFEF',
  set: (value: string) => update('bg', value)
})

const fgTextColor = computed({
  get: () => props.modelValue.fgText ?? '#000000',
  set: (value: string) => update('fgText', value)
})

const borderColor = computed({
  get: () => props.modelValue.borderColor ?? '#888888',
  set: (value: string) => update('borderColor', value)
})
</script>

<template>
  <div class="flex flex-col gap-4">
    <UFormField :label="t('controls.label')" class="flex flex-col">
      <UInput :model-value="modelValue.label ?? 'Click Me!'" class="w-full"
        @update:model-value="update('label', $event)" />
    </UFormField>

    <USeparator />

    <fieldset class="flex flex-col gap-3 border-0 p-0 m-0">
      <legend class="control-group-title mb-1.5">{{ t('controls.dimensions') }}</legend>

      <UFormField :label="t('controls.width')" class="flex flex-col">
        <div class="flex items-center gap-3">
          <USlider :model-value="modelValue.width ?? 70" :min="16" :max="400" :step="10" color="primary" size="sm"
            class="flex-1" @update:model-value="update('width', Number($event))" />
          <span class="control-value">{{ modelValue.width ?? 70 }}px</span>
        </div>
      </UFormField>

      <UFormField :label="t('controls.height')" class="flex flex-col">
        <div class="flex items-center gap-3">
          <USlider :model-value="modelValue.height ?? 21" :min="16" :max="400" :step="10" color="primary" size="sm"
            class="flex-1" @update:model-value="update('height', Number($event))" />
          <span class="control-value">{{ modelValue.height ?? 21 }}px</span>
        </div>
      </UFormField>

      <UFormField class="control-field [&>div]:w-full [&_label]:w-full">
        <template #label>
          <span class="flex items-center justify-between w-full">
            <span>{{ t('controls.padding') }}</span>
            <UButton size="xs" variant="ghost" color="neutral" class="pr-0"
              :icon="isPaddingSplit ? 'i-lucide-square' : 'i-lucide-grid-3x3'" trailing
              @click="isPaddingSplit = !isPaddingSplit">
              {{ isPaddingSplit ? 'Merge' : 'Split' }}
            </UButton>
          </span>
        </template>

        <div v-if="!isPaddingSplit" class="flex items-center gap-3">
          <USlider :model-value="modelValue.padding ?? 8" :min="0" :max="120" :step="2" color="primary" size="sm"
            class="flex-1" @update:model-value="updatePadding(Number($event))" />
          <span class="control-value">{{ modelValue.padding ?? 8 }}px</span>
        </div>

        <div v-else class="flex flex-col gap-2">
          <div v-for="dir in paddingControls" :key="dir.id" class="flex items-center gap-2">
            <label :for="`padding-${dir.id}`" class="control-split-label">{{ dir.label }}</label>

            <USlider :id="`padding-${dir.id}`" :model-value="modelValue[dir.key] ?? modelValue.padding ?? 8" :min="0"
              :max="120" :step="2" color="primary" size="sm" class="flex-1"
              @update:model-value="update(dir.key, Number($event))" />

            <span class="control-value-split">
              {{ modelValue[dir.key] ?? modelValue.padding ?? 8 }}px
            </span>
          </div>
        </div>
      </UFormField>

      <UFormField class="control-field [&>div]:w-full [&_label]:w-full">
        <template #label>
          <span class="flex items-center justify-between w-full">
            <span>{{ t('controls.borderWidth') }}</span>
            <UButton size="xs" variant="ghost" color="neutral" class="pr-0"
              :icon="isBorderSplit ? 'i-lucide-square' : 'i-lucide-grid-3x3'" trailing
              @click="isBorderSplit = !isBorderSplit">
              {{ isBorderSplit ? 'Merge' : 'Split' }}
            </UButton>
          </span>
        </template>

        <div v-if="!isBorderSplit" class="flex items-center gap-3">
          <USlider :model-value="modelValue.borderWidth ?? 0" :min="0" :max="20" :step="1" color="primary" size="sm"
            class="flex-1" @update:model-value="updateBorderWidth(Number($event))" />
          <span class="control-value">{{ modelValue.borderWidth ?? 0 }}px</span>
        </div>

        <div v-else class="flex flex-col gap-2">
          <div v-for="dir in borderControls" :key="dir.id" class="flex items-center gap-2">
            <label :for="`border-${dir.id}`" class="control-split-label">{{ dir.label }}</label>

            <USlider :id="`border-${dir.id}`" :model-value="modelValue[dir.key] ?? modelValue.borderWidth ?? 0" :min="0"
              :max="20" :step="1" color="primary" size="sm" class="flex-1"
              @update:model-value="update(dir.key, Number($event))" />

            <span class="control-value-split">
              {{ modelValue[dir.key] ?? modelValue.borderWidth ?? 0 }}px
            </span>
          </div>
        </div>
      </UFormField>
    </fieldset>

    <USeparator />

    <fieldset class="flex flex-col gap-3 border-0 p-0 m-0">
      <legend class="control-group-title mb-1.5">{{ t('controls.text') }}</legend>

      <UFormField :label="t('controls.fontSize')" class="flex flex-col">
        <div class="flex items-center gap-3">
          <USlider :model-value="modelValue.fontSize ?? 14" :min="8" :max="128" :step="2" color="primary" size="sm"
            class="flex-1" @update:model-value="update('fontSize', Number($event))" />
          <span class="control-value">{{ modelValue.fontSize ?? 14 }}px</span>
        </div>
      </UFormField>
    </fieldset>

    <USeparator />

    <fieldset class="flex flex-col gap-3 border-0 p-0 m-0">
      <legend class="control-group-title mb-1.5">{{ t('controls.colours') }}</legend>

      <ColorPicker v-model="bgColor" with-alpha with-initial-color with-eye-dropper with-hex-input with-rgb-input
        v-slot="{ show }">
        <div class="flex items-center justify-between gap-3">
          <button type="button" class="color-swatch" @click="show">
            <div class="color-swatch-inner" :style="{ backgroundColor: bgColor }" />
          </button>
          <div class="flex flex-col flex-1 min-w-0">
            <span class="color-label-title">{{ t('controls.background') }}</span>
            <span class="color-label-hex">{{ bgColor }}</span>
          </div>
          <UInput :model-value="bgColor" size="sm" class="w-24 shrink-0" @update:model-value="update('bg', $event)" />
        </div>
      </ColorPicker>

      <ColorPicker v-model="fgTextColor" with-alpha with-initial-color with-eye-dropper with-hex-input with-rgb-input
        v-slot="{ show }">
        <div class="flex items-center justify-between gap-3">
          <button type="button" class="color-swatch" @click="show">
            <div class="color-swatch-inner" :style="{ backgroundColor: fgTextColor }" />
          </button>
          <div class="flex flex-col flex-1 min-w-0">
            <span class="color-label-title">{{ t('controls.textColor') }}</span>
            <span class="color-label-hex">{{ fgTextColor }}</span>
          </div>
          <UInput :model-value="fgTextColor" size="sm" class="w-24 shrink-0"
            @update:model-value="update('fgText', $event)" />
        </div>
      </ColorPicker>

      <ColorPicker v-model="borderColor" with-alpha with-initial-color with-eye-dropper with-hex-input with-rgb-input
        v-slot="{ show }">
        <div class="flex items-center justify-between gap-3">
          <button type="button" class="color-swatch" @click="show">
            <div class="color-swatch-inner" :style="{ backgroundColor: borderColor }" />
          </button>
          <div class="flex flex-col flex-1 min-w-0">
            <span class="color-label-title">{{ t('controls.borderColor') }}</span>
            <span class="color-label-hex">{{ borderColor }}</span>
          </div>
          <UInput :model-value="borderColor" size="sm" class="w-24 shrink-0"
            @update:model-value="update('borderColor', $event)" />
        </div>
      </ColorPicker>
    </fieldset>

    <USeparator />

    <fieldset class="flex flex-col gap-3 border-0 p-0 m-0">
      <legend class="control-group-title mb-1.5">{{ t('controls.aria') }}</legend>

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
}

.control-value,
.control-value-split {
  font-size: var(--al-font-size-detail);
  color: var(--text-muted);
  white-space: nowrap;
}

.control-value {
  min-width: 52px;
  text-align: right;
}

.control-value-split {
  min-width: 44px;
  text-align: right;
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
</style>
