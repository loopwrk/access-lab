<script setup lang="ts">
import type { BaseButtonProps } from "~/types/button";
import type { ButtonStudioDefaults } from "~/composables/useButtonStudioDefaults";
import type { SpacingValue } from "~/components/controls/SplitSpacingControl.vue";
import {
  formatPxReadout,
  formatSideCss,
  formatSidesCssText,
  sidesUniform,
} from "~/utils/spacingSides";
import LengthControl from "~/components/controls/LengthControl.vue";
import OverrideRow from "~/components/controls/OverrideRow.vue";
import SpacingModeToggle from "~/components/controls/SpacingModeToggle.vue";
import SplitSpacingControl from "~/components/controls/SplitSpacingControl.vue";

const props = defineProps<{
  defaults: ButtonStudioDefaults;
  naturalSize: { width: number; height: number };
}>();
const model = defineModel<Partial<BaseButtonProps>>({ required: true });
const { update } = useModelUpdater(model);

const unitConv = useUnitConversion();
const { t } = useI18n();

// Derived from the model so rows also collapse when the keys are cleared
// from elsewhere (e.g. the reset-to-defaults control).
const widthCustomised = computed(() => model.value.width != null);
const heightCustomised = computed(() => model.value.height != null);

const defaultWidthPx = computed(() => props.naturalSize.width || props.defaults.width);
const defaultHeightPx = computed(() => props.naturalSize.height || props.defaults.height);

function customiseWidth() {
  update("width", unitConv.fromPx(defaultWidthPx.value, "px"));
}

function customiseHeight() {
  update("height", unitConv.fromPx(defaultHeightPx.value, "px"));
}

const paddingUniform = computed(() => sidesUniform(props.defaults.paddingSides));

const { enabled: paddingCustomised, toggle: togglePadding } = useToggleableSection(model, {
  keys: ["padding", "paddingTop", "paddingRight", "paddingBottom", "paddingLeft"],
  // Take-over lands in "All sides", so the seed is one linked value: the
  // probed top. For a browser's asymmetric default (Chrome's 1px 6px) this
  // tightens the box slightly at take-over; the fact line and its tooltip
  // still state the true four-value default.
  enable: () => {
    const length = unitConv.fromPx(props.defaults.paddingSides.top, "px");
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

const paddingIndependent = ref(false);

function customisePadding() {
  paddingIndependent.value = false;
  togglePadding(true);
}

const paddingDefaultValue = computed(() =>
  paddingUniform.value
    ? formatPxReadout(props.defaults.paddingSides.top)
    : formatSidesCssText(props.defaults.paddingSides),
);

const paddingDefaultDetail = computed(() => {
  if (paddingUniform.value) return undefined;
  const sides = props.defaults.paddingSides;
  return t("controls.override.sidesDetail", {
    top: formatSideCss(sides.top),
    right: formatSideCss(sides.right),
    bottom: formatSideCss(sides.bottom),
    left: formatSideCss(sides.left),
  });
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

useSpacingLinkCollapse(paddingIndependent, paddingCustomised, paddingValue);
</script>

<template>
  <div class="flex flex-col gap-3">
    <OverrideRow
      :label="t('controls.width')"
      :customised="widthCustomised"
      default-kind="auto"
      :default-value="formatPxReadout(defaultWidthPx)"
      @customise="customiseWidth"
      @use-default="update('width', undefined)"
    >
      <LengthControl
        :model-value="model.width"
        :fallback-px="defaultWidthPx"
        :min="16"
        :max="400"
        :step="10"
        @update:model-value="model.width = $event"
      />
    </OverrideRow>

    <OverrideRow
      :label="t('controls.height')"
      :customised="heightCustomised"
      default-kind="auto"
      :default-value="formatPxReadout(defaultHeightPx)"
      @customise="customiseHeight"
      @use-default="update('height', undefined)"
    >
      <LengthControl
        :model-value="model.height"
        :fallback-px="defaultHeightPx"
        :min="16"
        :max="400"
        :step="10"
        @update:model-value="model.height = $event"
      />
    </OverrideRow>

    <OverrideRow
      group
      :label="t('controls.padding')"
      :customised="paddingCustomised"
      default-kind="browserDefault"
      :default-value="paddingDefaultValue"
      :default-value-detail="paddingDefaultDetail"
      @customise="customisePadding"
      @use-default="togglePadding(false)"
    >
      <template #legend-extra>
        <SpacingModeToggle
          v-model="paddingIndependent"
          :label="t('controls.spacing.individualPadding')"
        />
      </template>
      <SplitSpacingControl
        v-model="paddingValue"
        v-model:independent="paddingIndependent"
        :fallback-px="defaults.padding"
        :min="0"
        :max="120"
        :step="2"
      />
    </OverrideRow>
  </div>
</template>
