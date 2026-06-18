<script setup lang="ts">
import type { BaseButtonProps } from "~/types/button";
import type { ToggleBehaviour } from "~/components/inspected/buttons/shared/types";

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
    <legend class="control-group-title mb-1.5">
      <a
        href="#topic-toggle-buttons"
        class="control-label-link"
        @click.prevent="focusLearnTopic('toggle-buttons')"
      >
        {{ t("controls.toggleBehaviour") }}
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
        @click="update('toggleBehaviour', opt.value)"
      >
        {{ t(opt.labelKey) }}
      </UButton>
    </UFieldGroup>

    <div class="grid grid-cols-2 gap-3 mt-2">
      <UCheckbox
        :model-value="model.disabled === true"
        variant="card"
        color="primary"
        size="md"
        :ui="CONTROL_CARD_UI"
        @update:model-value="update('disabled', $event === true)"
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
      </UCheckbox>
      <UCheckbox
        :model-value="model.togglePressed === true"
        :label="t('controls.togglePressed')"
        variant="card"
        color="primary"
        size="md"
        :ui="CONTROL_CARD_UI"
        @update:model-value="update('togglePressed', $event === true)"
      />
    </div>
  </fieldset>
</template>
