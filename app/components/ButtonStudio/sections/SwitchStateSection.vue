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
const { update } = useButtonControlsModel(model);

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
        {{ t('controls.switchBehaviour') }}
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

    <UFormField
      v-if="behaviour !== 'none' && supportsPillStyling"
      class="flex flex-col mt-2"
    >
      <template #label>
        <span class="control-group-title">{{ t('controls.switchPillStyling') }}</span>
      </template>
      <USwitch
        :model-value="model.switchPillStyling !== false"
        size="sm"
        color="primary"
        @update:model-value="update('switchPillStyling', $event === true)"
      />
    </UFormField>

    <UFormField
      v-if="behaviour !== 'none'"
      class="flex flex-col mt-2"
    >
      <template #label>
        <span class="control-group-title">{{ t('controls.switchChecked') }}</span>
      </template>
      <USwitch
        :model-value="model.switchChecked === true"
        size="sm"
        color="primary"
        @update:model-value="update('switchChecked', $event === true)"
      />
    </UFormField>
  </fieldset>
</template>
