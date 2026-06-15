<script setup lang="ts">
import type {
  InputProps,
  InputLabelAssociation,
  InputType,
  InputStyleTarget,
  InputTextStyleSlice,
} from "./definition";
import { useUnitConversion } from "~/composables/useUnitConversion";
import type { CssUnit, CssLength } from "~/composables/useUnitConversion";
import ResetDefaultsSection from "~/components/ButtonStudio/sections/ResetDefaultsSection.vue";
import ColorPickerRow from "~/components/controls/ColorPickerRow.vue";
import StyleTargetPicker from "~/components/controls/StyleTargetPicker.vue";

const model = defineModel<Partial<InputProps>>({ required: true });

function update<K extends keyof InputProps>(key: K, value: InputProps[K]) {
  model.value = { ...model.value, [key]: value };
}

const { t } = useI18n();
const unitConv = useUnitConversion();
const { focusLearnTopic } = useInspectorTab();

const DEFAULTS = {
  fontSize: 14,
  bg: "#FFFFFF",
  fgText: "#000000",
  borderColor: "#888888",
} as const;

// The "Style applies to" picker — which part of the input the
// surrounding font-size and text-colour controls bind to. Local state;
// not part of the model because it's a UI concern, not a rendered
// property. Background and border controls are input-only and don't
// follow the picker.
const STYLE_TARGET_OPTIONS = [
  { value: "label", label: "Label" },
  { value: "input", label: "Input" },
  { value: "placeholder", label: "Placeholder" },
  { value: "helpText", label: "Help text" },
];

const activeStyleTarget = ref<InputStyleTarget>("input");
const isInputTarget = computed(() => activeStyleTarget.value === "input");

// Read the current target's slice. For the "input" target the slice
// lives in the top-level props; for label / helpText it lives nested
// under the corresponding `*Style` slot.
function activeSlice(): InputTextStyleSlice {
  if (activeStyleTarget.value === "label") return model.value.labelStyle ?? {};
  if (activeStyleTarget.value === "placeholder") return model.value.placeholderStyle ?? {};
  if (activeStyleTarget.value === "helpText") return model.value.helpTextStyle ?? {};
  return { fontSize: model.value.fontSize, fgText: model.value.fgText };
}

function updateActiveSlice(patch: Partial<InputTextStyleSlice>) {
  if (activeStyleTarget.value === "input") {
    model.value = { ...model.value, ...patch } as Partial<InputProps>;
    return;
  }
  const sliceKey
    = activeStyleTarget.value === "label"
      ? "labelStyle"
      : activeStyleTarget.value === "placeholder"
        ? "placeholderStyle"
        : "helpTextStyle";
  const current = model.value[sliceKey] ?? {};
  // Build the next slice without spreading undefineds — so toggling
  // a property off actually removes it rather than leaving an
  // explicit `undefined` value.
  const next: InputTextStyleSlice = {};
  for (const key of Object.keys(current) as (keyof InputTextStyleSlice)[]) {
    const value = current[key];
    if (value !== undefined) next[key] = value as never;
  }
  for (const key of Object.keys(patch) as (keyof InputTextStyleSlice)[]) {
    const value = patch[key];
    if (value !== undefined) next[key] = value as never;
  }
  model.value = { ...model.value, [sliceKey]: next };
}

const activeFontSize = computed<CssLength | undefined>({
  get: () => activeSlice().fontSize,
  set: (value) => updateActiveSlice({ fontSize: value }),
});

const fontSizeEnabled = computed(() => activeFontSize.value != null);

const activeFgText = computed({
  get: () => activeSlice().fgText ?? DEFAULTS.fgText,
  set: (value: string) => updateActiveSlice({ fgText: value }),
});

const activeFgTextEnabled = computed(() => activeSlice().fgText != null);

const bgColor = computed({
  get: () => model.value.bg ?? DEFAULTS.bg,
  set: (value: string) => update("bg", value),
});

const borderColorComputed = computed({
  get: () => model.value.borderColor ?? DEFAULTS.borderColor,
  set: (value: string) => update("borderColor", value),
});

const inputBgEnabled = computed(() =>
  model.value.bg != null || model.value.borderColor != null,
);

const { ratio: contrastRatio, verdict: contrastVerdict } = useContrast(
  activeFgText,
  bgColor,
  {
    fontSizePx: () => {
      const f = activeFontSize.value;
      if (!f) return DEFAULTS.fontSize;
      return unitConv.lengthToPx(f);
    },
    bold: false,
  },
);

function toggleFontSize(value: boolean | "indeterminate") {
  if (value === true) {
    activeFontSize.value = unitConv.fromPx(DEFAULTS.fontSize, "rem");
  } else {
    activeFontSize.value = undefined;
  }
}

function toggleActiveFgText(value: boolean | "indeterminate") {
  if (value === true) {
    activeFgText.value = DEFAULTS.fgText;
  } else {
    updateActiveSlice({ fgText: undefined });
  }
}

function toggleInputBg(value: boolean | "indeterminate") {
  if (value === true) {
    model.value = {
      ...model.value,
      bg: DEFAULTS.bg,
      borderColor: DEFAULTS.borderColor,
    };
  } else {
    const next = { ...model.value };
    delete next.bg;
    delete next.borderColor;
    model.value = next;
  }
}

function pxOrFallback(length: CssLength | undefined, fallbackPx: number): number {
  return length ? unitConv.lengthToPx(length) : fallbackPx;
}

function unitFor(length: CssLength | undefined): CssUnit {
  return length?.unit ?? "px";
}

function lengthOrFallback(length: CssLength | undefined, fallbackPx: number): CssLength {
  return length ?? { value: fallbackPx, unit: "px" };
}

const LABEL_OPTIONS: { value: InputLabelAssociation; labelKey: string }[] = [
  { value: "for-id", labelKey: "controls.input.labelForId" },
  { value: "wrapping", labelKey: "controls.input.labelWrapping" },
  { value: "aria-label", labelKey: "controls.input.labelAriaLabel" },
  { value: "none", labelKey: "controls.input.labelNone" },
  { value: "title", labelKey: "controls.input.labelTitleOnly" },
];

const labelAssociation = computed(() => model.value.labelAssociation ?? "for-id");

const required = computed({
  get: () => model.value.required === true,
  set: (value: boolean) => update("required", value),
});

const disabled = computed({
  get: () => model.value.disabled === true,
  set: (value: boolean) => update("disabled", value),
});

const ariaLabelAttr = computed({
  get: () => model.value.ariaLabel === true,
  set: (value: boolean) => update("ariaLabel", value),
});

const showSearchIconToggle = computed(() =>
  model.value.renderAs === "search",
);

const showSearchIcon = computed({
  get: () => model.value.showSearchIcon === true,
  set: (value: boolean) => update("showSearchIcon", value),
});

const ariaHidden = computed({
  get: () => model.value.ariaHidden === true,
  set: (value: boolean) => update("ariaHidden", value),
});

// Canonical field label for each input type. The variant-change
// watcher below keeps `model.label` in step with `model.renderAs` so
// switching from email to tel replaces "Email" with "Phone number"
// (and replaces any custom text the user has typed). Per-component
// labels live here rather than in the shared composable so the
// vocabulary can be tuned without touching shared code.
const INPUT_TYPE_LABELS: Record<InputType, string> = {
  text: "Name",
  email: "Email",
  tel: "Phone number",
  url: "Website",
  password: "Password",
  number: "Quantity",
  search: "Search",
};

useVariantLabelSync(model, {
  variantKey: "renderAs",
  labelKey: "label",
  labelByVariant: INPUT_TYPE_LABELS,
});
</script>

<template>
  <div class="flex flex-col gap-4">
    <ResetDefaultsSection v-model="model" />
    <USeparator />

    <!-- Label / accessible name -->
    <UFormField class="flex flex-col">
      <template #label>
        <a
          href="#topic-vague-label"
          class="control-group-title control-label-link"
          @click.prevent="focusLearnTopic('vague-label')"
        >
          {{ t('controls.input.label') }}
          <UIcon
            name="i-lucide-arrow-up-right"
            class="control-label-link-icon"
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

    <!-- Label-association pattern -->
    <fieldset class="flex flex-col gap-3 border-0 p-0 m-0">
      <legend class="control-group-title mb-1.5">
        <a
          href="#topic-accessible-name"
          class="control-label-link"
          @click.prevent="focusLearnTopic('accessible-name')"
        >
          {{ t('controls.input.labelAssociation') }}
          <UIcon
            name="i-lucide-arrow-up-right"
            class="control-label-link-icon"
            aria-hidden="true"
          />
        </a>
      </legend>
      <UFieldGroup
        size="sm"
        orientation="vertical"
      >
        <UButton
          v-for="opt in LABEL_OPTIONS"
          :key="opt.value"
          :color="labelAssociation === opt.value ? 'primary' : 'neutral'"
          :variant="labelAssociation === opt.value ? 'solid' : 'ghost'"
          @click="update('labelAssociation', opt.value)"
        >
          {{ t(opt.labelKey) }}
        </UButton>
      </UFieldGroup>

      <UCheckbox
        v-if="showSearchIconToggle"
        v-model="showSearchIcon"
        :label="t('controls.input.showSearchIcon')"
        variant="card"
        color="primary"
        size="md"
        :ui="CONTROL_CARD_UI"
        class="mt-2"
      />
    </fieldset>

    <USeparator />

    <!--
      Attributes section: ARIA-related flags that aren't part of the
      label-association decision. `aria-hidden` lives here so the
      user can apply it to any input type — toggling it on a regular
      text input demonstrates the anti-pattern (a form field hidden
      from assistive technology), which is exactly the "learn by
      failing" path the studio is built for. Never disabled, never
      gated on the search icon.
    -->
    <fieldset class="flex flex-col gap-2 border-0 p-0 m-0">
      <legend class="control-group-title mb-1.5">
        {{ t('controls.input.attributes') }}
      </legend>
      <UCheckbox
        v-model="ariaHidden"
        :label="t('controls.input.ariaHidden')"
        variant="card"
        color="primary"
        size="md"
        :ui="CONTROL_CARD_UI"
      />
    </fieldset>

    <USeparator />

    <!-- Placeholder -->
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

    <!-- Attributes -->
    <fieldset class="flex flex-col gap-3 border-0 p-0 m-0">
      <legend class="control-group-title mb-1.5">
        {{ t('controls.input.attributes') }}
      </legend>

      <UFormField class="flex flex-col">
        <template #label>
          <span class="control-group-title">{{ t('controls.input.name') }}</span>
        </template>
        <UInput
          :model-value="model.name ?? ''"
          :placeholder="t('controls.input.namePlaceholder')"
          class="w-full"
          @update:model-value="update('name', $event)"
        />
      </UFormField>

      <UFormField class="flex flex-col">
        <template #label>
          <span class="control-group-title">{{ t('controls.input.autocomplete') }}</span>
        </template>
        <UInput
          :model-value="model.autocomplete ?? ''"
          :placeholder="t('controls.input.autocompletePlaceholder')"
          class="w-full"
          @update:model-value="update('autocomplete', $event)"
        />
      </UFormField>

      <div class="grid grid-cols-2 gap-3">
        <UCheckbox
          v-model="required"
          :label="t('controls.input.required')"
          variant="card"
          color="primary"
          size="md"
          :ui="CONTROL_CARD_UI"
        />
        <UCheckbox
          v-model="disabled"
          :label="t('controls.input.disabled')"
          variant="card"
          color="primary"
          size="md"
          :ui="CONTROL_CARD_UI"
        />
        <UCheckbox
          v-model="ariaLabelAttr"
          :label="t('controls.input.ariaLabelAttr')"
          variant="card"
          color="primary"
          size="md"
          :ui="CONTROL_CARD_UI"
        />
      </div>
    </fieldset>

    <USeparator />

    <!-- Help text -->
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

    <!-- STYLE APPLIES TO picker -->
    <StyleTargetPicker
      v-model="activeStyleTarget"
      :options="STYLE_TARGET_OPTIONS"
      :legend="t('controls.input.styleAppliesTo')"
    />

    <USeparator />

    <!-- FONT SIZE (active target) -->
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
            :model-value="pxOrFallback(activeFontSize, DEFAULTS.fontSize)"
            :min="8"
            :max="128"
            :step="2"
            color="primary"
            size="sm"
            :disabled="!fontSizeEnabled"
            class="flex-1"
            @update:model-value="activeFontSize = unitConv.fromSliderPx(Number($event), unitFor(activeFontSize))"
          />
          <LengthValueInput
            v-if="fontSizeEnabled"
            :model-value="lengthOrFallback(activeFontSize, DEFAULTS.fontSize)"
            :px-step="2"
            :disabled="!fontSizeEnabled"
            @update:model-value="activeFontSize = $event"
          />
        </div>
      </div>
    </fieldset>

    <USeparator />

    <!-- TEXT COLOUR (active target) -->
    <fieldset class="flex flex-col gap-3 border-0 p-0 m-0">
      <legend class="flex items-center justify-between w-full mb-1.5">
        <span class="control-group-title">{{ t('controls.textColor') }}</span>
        <USwitch
          :model-value="activeFgTextEnabled"
          size="xs"
          color="primary"
          @update:model-value="toggleActiveFgText"
        />
      </legend>
      <div :class="[activeFgTextEnabled ? '' : 'opacity-50 pointer-events-none']">
        <ColorPickerRow
          v-model="activeFgText"
          :label="t('controls.textColor')"
          :disabled="!activeFgTextEnabled"
        />
      </div>
    </fieldset>

    <!-- BACKGROUND + BORDER (input target only) -->
    <template v-if="isInputTarget">
      <USeparator />
      <fieldset class="flex flex-col gap-3 border-0 p-0 m-0">
        <legend class="flex items-center justify-between w-full mb-1.5">
          <span class="control-group-title">{{ t('controls.input.background') }}</span>
          <USwitch
            :model-value="inputBgEnabled"
            size="xs"
            color="primary"
            @update:model-value="toggleInputBg"
          />
        </legend>
        <div
          :class="[inputBgEnabled ? '' : 'opacity-50 pointer-events-none']"
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
            v-model="borderColorComputed"
            :label="t('controls.borderColor')"
            :disabled="!inputBgEnabled"
          />
        </div>
      </fieldset>
    </template>
  </div>
</template>
