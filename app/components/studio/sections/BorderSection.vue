<script setup lang="ts">
import type { BaseButtonProps } from "~/types/button";
import type { ButtonStudioDefaults } from "~/composables/useButtonStudioDefaults";
import type { SpacingValue } from "~/components/controls/SplitSpacingControl.vue";
import { formatPxReadout } from "~/utils/spacingSides";
import OverrideRow from "~/components/controls/OverrideRow.vue";
import SpacingModeToggle from "~/components/controls/SpacingModeToggle.vue";
import SplitSpacingControl from "~/components/controls/SplitSpacingControl.vue";

const props = defineProps<{ defaults: ButtonStudioDefaults }>();
const model = defineModel<Partial<BaseButtonProps>>({ required: true });

const unitConv = useUnitConversion();
const { t } = useI18n();

const { enabled: customised, toggle } = useToggleableSection(model, {
  // Border WIDTH only. `borderColor` is owned by ColoursSection (its control
  // lives there). Listing it here too made toggling either section flip the
  // other on, because both seed/clear the same key and a section reads as
  // "customised" when any of its keys is non-null.
  keys: [
    "borderWidth",
    "borderTopWidth",
    "borderRightWidth",
    "borderBottomWidth",
    "borderLeftWidth",
  ],
  enable: () => {
    const length = unitConv.fromPx(props.defaults.borderWidth, "px");
    return {
      borderWidth: length,
      borderTopWidth: length,
      borderRightWidth: length,
      borderBottomWidth: length,
      borderLeftWidth: length,
    };
  },
  disable: () => ({
    borderWidth: undefined,
    borderTopWidth: undefined,
    borderRightWidth: undefined,
    borderBottomWidth: undefined,
    borderLeftWidth: undefined,
  }),
});

const borderIndependent = ref(false);

// The UA default border is uniform, so take-over always starts Linked.
function customise() {
  borderIndependent.value = false;
  toggle(true);
}

const borderWidthValue = computed<SpacingValue>({
  get: () => ({
    shorthand: model.value.borderWidth,
    top: model.value.borderTopWidth,
    right: model.value.borderRightWidth,
    bottom: model.value.borderBottomWidth,
    left: model.value.borderLeftWidth,
  }),
  set: (next) => {
    model.value.borderWidth = next.shorthand;
    model.value.borderTopWidth = next.top;
    model.value.borderRightWidth = next.right;
    model.value.borderBottomWidth = next.bottom;
    model.value.borderLeftWidth = next.left;
  },
});

useSpacingLinkCollapse(borderIndependent, customised, borderWidthValue);
</script>

<template>
  <OverrideRow
    group
    :label="t('controls.borderWidth')"
    :customised="customised"
    default-kind="browserDefault"
    :default-value="formatPxReadout(defaults.borderWidth)"
    @customise="customise"
    @use-default="toggle(false)"
  >
    <template #legend-extra>
      <SpacingModeToggle
        v-model="borderIndependent"
        :label="t('controls.spacing.individualBorderWidth')"
      />
    </template>
    <SplitSpacingControl
      v-model="borderWidthValue"
      v-model:independent="borderIndependent"
      :fallback-px="defaults.borderWidth"
      :min="0"
      :max="20"
      :step="1"
    />
  </OverrideRow>
</template>
