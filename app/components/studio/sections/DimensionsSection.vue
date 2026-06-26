<script setup lang="ts">
import type { BaseButtonProps } from "~/types/button";
import type { ButtonStudioDefaults } from "~/composables/useButtonStudioDefaults";
import type { SpacingValue } from "~/components/controls/SplitSpacingControl.vue";
import LengthControl from "~/components/controls/LengthControl.vue";
import SplitSpacingControl from "~/components/controls/SplitSpacingControl.vue";

const props = defineProps<{
  defaults: ButtonStudioDefaults;
  naturalSize: { width: number; height: number };
}>();
const model = defineModel<Partial<BaseButtonProps>>({ required: true });
const { update } = useModelUpdater(model);

const unitConv = useUnitConversion();
const { t } = useI18n();

// Derived so the switches flip off when the model is cleared from
// elsewhere (e.g. the reset-to-defaults control).
const widthEnabled = computed(() => model.value.width != null);
const heightEnabled = computed(() => model.value.height != null);

function toggleWidth(value: boolean | "indeterminate") {
  update(
    "width",
    value === true
      ? unitConv.fromPx(props.naturalSize.width || props.defaults.width, "px")
      : undefined,
  );
}

function toggleHeight(value: boolean | "indeterminate") {
  update(
    "height",
    value === true
      ? unitConv.fromPx(props.naturalSize.height || props.defaults.height, "px")
      : undefined,
  );
}

const { enabled: paddingEnabled, toggle: togglePadding } = useToggleableSection(model, {
  keys: ["padding", "paddingTop", "paddingRight", "paddingBottom", "paddingLeft"],
  enable: () => {
    const length = unitConv.fromPx(props.defaults.padding, "px");
    return {
      padding: length,
      paddingTop: length,
      paddingRight: length,
      paddingBottom: length,
      paddingLeft: length,
    };
  },
  disable: () => ({
    padding: undefined,
    paddingTop: undefined,
    paddingRight: undefined,
    paddingBottom: undefined,
    paddingLeft: undefined,
  }),
});

const paddingValue = computed<SpacingValue>({
  get: () => ({
    shorthand: model.value.padding,
    top: model.value.paddingTop,
    right: model.value.paddingRight,
    bottom: model.value.paddingBottom,
    left: model.value.paddingLeft,
  }),
  set: (next) => {
    model.value.padding = next.shorthand;
    model.value.paddingTop = next.top;
    model.value.paddingRight = next.right;
    model.value.paddingBottom = next.bottom;
    model.value.paddingLeft = next.left;
  },
});
</script>

<template>
  <div class="flex flex-col gap-3">
    <div>
      <div class="flex items-center justify-between mb-2">
        <span class="control-group-title font-medium text-(--text-secondary)">{{
          t("controls.width")
        }}</span>
        <USwitch
          :model-value="widthEnabled"
          size="xs"
          color="primary"
          :aria-label="t('controls.width')"
          @update:model-value="toggleWidth"
        />
      </div>
      <div :class="widthEnabled ? '' : 'opacity-50'">
        <LengthControl
          :model-value="model.width"
          :fallback-px="naturalSize.width || defaults.width"
          :min="16"
          :max="400"
          :step="10"
          :disabled="!widthEnabled"
          @update:model-value="model.width = $event"
        />
      </div>
    </div>

    <div>
      <div class="flex items-center justify-between mb-2">
        <span class="control-group-title font-medium text-(--text-secondary)">{{
          t("controls.height")
        }}</span>
        <USwitch
          :model-value="heightEnabled"
          size="xs"
          color="primary"
          :aria-label="t('controls.height')"
          @update:model-value="toggleHeight"
        />
      </div>
      <div :class="heightEnabled ? '' : 'opacity-50'">
        <LengthControl
          :model-value="model.height"
          :fallback-px="naturalSize.height || defaults.height"
          :min="16"
          :max="400"
          :step="10"
          :disabled="!heightEnabled"
          @update:model-value="model.height = $event"
        />
      </div>
    </div>

    <fieldset class="flex flex-col gap-3 border-0 p-0 m-0">
      <legend class="flex items-center justify-between w-full mb-1.5">
        <span class="control-group-title">{{ t("controls.padding") }}</span>
        <USwitch
          :model-value="paddingEnabled"
          size="xs"
          color="primary"
          :aria-label="t('controls.padding')"
          @update:model-value="togglePadding"
        />
      </legend>
      <SplitSpacingControl
        v-model="paddingValue"
        :fallback-px="defaults.padding"
        :min="0"
        :max="120"
        :step="2"
        :disabled="!paddingEnabled"
      />
    </fieldset>
  </div>
</template>
