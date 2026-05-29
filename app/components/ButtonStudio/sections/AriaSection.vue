<script setup lang="ts">
import type { BaseButtonProps } from '~/types/button'

const model = defineModel<Partial<BaseButtonProps>>({ required: true })
const { update } = useButtonControlsModel(model)

const { t } = useI18n()
const { focusLearnTopic } = useInspectorTab()
</script>

<template>
  <fieldset class="flex flex-col gap-3 border-0 p-0 m-0">
    <legend class="control-group-title mb-1.5">
      {{ t('controls.aria') }}
    </legend>

    <UFormField class="flex flex-col mb-4">
      <template #label>
        <a
          href="#topic-accessible-name"
          class="control-group-title control-label-link"
          @click.prevent="focusLearnTopic('accessible-name')"
        >
          {{ t('controls.ariaLabel') }}
          <UIcon
            name="i-lucide-arrow-up-right"
            class="control-label-link-icon"
            aria-hidden="true"
          />
        </a>
      </template>
      <UInput
        :model-value="model.ariaLabel ?? ''"
        :placeholder="t('controls.ariaLabelPlaceholder')"
        class="w-full"
        @update:model-value="update('ariaLabel', String($event))"
      />
    </UFormField>

    <UFormField class="flex flex-col">
      <template #label>
        <a
          href="#topic-button-disabled-states"
          class="control-group-title control-label-link"
          @click.prevent="focusLearnTopic('button-disabled-states')"
        >
          {{ t('controls.disabled') }}
          <UIcon
            name="i-lucide-arrow-up-right"
            class="control-label-link-icon"
            aria-hidden="true"
          />
        </a>
      </template>
      <USwitch
        :model-value="model.disabled === true"
        size="sm"
        color="primary"
        @update:model-value="update('disabled', $event === true)"
      />
    </UFormField>
  </fieldset>
</template>
