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
  fontSize: number
  bg: string
  fg: string
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
</script>

<template>
  <div class="flex flex-col gap-4">
    <UFormField :label="t('controls.label')" class="flex flex-col">
      <UInput :model-value="modelValue.label ?? ''" :placeholder="t('controls.labelPlaceholder')" class="w-full"
        @update:model-value="update('label', $event)" />
    </UFormField>

    <USeparator />

    <fieldset class="flex flex-col gap-3 border-0 p-0 m-0">
      <legend class="control-group-title mb-1.5">{{ t('controls.dimensions') }}</legend>

      <UFormField :label="t('controls.width')" class="flex flex-col">
        <div class="flex items-center gap-3">
          <USlider :model-value="modelValue.width ?? 70" :min="20" :max="400" :step="10" color="primary" size="sm"
            class="flex-1" @update:model-value="update('width', Number($event))" />
          <span class="control-value">{{ modelValue.width ?? 70 }}px</span>
        </div>
      </UFormField>

      <UFormField :label="t('controls.height')" class="flex flex-col">
        <div class="flex items-center gap-3">
          <USlider :model-value="modelValue.height ?? 21" :min="20" :max="400" :step="10" color="primary" size="sm"
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
</style>
