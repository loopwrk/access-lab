<script setup lang="ts">
import type { BaseButtonProps } from "~/types/button";

defineProps<{ hideDisabled?: boolean }>();

const model = defineModel<Partial<BaseButtonProps>>({ required: true });
const { update } = useModelUpdater(model);

const { t } = useI18n();
const { focusLearnTopic } = useInspectorTab();
</script>

<template>
  <fieldset class="flex flex-col gap-3 border-0 p-0 m-0">
    <legend class="control-group-title mb-1.5">
      {{ t("controls.aria") }}
    </legend>

    <UFormField class="flex flex-col mb-4">
      <template #label>
        <a
          href="#topic-accessible-name"
          class="control-group-title control-label-link"
          @click.prevent="focusLearnTopic('accessible-name')"
        >
          {{ t("controls.ariaLabel") }}
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

    <UCheckbox
      v-if="!hideDisabled"
      :model-value="model.disabled === true"
      variant="card"
      color="primary"
      size="md"
      :ui="CONTROL_CARD_UI"
      @update:model-value="update('disabled', $event === true)"
    >
      <template #label>
        {{ t("controls.disabled") }}
      </template>
    </UCheckbox>
  </fieldset>
</template>
