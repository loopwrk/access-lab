<script setup lang="ts">
import type { InputProps } from "./definition";
import { useUnitConversion } from "~/composables/useUnitConversion";
import type { CssUnit, CssLength } from "~/composables/useUnitConversion";
import ResetDefaultsSection from "~/components/ButtonStudio/sections/ResetDefaultsSection.vue";
import ColorPickerRow from "~/components/controls/ColorPickerRow.vue";

const model = defineModel<Partial<InputProps>>({ required: true });
const { update } = useButtonControlsModel(model);

const { t } = useI18n();
const unitConv = useUnitConversion();
const { focusLearnTopic } = useInspectorTab();

const fontSizeEnabled = computed(() => model.value.fontSize != null);
const colorsEnabled = computed(() =>
  model.value.bg != null
  || model.value.fgText != null
  || model.value.borderColor != null,
);

const DEFAULTS = {
  fontSize: 14,
  bg: "#FFFFFF",
  fgText: "#000000",
  borderColor: "#888888",
} as const;

const bgColor = computed({
  get: () => model.value.bg ?? DEFAULTS.bg,
  set: (value: string) => update("bg", value),
});

const fgTextColor = computed({
  get: () => model.value.fgText ?? DEFAULTS.fgText,
  set: (value: string) => update("fgText", value),
});

const borderColorComputed = computed({
  get: () => model.value.borderColor ?? DEFAULTS.borderColor,
  set: (value: string) => update("borderColor", value),
});

const { ratio: contrastRatio, verdict: contrastVerdict } = useContrast(
  fgTextColor,
  bgColor,
  {
    fontSizePx: () => {
      const f = model.value.fontSize;
      if (!f) return DEFAULTS.fontSize;
      return unitConv.lengthToPx(f);
    },
    bold: false,
  },
);

function toggleFontSize(value: boolean | "indeterminate") {
  if (value === true) {
    update("fontSize", unitConv.fromPx(DEFAULTS.fontSize, "rem"));
  } else {
    update("fontSize", undefined);
  }
}

function toggleColors(value: boolean | "indeterminate") {
  if (value === true) {
    model.value = {
      ...model.value,
      bg: DEFAULTS.bg,
      fgText: DEFAULTS.fgText,
      borderColor: DEFAULTS.borderColor,
    };
  } else {
    const next = { ...model.value };
    delete next.bg;
    delete next.fgText;
    delete next.borderColor;
    model.value = next;
  }
}

const typeOptions = [
  { value: "text", label: "text" },
  { value: "email", label: "email" },
  { value: "tel", label: "tel" },
  { value: "url", label: "url" },
  { value: "password", label: "password" },
  { value: "number", label: "number" },
  { value: "search", label: "search" },
];

function pxOrFallback(length: CssLength | undefined, fallbackPx: number): number {
  return length ? unitConv.lengthToPx(length) : fallbackPx;
}

function unitFor(length: CssLength | undefined): CssUnit {
  return length?.unit ?? "px";
}

function lengthOrFallback(length: CssLength | undefined, fallbackPx: number): CssLength {
  return length ?? { value: fallbackPx, unit: "px" };
}

const showLabel = computed({
  get: () => model.value.showLabel !== false,
  set: (value: boolean) => update("showLabel", value),
});

const required = computed({
  get: () => model.value.required === true,
  set: (value: boolean) => update("required", value),
});
</script>

<template>
  <div class="flex flex-col gap-4">
    <ResetDefaultsSection v-model="model" />
    <USeparator />

    <UFormField class="flex flex-col">
      <template #label>
        <a
          href="#topic-vague-label"
          class="control-group-title inline-flex items-center gap-1 text-(--text-primary) no-underline cursor-pointer hover:text-(--brand) hover:underline hover:underline-offset-2 focus-visible:text-(--brand) focus-visible:underline focus-visible:underline-offset-2 focus-visible:outline-[3px] focus-visible:outline-(--focus-ring) focus-visible:outline-offset-2 focus-visible:rounded-[2px]"
          @click.prevent="focusLearnTopic('vague-label')"
        >
          {{ t('controls.input.label') }}
          <UIcon
            name="i-lucide-arrow-up-right"
            class="text-(length:--al-font-size-detail) opacity-70"
            aria-hidden="true"
          />
        </a>
      </template>
      <UInput
        :model-value="model.label ?? ''"
        :placeholder="t('controls.input.labelPlaceholder')"
        class="w-full"
        @update:model-value="update('label', $event)"
      />
    </UFormField>

    <USeparator />

    <fieldset class="flex flex-col gap-2 border-0 p-0 m-0">
      <legend class="flex items-center justify-between w-full">
        <span class="control-group-title">{{ t('controls.input.showLabel') }}</span>
        <USwitch
          v-model="showLabel"
          size="xs"
          color="primary"
        />
      </legend>
      <UFormField
        v-if="!showLabel"
        class="flex flex-col"
      >
        <template #label>
          <span class="control-group-title">{{ t('controls.input.ariaLabel') }}</span>
        </template>
        <UInput
          :model-value="model.ariaLabel ?? ''"
          :placeholder="t('controls.input.ariaLabelPlaceholder')"
          class="w-full"
          @update:model-value="update('ariaLabel', $event)"
        />
      </UFormField>
    </fieldset>

    <USeparator />
    <UFormField class="flex flex-col">
      <template #label>
        <span class="control-group-title">{{ t('controls.input.placeholder') }}</span>
      </template>
      <UInput
        :model-value="model.placeholder ?? ''"
        :placeholder="t('controls.input.placeholderHint')"
        class="w-full"
        @update:model-value="update('placeholder', $event)"
      />
    </UFormField>

    <USeparator />
    <UFormField class="flex flex-col">
      <template #label>
        <span class="control-group-title">{{ t('controls.input.type') }}</span>
      </template>
      <USelect
        :model-value="model.type ?? 'email'"
        :items="typeOptions"
        size="sm"
        class="w-full"
        @update:model-value="update('type', $event as InputProps['type'])"
      />
    </UFormField>

    <USeparator />
    <fieldset class="flex flex-col gap-2 border-0 p-0 m-0">
      <legend class="flex items-center justify-between w-full">
        <span class="control-group-title">{{ t('controls.input.required') }}</span>
        <USwitch
          v-model="required"
          size="xs"
          color="primary"
        />
      </legend>
    </fieldset>

    <USeparator />

    <UFormField class="flex flex-col">
      <template #label>
        <span class="control-group-title">{{ t('controls.input.helpText') }}</span>
      </template>
      <UInput
        :model-value="model.helpText ?? ''"
        :placeholder="t('controls.input.helpTextPlaceholder')"
        class="w-full"
        @update:model-value="update('helpText', $event)"
      />
    </UFormField>

    <USeparator />

    <!-- TEXT -->
    <fieldset class="flex flex-col gap-3 border-0 p-0 m-0">
      <div>
        <div class="flex items-center justify-between mb-1.5">
          <span class="control-group-title font-medium text-(--text-secondary)">{{ t('controls.fontSize') }}</span>
          <USwitch
            :model-value="fontSizeEnabled"
            size="xs"
            color="primary"
            @update:model-value="toggleFontSize"
          />
        </div>
        <div
          :class="[fontSizeEnabled ? '' : 'opacity-50']"
          class="flex items-center gap-3"
        >
          <USlider
            :model-value="pxOrFallback(model.fontSize, DEFAULTS.fontSize)"
            :min="8"
            :max="128"
            :step="2"
            color="primary"
            size="sm"
            :disabled="!fontSizeEnabled"
            class="flex-1"
            @update:model-value="update('fontSize', unitConv.fromSliderPx(Number($event), unitFor(model.fontSize)))"
          />
          <LengthValueInput
            v-if="fontSizeEnabled"
            :model-value="lengthOrFallback(model.fontSize, DEFAULTS.fontSize)"
            :px-step="2"
            :disabled="!fontSizeEnabled"
            @update:model-value="update('fontSize', $event)"
          />
        </div>
      </div>
    </fieldset>

    <USeparator />

    <!-- COLOURS -->
    <fieldset class="flex flex-col gap-3 border-0 p-0 m-0">
      <legend class="flex items-center justify-between w-full mb-1.5">
        <span class="control-group-title">{{ t('controls.colours') }}</span>
        <USwitch
          :model-value="colorsEnabled"
          size="xs"
          color="primary"
          @update:model-value="toggleColors"
        />
      </legend>

      <div
        :class="[colorsEnabled ? '' : 'opacity-50 pointer-events-none']"
        class="flex flex-col gap-3"
      >
        <ColorPickerRow
          v-model="bgColor"
          :label="t('controls.background')"
          :disabled="!colorsEnabled"
        />
        <ColorPickerRow
          v-model="fgTextColor"
          :label="t('controls.textColor')"
          :disabled="!colorsEnabled"
        />
        <ContrastBadge
          :ratio="contrastRatio"
          :verdict="contrastVerdict"
        />
        <ColorPickerRow
          v-model="borderColorComputed"
          :label="t('controls.borderColor')"
          :disabled="!colorsEnabled"
        />
      </div>
    </fieldset>
  </div>
</template>
