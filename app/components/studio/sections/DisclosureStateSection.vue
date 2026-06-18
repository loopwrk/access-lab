<script setup lang="ts">
import type { BaseButtonProps } from "~/types/button";
import type { DisclosureBehaviour } from "~/components/inspected/buttons/shared/types";
import ControlCardCheckbox from "~/components/controls/ControlCardCheckbox.vue";
import SectionLegend from "~/components/controls/SectionLegend.vue";

type DisclosureProps = Partial<BaseButtonProps> & {
  disclosureBehaviour?: DisclosureBehaviour;
  disclosureExpanded?: boolean;
  disclosureShowControls?: boolean;
};

const model = defineModel<DisclosureProps>({ required: true });
const { update } = useModelUpdater(model);

const { t } = useI18n();

const behaviour = computed(() => model.value.disclosureBehaviour ?? "none");

const OPTIONS: { value: DisclosureBehaviour; labelKey: string }[] = [
  { value: "none", labelKey: "controls.disclosureBehaviourNone" },
  { value: "aria-expanded", labelKey: "controls.disclosureBehaviourAriaExpanded" },
  { value: "out-of-sync", labelKey: "controls.disclosureBehaviourOutOfSync" },
];
</script>

<template>
  <fieldset class="flex flex-col gap-3 border-0 p-0 m-0">
    <SectionLegend
      :label="t('controls.disclosureBehaviour')"
      learn-topic="disclosure-triggers"
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
        @click="update('disclosureBehaviour', opt.value)"
      >
        {{ t(opt.labelKey) }}
      </UButton>
    </UFieldGroup>

    <ControlCardCheckbox
      v-if="behaviour !== 'none'"
      :model-value="model.disclosureShowControls === true"
      :label="t('controls.disclosureShowControls')"
      class="mt-2"
      @update:model-value="update('disclosureShowControls', $event)"
    />
  </fieldset>
</template>
