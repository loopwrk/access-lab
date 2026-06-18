<script setup lang="ts">
import type { InputProps, InputLabelAssociation, InputType } from "./definition";
import ResetDefaultsSection from "~/components/studio/sections/ResetDefaultsSection.vue";
import ControlCardCheckbox from "~/components/controls/ControlCardCheckbox.vue";
import SectionLegend from "~/components/controls/SectionLegend.vue";
import LearnLink from "~/components/controls/LearnLink.vue";
import InputStyleSection from "./InputStyleSection.vue";

const model = defineModel<Partial<InputProps>>({ required: true });
const { update } = useModelUpdater(model);

const { t } = useI18n();

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

const showSearchIconToggle = computed(() => model.value.renderAs === "search");

const showSearchIcon = computed({
  get: () => model.value.showSearchIcon === true,
  set: (value: boolean) => update("showSearchIcon", value),
});

const showPasswordToggleControl = computed(() => model.value.renderAs === "password");

const showPasswordToggle = computed({
  get: () => model.value.showPasswordToggle === true,
  set: (value: boolean) => update("showPasswordToggle", value),
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
        <LearnLink
          class="control-group-title"
          topic="vague-label"
          :label="t('controls.input.label')"
        />
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
      <SectionLegend
        :label="t('controls.input.labelAssociation')"
        learn-topic="accessible-name"
      />
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

      <ControlCardCheckbox
        v-if="showSearchIconToggle"
        v-model="showSearchIcon"
        :label="t('controls.input.showSearchIcon')"
        class="mt-2"
      />

      <ControlCardCheckbox
        v-if="showPasswordToggleControl"
        v-model="showPasswordToggle"
        :label="t('controls.input.showPasswordToggle')"
        class="mt-2"
      />
    </fieldset>

    <USeparator />

    <!-- Placeholder -->
    <UFormField class="flex flex-col">
      <template #label>
        <span class="control-group-title">{{ t("controls.input.placeholder") }}</span>
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
      <SectionLegend :label="t('controls.input.attributes')" />

      <UFormField class="flex flex-col">
        <template #label>
          <span class="control-group-title">{{ t("controls.input.name") }}</span>
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
          <span class="control-group-title">{{ t("controls.input.autocomplete") }}</span>
        </template>
        <UInput
          :model-value="model.autocomplete ?? ''"
          :placeholder="t('controls.input.autocompletePlaceholder')"
          class="w-full"
          @update:model-value="update('autocomplete', $event)"
        />
      </UFormField>

      <div class="grid grid-cols-2 gap-3">
        <ControlCardCheckbox
          v-model="required"
          :label="t('controls.input.required')"
        />
        <ControlCardCheckbox
          v-model="disabled"
          :label="t('controls.input.disabled')"
        />
        <ControlCardCheckbox
          v-model="ariaLabelAttr"
          :label="t('controls.input.ariaLabelAttr')"
        />
        <!-- aria-hidden on any input is an anti-pattern (a form field hidden
             from assistive technology); offered here so the user can trip it. -->
        <ControlCardCheckbox
          v-model="ariaHidden"
          :label="t('controls.input.ariaHidden')"
        />
      </div>
    </fieldset>

    <USeparator />

    <!-- Help text -->
    <UFormField class="flex flex-col">
      <template #label>
        <span class="control-group-title">{{ t("controls.input.helpText") }}</span>
      </template>
      <UInput
        :model-value="model.helpText ?? ''"
        :placeholder="t('controls.input.helpTextPlaceholder')"
        class="w-full"
        @update:model-value="update('helpText', $event)"
      />
    </UFormField>

    <USeparator />

    <InputStyleSection v-model="model" />
  </div>
</template>
