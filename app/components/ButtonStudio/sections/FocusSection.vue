<script setup lang="ts">
import type { BaseButtonProps } from "~/types/button";
import type { CssLength, CssUnit } from "~/composables/useUnitConversion";
import LengthControl from "~/components/controls/LengthControl.vue";

const model = defineModel<Partial<BaseButtonProps>>({ required: true });
const { update } = useButtonControlsModel(model);

const { t } = useI18n();

const FOCUS_DEFAULTS = {
  width: { value: 2, unit: "px" as CssUnit } satisfies CssLength,
  offset: { value: 2, unit: "px" as CssUnit } satisfies CssLength,
  color: "#1d4ed8",
};

const enabled = computed(() => model.value.focusRingEnabled === true);

function toggleFocus(value: boolean | "indeterminate") {
  const on = value === true;
  if (!on) {
    update("focusRingEnabled", false);
    return;
  }
  Object.assign(model.value, {
    focusRingEnabled: true,
    focusRingWidth: model.value.focusRingWidth ?? FOCUS_DEFAULTS.width,
    focusRingOffset: model.value.focusRingOffset ?? FOCUS_DEFAULTS.offset,
    focusRingColor: model.value.focusRingColor ?? FOCUS_DEFAULTS.color,
  });
}

const focusRingColor = computed({
  get: () => model.value.focusRingColor ?? FOCUS_DEFAULTS.color,
  set: (value: string) => update("focusRingColor", value),
});
</script>

<template>
  <fieldset class="flex flex-col gap-3 border-0 p-0 m-0">
    <legend class="flex items-center justify-between w-full mb-1.5">
      <span class="control-group-title">{{ t('controls.focus') }}</span>
      <USwitch
        :model-value="enabled"
        size="xs"
        color="primary"
        @update:model-value="toggleFocus"
      />
    </legend>

    <div
      :class="enabled ? '' : 'opacity-50'"
      class="flex flex-col gap-3"
    >
      <div>
        <div class="flex items-center justify-between mb-1.5">
          <span class="control-group-title font-medium text-(--text-secondary)">{{ t('controls.focusWidth') }}</span>
        </div>
        <LengthControl
          :model-value="model.focusRingWidth"
          :fallback-px="FOCUS_DEFAULTS.width.value"
          :min="0"
          :max="8"
          :step="1"
          :disabled="!enabled"
          @update:model-value="model.focusRingWidth = $event"
        />
      </div>

      <div>
        <div class="flex items-center justify-between mb-1.5">
          <span class="control-group-title font-medium text-(--text-secondary)">{{ t('controls.focusOffset') }}</span>
        </div>
        <LengthControl
          :model-value="model.focusRingOffset"
          :fallback-px="FOCUS_DEFAULTS.offset.value"
          :min="0"
          :max="12"
          :step="1"
          :disabled="!enabled"
          @update:model-value="model.focusRingOffset = $event"
        />
      </div>

      <ColorPicker
        v-slot="{ show }"
        v-model="focusRingColor"
        with-alpha
        with-initial-color
        with-eye-dropper
        with-hex-input
        with-rgb-input
      >
        <div class="flex items-center justify-between gap-3">
          <button
            type="button"
            class="color-swatch"
            :disabled="!enabled"
            @click="show"
          >
            <div
              class="color-swatch-inner"
              :style="{ backgroundColor: focusRingColor }"
            />
          </button>
          <div class="flex flex-col flex-1 min-w-0">
            <span class="color-label-title">{{ t('controls.focusColor') }}</span>
            <span class="color-label-hex">{{ focusRingColor }}</span>
          </div>
          <UInput
            :model-value="focusRingColor"
            size="sm"
            :disabled="!enabled"
            class="w-24 shrink-0"
            @update:model-value="update('focusRingColor', String($event))"
          />
        </div>
      </ColorPicker>
    </div>
  </fieldset>
</template>
