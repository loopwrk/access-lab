<script setup lang="ts">
import type { InputProps } from "./definition";
import { useInputStyleTarget } from "./useInputStyleTarget";
import StyleTargetPicker from "~/components/controls/StyleTargetPicker.vue";
import ColorPickerRow from "~/components/controls/ColorPickerRow.vue";
import LengthControl from "~/components/controls/LengthControl.vue";

const model = defineModel<Partial<InputProps>>({ required: true });
const { t } = useI18n();

const {
  activeStyleTarget,
  isInputTarget,
  fontSizeDefaultPx,
  activeFontSize,
  fontSizeEnabled,
  toggleFontSize,
  activeFgText,
  activeFgTextEnabled,
  toggleActiveFgText,
  bgColor,
  borderColor,
  inputBgEnabled,
  toggleInputBg,
  contrastRatio,
  contrastVerdict,
} = useInputStyleTarget(model);

const styleTargetOptions = computed(() => [
  { value: "label", label: t("controls.input.styleTarget.label") },
  { value: "input", label: t("controls.input.styleTarget.input") },
  { value: "placeholder", label: t("controls.input.styleTarget.placeholder") },
  { value: "helpText", label: t("controls.input.styleTarget.helpText") },
]);
</script>

<template>
  <div class="flex flex-col gap-4">
    <StyleTargetPicker
      v-model="activeStyleTarget"
      :options="styleTargetOptions"
      :legend="t('controls.input.styleAppliesTo')"
    />

    <USeparator />

    <!-- Font size (active target) -->
    <fieldset class="flex flex-col gap-3 border-0 p-0 m-0">
      <div class="flex items-center justify-between mb-1.5">
        <span class="control-group-title font-medium text-(--text-secondary)">
          {{ t("controls.fontSize") }}
        </span>
        <USwitch
          :model-value="fontSizeEnabled"
          size="xs"
          color="primary"
          :aria-label="t('controls.fontSize')"
          @update:model-value="toggleFontSize"
        />
      </div>
      <div :class="fontSizeEnabled ? '' : 'opacity-50'">
        <LengthControl
          :model-value="activeFontSize"
          :fallback-px="fontSizeDefaultPx"
          :min="8"
          :max="128"
          :step="2"
          :disabled="!fontSizeEnabled"
          @update:model-value="activeFontSize = $event"
        />
      </div>
    </fieldset>

    <USeparator />

    <!-- Text colour (active target) -->
    <fieldset class="flex flex-col gap-3 border-0 p-0 m-0">
      <legend class="flex items-center justify-between w-full mb-1.5">
        <span class="control-group-title">{{ t("controls.textColor") }}</span>
        <USwitch
          :model-value="activeFgTextEnabled"
          size="xs"
          color="primary"
          :aria-label="t('controls.textColor')"
          @update:model-value="toggleActiveFgText"
        />
      </legend>
      <div :class="activeFgTextEnabled ? '' : 'opacity-50 pointer-events-none'">
        <ColorPickerRow
          v-model="activeFgText"
          :label="t('controls.textColor')"
          :disabled="!activeFgTextEnabled"
        />
      </div>
    </fieldset>

    <!-- Background + border (input target only) -->
    <template v-if="isInputTarget">
      <USeparator />
      <fieldset class="flex flex-col gap-3 border-0 p-0 m-0">
        <legend class="flex items-center justify-between w-full mb-1.5">
          <span class="control-group-title">{{ t("controls.input.background") }}</span>
          <USwitch
            :model-value="inputBgEnabled"
            size="xs"
            color="primary"
            :aria-label="t('controls.input.background')"
            @update:model-value="toggleInputBg"
          />
        </legend>
        <div
          :class="inputBgEnabled ? '' : 'opacity-50 pointer-events-none'"
          class="flex flex-col gap-3"
        >
          <ColorPickerRow
            v-model="bgColor"
            :label="t('controls.background')"
            :disabled="!inputBgEnabled"
          />
          <ContrastBadge
            :ratio="contrastRatio"
            :verdict="contrastVerdict"
          />
          <ColorPickerRow
            v-model="borderColor"
            :label="t('controls.borderColor')"
            :disabled="!inputBgEnabled"
          />
        </div>
      </fieldset>
    </template>
  </div>
</template>
