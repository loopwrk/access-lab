<script setup lang="ts">
import type { BaseButtonProps } from "~/types/button";
import type { ButtonRenderAs, SwitchBehaviour } from "~/components/inspected/buttons/shared/types";

type SwitchProps = Partial<BaseButtonProps> & {
  renderAs?: ButtonRenderAs;
  switchBehaviour?: SwitchBehaviour;
  switchChecked?: boolean;
  switchPillStyling?: boolean;
};

const model = defineModel<SwitchProps>({ required: true });
const { update } = useModelUpdater(model);

const { t } = useI18n();
const { focusLearnTopic } = useInspectorTab();

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
    <legend class="control-group-title mb-1.5">
      <a
        href="#topic-switches"
        class="control-label-link"
        @click.prevent="focusLearnTopic('switches')"
      >
        {{ t("controls.switchBehaviour") }}
        <UIcon
          name="i-lucide-arrow-up-right"
          class="control-label-link-icon"
          aria-hidden="true"
        />
      </a>
    </legend>

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
      <UCheckbox
        v-if="supportsPillStyling"
        :model-value="model.switchPillStyling !== false"
        :label="t('controls.switchPillStyling')"
        variant="card"
        color="primary"
        size="md"
        :ui="CONTROL_CARD_UI"
        @update:model-value="update('switchPillStyling', $event === true)"
      />
      <UCheckbox
        :model-value="model.switchChecked === true"
        :label="t('controls.switchChecked')"
        variant="card"
        color="primary"
        size="md"
        :ui="CONTROL_CARD_UI"
        @update:model-value="update('switchChecked', $event === true)"
      />
    </div>
  </fieldset>
</template>
