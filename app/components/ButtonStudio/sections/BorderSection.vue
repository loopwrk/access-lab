<script setup lang="ts">
import type { BaseButtonProps } from "~/types/button";
import type { ButtonStudioDefaults } from "~/composables/useButtonStudioDefaults";
import type { SpacingValue } from "~/components/controls/SplitSpacingControl.vue";
import SplitSpacingControl from "~/components/controls/SplitSpacingControl.vue";

const props = defineProps<{ defaults: ButtonStudioDefaults }>();
const model = defineModel<Partial<BaseButtonProps>>({ required: true });

const unitConv = useUnitConversion();
const { t } = useI18n();

const { enabled, toggle } = useToggleableSection(model, {
  // Border WIDTH only. `borderColor` is owned by ColoursSection (its control
  // lives there). Listing it here too made toggling either section flip the
  // other on, because both seed/clear the same key and a section reads as
  // "enabled" when any of its keys is non-null.
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
</script>

<template>
  <fieldset class="flex flex-col gap-3 border-0 p-0 m-0">
    <legend class="flex items-center justify-between w-full mb-1.5">
      <span class="control-group-title">{{ t('controls.borderWidth') }}</span>
      <USwitch
        :model-value="enabled"
        size="xs"
        color="primary"
        @update:model-value="toggle"
      />
    </legend>
    <SplitSpacingControl
      v-model="borderWidthValue"
      :fallback-px="defaults.borderWidth"
      :min="0"
      :max="20"
      :step="1"
      :disabled="!enabled"
    />
  </fieldset>
</template>
