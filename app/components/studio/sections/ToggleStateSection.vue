<script setup lang="ts">
import type { BaseButtonProps } from "~/types/button";
import type { ToggleBehaviour } from "~/components/inspected/buttons/shared/types";
import ControlCardCheckbox from "~/components/controls/ControlCardCheckbox.vue";
import SectionLegend from "~/components/controls/SectionLegend.vue";

type ToggleProps = Partial<BaseButtonProps> & {
  toggleBehaviour?: ToggleBehaviour;
  togglePressed?: boolean;
};

const model = defineModel<ToggleProps>({ required: true });
const { update } = useModelUpdater(model);

const { t } = useI18n();
const { focusLearnTopic } = useInspectorTab();

const behaviour = computed(() => model.value.toggleBehaviour ?? "none");

const OPTIONS: { value: ToggleBehaviour; labelKey: string }[] = [
  { value: "none", labelKey: "controls.toggleBehaviourNone" },
  { value: "aria-pressed", labelKey: "controls.toggleBehaviourAriaPressed" },
  { value: "aria-checked", labelKey: "controls.toggleBehaviourAriaChecked" },
  { value: "visual-only", labelKey: "controls.toggleBehaviourVisualOnly" },
];
</script>

<template>
  <fieldset class="flex flex-col gap-3 border-0 p-0 m-0">
    <SectionLegend
      :label="t('controls.toggleBehaviour')"
      learn-topic="toggle-buttons"
    />

    <UFieldGroup
      size="sm"
      orientation="vertical"
    >
      <UButton
        v-for="opt in OPTIONS"
        :key="opt.value"
        :color="behaviour === opt.value ? 'primary' : 'neutral'"
        :variant="behaviour === opt.value ? 'solid' : 'ghost'"
        @click="update('toggleBehaviour', opt.value)"
      >
        {{ t(opt.labelKey) }}
      </UButton>
    </UFieldGroup>

    <div class="grid grid-cols-2 gap-3 mt-2">
      <ControlCardCheckbox
        :model-value="model.disabled === true"
        @update:model-value="update('disabled', $event)"
      >
        <template #label>
          <a
            href="#topic-button-disabled-states"
            class="control-label-link"
            @click.stop.prevent="focusLearnTopic('button-disabled-states')"
          >
            {{ t("controls.disabled") }}
          </a>
        </template>
      </ControlCardCheckbox>
      <ControlCardCheckbox
        :model-value="model.togglePressed === true"
        :label="t('controls.togglePressed')"
        @update:model-value="update('togglePressed', $event)"
      />
    </div>
  </fieldset>
</template>
