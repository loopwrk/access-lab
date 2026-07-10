<script setup lang="ts">
import type { BaseButtonProps } from "~/types/button";
import type { ButtonStudioDefaults } from "~/composables/useButtonStudioDefaults";
import { formatPxReadout } from "~/utils/spacingSides";
import LengthControl from "~/components/controls/LengthControl.vue";
import OverrideRow from "~/components/controls/OverrideRow.vue";

const props = defineProps<{ defaults: ButtonStudioDefaults }>();
const model = defineModel<Partial<BaseButtonProps>>({ required: true });

const unitConv = useUnitConversion();
const { t } = useI18n();

const { enabled: customised, toggle } = useToggleableSection(model, {
  keys: ["fontSize"],
  // Seeds in rem deliberately: the font-size control is the rem-units
  // teaching moment, so take-over starts in the unit the lesson is about.
  enable: () => ({ fontSize: unitConv.fromPx(props.defaults.fontSize, "rem") }),
  disable: () => ({ fontSize: undefined }),
});
</script>

<template>
  <OverrideRow
    :label="t('controls.fontSize')"
    :customised="customised"
    default-kind="browserDefault"
    :default-value="formatPxReadout(defaults.fontSize)"
    @customise="toggle(true)"
    @use-default="toggle(false)"
  >
    <LengthControl
      :model-value="model.fontSize"
      :fallback-px="defaults.fontSize"
      :min="8"
      :max="128"
      :step="2"
      @update:model-value="model.fontSize = $event"
    />
  </OverrideRow>
</template>
