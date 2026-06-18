<script setup lang="ts">
import type { BaseButtonProps } from "~/types/button";
import ControlCardCheckbox from "~/components/controls/ControlCardCheckbox.vue";
import SectionLegend from "~/components/controls/SectionLegend.vue";
import LearnLink from "~/components/controls/LearnLink.vue";

defineProps<{ hideDisabled?: boolean }>();

const model = defineModel<Partial<BaseButtonProps>>({ required: true });
const { update } = useModelUpdater(model);

const { t } = useI18n();
</script>

<template>
  <fieldset class="flex flex-col gap-3 border-0 p-0 m-0">
    <SectionLegend :label="t('controls.aria')" />

    <UFormField class="flex flex-col mb-4">
      <template #label>
        <LearnLink
          class="control-group-title"
          topic="accessible-name"
          :label="t('controls.ariaLabel')"
        />
      </template>
      <UInput
        :model-value="model.ariaLabel ?? ''"
        :placeholder="t('controls.ariaLabelPlaceholder')"
        class="w-full"
        @update:model-value="update('ariaLabel', String($event))"
      />
    </UFormField>

    <ControlCardCheckbox
      v-if="!hideDisabled"
      :model-value="model.disabled === true"
      :label="t('controls.disabled')"
      @update:model-value="update('disabled', $event)"
    />
  </fieldset>
</template>
