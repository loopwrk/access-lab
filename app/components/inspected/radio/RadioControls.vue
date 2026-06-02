<script setup lang="ts">
import type { RadioProps, RadioLabelAssociation, RadioGroupMode } from './definition'
import ResetDefaultsSection from '~/components/ButtonStudio/sections/ResetDefaultsSection.vue'

const model = defineModel<Partial<RadioProps>>({ required: true })

function update<K extends keyof RadioProps>(key: K, value: RadioProps[K]) {
  model.value = { ...model.value, [key]: value }
}

const { t } = useI18n()
const { focusLearnTopic } = useInspectorTab()

const LABEL_OPTIONS: { value: RadioLabelAssociation, labelKey: string }[] = [
  { value: 'for-id', labelKey: 'controls.radio.labelForId' },
  { value: 'wrapping', labelKey: 'controls.radio.labelWrapping' },
  { value: 'aria-label', labelKey: 'controls.radio.labelAriaLabel' },
  { value: 'none', labelKey: 'controls.radio.labelNone' }
]

const GROUP_OPTIONS: { value: RadioGroupMode, labelKey: string }[] = [
  { value: 'group-with-fieldset', labelKey: 'controls.radio.groupWithFieldset' },
  { value: 'group-no-fieldset', labelKey: 'controls.radio.groupNoFieldset' }
]

const labelAssociation = computed(() => model.value.labelAssociation ?? 'for-id')
const groupMode = computed(() => model.value.groupMode ?? 'group-with-fieldset')

const groupItemsText = computed({
  get: () => (model.value.groupItems ?? []).join('\n'),
  set: (value: string) => {
    const items = value.split('\n').map(s => s.trim()).filter(Boolean)
    update('groupItems', items)
    // If the previously-selected item disappeared from the list,
    // clear the selection so the rendered HTML stays consistent.
    if (model.value.selectedItem && !items.includes(model.value.selectedItem)) {
      update('selectedItem', '')
    }
  }
})

// Reka UI (under USelect) forbids `value=""` on a SelectItem — the
// empty string is reserved as the "no selection" sentinel. We still
// want the user to be able to *pick* "(none)" from the dropdown
// (deselect after picking something), so we use a non-empty sentinel
// in the dropdown and translate it to/from the model's empty string.
//
// Computed (not inline) so the array reference stays stable across
// re-renders; an unstable items prop causes Reka's popover to
// flicker / hang in a half-open state.
const NONE_VALUE = '__none__'

const selectItems = computed(() => [
  { label: t('controls.radio.selectedNone'), value: NONE_VALUE },
  ...(model.value.groupItems ?? []).map(item => ({ label: item, value: item }))
])

const selectModel = computed({
  get: () => model.value.selectedItem || NONE_VALUE,
  set: (value: string) => update('selectedItem', value === NONE_VALUE ? '' : value)
})
</script>

<template>
  <div class="flex flex-col gap-4">
    <ResetDefaultsSection v-model="model" />
    <USeparator />

    <UFormField class="flex flex-col">
      <template #label>
        <span class="control-group-title">{{ t('controls.radio.label') }}</span>
      </template>
      <UInput :model-value="model.label ?? ''" :placeholder="t('controls.radio.labelPlaceholder')" class="w-full"
        @update:model-value="update('label', String($event))" />
    </UFormField>

    <USeparator />

    <fieldset class="flex flex-col gap-3 border-0 p-0 m-0">
      <legend class="control-group-title mb-1.5">
        <a href="#topic-radio" class="control-label-link" @click.prevent="focusLearnTopic('radio')">
          {{ t('controls.radio.labelAssociation') }}
          <UIcon name="i-lucide-arrow-up-right" class="control-label-link-icon" aria-hidden="true" />
        </a>
      </legend>
      <UFieldGroup size="sm" orientation="vertical">
        <UButton v-for="opt in LABEL_OPTIONS" :key="opt.value"
          :color="labelAssociation === opt.value ? 'primary' : 'neutral'"
          :variant="labelAssociation === opt.value ? 'solid' : 'ghost'" @click="update('labelAssociation', opt.value)">
          {{ t(opt.labelKey) }}
        </UButton>
      </UFieldGroup>
    </fieldset>

    <USeparator />

    <fieldset class="flex flex-col gap-3 border-0 p-0 m-0">
      <legend class="control-group-title mb-1.5">
        <a href="#topic-radio" class="control-label-link" @click.prevent="focusLearnTopic('radio')">
          {{ t('controls.radio.groupMode') }}
          <UIcon name="i-lucide-arrow-up-right" class="control-label-link-icon" aria-hidden="true" />
        </a>
      </legend>
      <UFieldGroup size="sm" orientation="vertical">
        <UButton v-for="opt in GROUP_OPTIONS" :key="opt.value" :color="groupMode === opt.value ? 'primary' : 'neutral'"
          :variant="groupMode === opt.value ? 'solid' : 'ghost'" @click="update('groupMode', opt.value)">
          {{ t(opt.labelKey) }}
        </UButton>
      </UFieldGroup>
    </fieldset>

    <USeparator />

    <UFormField class="flex flex-col">
      <template #label>
        <span class="control-group-title">{{ t('controls.radio.groupItems') }}</span>
      </template>
      <UTextarea v-model="groupItemsText" :placeholder="t('controls.radio.groupItemsPlaceholder')" :rows="4"
        class="w-full" />
    </UFormField>

    <USeparator />

    <UFormField class="flex flex-col">
      <template #label>
        <span class="control-group-title">{{ t('controls.radio.selectedItem') }}</span>
      </template>
      <USelect v-model="selectModel" :items="selectItems" size="sm" class="w-full" />
    </UFormField>

    <USeparator />

    <fieldset class="flex flex-col gap-2 border-0 p-0 m-0">
      <legend class="control-group-title mb-1.5">{{ t('controls.radio.state') }}</legend>

      <UFormField>
        <template #label>
          <span class="control-group-title">{{ t('controls.radio.required') }}</span>
        </template>
        <USwitch :model-value="model.required === true" size="sm" color="primary"
          @update:model-value="update('required', $event === true)" />
      </UFormField>

      <UFormField>
        <template #label>
          <span class="control-group-title">{{ t('controls.radio.disabled') }}</span>
        </template>
        <USwitch :model-value="model.disabled === true" size="sm" color="primary"
          @update:model-value="update('disabled', $event === true)" />
      </UFormField>
    </fieldset>

    <USeparator />

    <UFormField class="flex flex-col">
      <template #label>
        <span class="control-group-title">{{ t('controls.radio.name') }}</span>
      </template>
      <UInput :model-value="model.name ?? ''" :placeholder="t('controls.radio.namePlaceholder')" class="w-full"
        @update:model-value="update('name', String($event))" />
    </UFormField>
  </div>
</template>
