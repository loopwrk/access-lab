<script setup lang="ts">
import type { CheckboxProps, CheckboxLabelAssociation, CheckboxGroupMode } from './definition'
import ResetDefaultsSection from '~/components/ButtonStudio/sections/ResetDefaultsSection.vue'

const model = defineModel<Partial<CheckboxProps>>({ required: true })

function update<K extends keyof CheckboxProps>(key: K, value: CheckboxProps[K]) {
  model.value = { ...model.value, [key]: value }
}

const { t } = useI18n()
const { focusLearnTopic } = useInspectorTab()

const LABEL_OPTIONS: { value: CheckboxLabelAssociation, labelKey: string }[] = [
  { value: 'for-id', labelKey: 'controls.checkbox.labelForId' },
  { value: 'wrapping', labelKey: 'controls.checkbox.labelWrapping' },
  { value: 'aria-label', labelKey: 'controls.checkbox.labelAriaLabel' },
  { value: 'none', labelKey: 'controls.checkbox.labelNone' }
]

const GROUP_OPTIONS: { value: CheckboxGroupMode, labelKey: string }[] = [
  { value: 'single', labelKey: 'controls.checkbox.groupSingle' },
  { value: 'group-with-fieldset', labelKey: 'controls.checkbox.groupWithFieldset' },
  { value: 'group-no-fieldset', labelKey: 'controls.checkbox.groupNoFieldset' }
]

const labelAssociation = computed(() => model.value.labelAssociation ?? 'for-id')
const groupMode = computed(() => model.value.groupMode ?? 'single')
</script>

<template>
  <div class="flex flex-col gap-4">
    <ResetDefaultsSection v-model="model" />
    <USeparator />

    <!-- Label / accessible name -->
    <UFormField class="flex flex-col">
      <template #label>
        <a
          href="#topic-accessible-name"
          class="control-group-title control-label-link"
          @click.prevent="focusLearnTopic('accessible-name')"
        >
          {{ t('controls.checkbox.label') }}
          <UIcon name="i-lucide-arrow-up-right" class="control-label-link-icon" aria-hidden="true" />
        </a>
      </template>
      <UInput
        :model-value="model.label ?? ''"
        :placeholder="t('controls.checkbox.labelPlaceholder')"
        class="w-full"
        @update:model-value="update('label', String($event))"
      />
    </UFormField>

    <USeparator />

    <!-- Label-association pattern -->
    <fieldset class="flex flex-col gap-3 border-0 p-0 m-0">
      <legend class="control-group-title mb-1.5">
        <a
          href="#topic-checkbox"
          class="control-label-link"
          @click.prevent="focusLearnTopic('checkbox')"
        >
          {{ t('controls.checkbox.labelAssociation') }}
          <UIcon name="i-lucide-arrow-up-right" class="control-label-link-icon" aria-hidden="true" />
        </a>
      </legend>
      <UFieldGroup size="sm" orientation="vertical">
        <UButton
          v-for="opt in LABEL_OPTIONS"
          :key="opt.value"
          :color="labelAssociation === opt.value ? 'primary' : 'neutral'"
          :variant="labelAssociation === opt.value ? 'solid' : 'ghost'"
          @click="update('labelAssociation', opt.value)"
        >
          {{ t(opt.labelKey) }}
        </UButton>
      </UFieldGroup>
    </fieldset>

    <USeparator />

    <!-- Group rendering -->
    <fieldset class="flex flex-col gap-3 border-0 p-0 m-0">
      <legend class="control-group-title mb-1.5">
        <a
          href="#topic-checkbox"
          class="control-label-link"
          @click.prevent="focusLearnTopic('checkbox')"
        >
          {{ t('controls.checkbox.groupMode') }}
          <UIcon name="i-lucide-arrow-up-right" class="control-label-link-icon" aria-hidden="true" />
        </a>
      </legend>
      <UFieldGroup size="sm" orientation="vertical">
        <UButton
          v-for="opt in GROUP_OPTIONS"
          :key="opt.value"
          :color="groupMode === opt.value ? 'primary' : 'neutral'"
          :variant="groupMode === opt.value ? 'solid' : 'ghost'"
          @click="update('groupMode', opt.value)"
        >
          {{ t(opt.labelKey) }}
        </UButton>
      </UFieldGroup>
    </fieldset>

    <USeparator />

    <!-- State + validation -->
    <fieldset class="flex flex-col gap-2 border-0 p-0 m-0">
      <legend class="control-group-title mb-1.5">{{ t('controls.checkbox.state') }}</legend>

      <UFormField>
        <template #label>
          <span class="control-group-title">{{ t('controls.checkbox.checked') }}</span>
        </template>
        <USwitch
          :model-value="model.checked === true"
          size="sm"
          color="primary"
          @update:model-value="update('checked', $event === true)"
        />
      </UFormField>

      <UFormField>
        <template #label>
          <span class="control-group-title">{{ t('controls.checkbox.indeterminate') }}</span>
        </template>
        <USwitch
          :model-value="model.indeterminate === true"
          size="sm"
          color="primary"
          @update:model-value="update('indeterminate', $event === true)"
        />
      </UFormField>

      <UFormField>
        <template #label>
          <span class="control-group-title">{{ t('controls.checkbox.required') }}</span>
        </template>
        <USwitch
          :model-value="model.required === true"
          size="sm"
          color="primary"
          @update:model-value="update('required', $event === true)"
        />
      </UFormField>

      <UFormField>
        <template #label>
          <span class="control-group-title">{{ t('controls.checkbox.disabled') }}</span>
        </template>
        <USwitch
          :model-value="model.disabled === true"
          size="sm"
          color="primary"
          @update:model-value="update('disabled', $event === true)"
        />
      </UFormField>
    </fieldset>

    <USeparator />

    <!-- Form attributes -->
    <UFormField class="flex flex-col">
      <template #label>
        <span class="control-group-title">{{ t('controls.checkbox.name') }}</span>
      </template>
      <UInput
        :model-value="model.name ?? ''"
        :placeholder="t('controls.checkbox.namePlaceholder')"
        class="w-full"
        @update:model-value="update('name', String($event))"
      />
    </UFormField>

    <UFormField class="flex flex-col">
      <template #label>
        <span class="control-group-title">{{ t('controls.checkbox.value') }}</span>
      </template>
      <UInput
        :model-value="model.value ?? ''"
        :placeholder="t('controls.checkbox.valuePlaceholder')"
        class="w-full"
        @update:model-value="update('value', String($event))"
      />
    </UFormField>
  </div>
</template>
