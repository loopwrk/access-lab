<script setup lang="ts">
import type { BaseButtonProps } from "~/types/button";
import type { MenuBehaviour } from "~/components/inspected/buttons/shared/types";
import ControlCardCheckbox from "~/components/controls/ControlCardCheckbox.vue";
import SectionLegend from "~/components/controls/SectionLegend.vue";

type MenuProps = Partial<BaseButtonProps> & {
  menuBehaviour?: MenuBehaviour;
  menuOpen?: boolean;
  menuShowControls?: boolean;
};

const model = defineModel<MenuProps>({ required: true });
const { update } = useModelUpdater(model);

const { t } = useI18n();

const behaviour = computed(() => model.value.menuBehaviour ?? "none");

const OPTIONS: { value: MenuBehaviour; labelKey: string }[] = [
  { value: "none", labelKey: "controls.menuBehaviourNone" },
  { value: "aria-expanded-haspopup", labelKey: "controls.menuBehaviourBoth" },
  { value: "haspopup-only", labelKey: "controls.menuBehaviourHasPopupOnly" },
  { value: "expanded-only", labelKey: "controls.menuBehaviourExpandedOnly" },
];
</script>

<template>
  <fieldset class="flex flex-col gap-3 border-0 p-0 m-0">
    <SectionLegend
      :label="t('controls.menuBehaviour')"
      learn-topic="menu-triggers"
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
        @click="update('menuBehaviour', opt.value)"
      >
        {{ t(opt.labelKey) }}
      </UButton>
    </UFieldGroup>

    <ControlCardCheckbox
      v-if="behaviour !== 'none'"
      :model-value="model.menuShowControls === true"
      :label="t('controls.menuShowControls')"
      class="mt-2"
      @update:model-value="update('menuShowControls', $event)"
    />
  </fieldset>
</template>
