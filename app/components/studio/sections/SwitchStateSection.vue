<script setup lang="ts">
import type { BaseButtonProps } from "~/types/button";
import type { ButtonRenderAs, SwitchBehaviour } from "~/components/inspected/buttons/shared/types";
import ControlCardCheckbox from "~/components/controls/ControlCardCheckbox.vue";
import SectionLegend from "~/components/controls/SectionLegend.vue";

type SwitchProps = Partial<BaseButtonProps> & {
  renderAs?: ButtonRenderAs;
  switchBehaviour?: SwitchBehaviour;
  switchChecked?: boolean;
  switchPillStyling?: boolean;
};

const model = defineModel<SwitchProps>({ required: true });
const { update } = useModelUpdater(model);

const { t } = useI18n();

const behaviour = computed(() => model.value.switchBehaviour ?? "none");

const supportsPillStyling = computed(
  () => !(model.value.renderAs ?? "button").startsWith("input-"),
);

const OPTIONS: { value: SwitchBehaviour; labelKey: string }[] = [
  { value: "none", labelKey: "controls.switchBehaviourNone" },
  { value: "role-switch", labelKey: "controls.switchBehaviourRoleSwitch" },
  { value: "aria-pressed", labelKey: "controls.switchBehaviourAriaPressed" },
];
</script>

<template>
  <fieldset class="flex flex-col gap-3 border-0 p-0 m-0">
    <SectionLegend
      :label="t('controls.switchBehaviour')"
      learn-topic="switches"
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
        @click="update('switchBehaviour', opt.value)"
      >
        {{ t(opt.labelKey) }}
      </UButton>
    </UFieldGroup>

    <div
      v-if="behaviour !== 'none'"
      class="grid grid-cols-2 gap-3 mt-2"
    >
      <ControlCardCheckbox
        v-if="supportsPillStyling"
        :model-value="model.switchPillStyling !== false"
        :label="t('controls.switchPillStyling')"
        @update:model-value="update('switchPillStyling', $event)"
      />
      <ControlCardCheckbox
        :model-value="model.switchChecked === true"
        :label="t('controls.switchChecked')"
        @update:model-value="update('switchChecked', $event)"
      />
    </div>
  </fieldset>
</template>
