<script setup lang="ts">
import type { SelectProps, SelectLabelAssociation } from "./definition";
import ResetDefaultsSection from "~/components/ButtonStudio/sections/ResetDefaultsSection.vue";

const model = defineModel<Partial<SelectProps>>({ required: true });

function update<K extends keyof SelectProps>(key: K, value: SelectProps[K]) {
  model.value = { ...model.value, [key]: value };
}

const { t } = useI18n();
const { focusLearnTopic } = useInspectorTab();

const LABEL_OPTIONS: { value: SelectLabelAssociation; labelKey: string }[] = [
  { value: "for-id", labelKey: "controls.select.labelForId" },
  { value: "wrapping", labelKey: "controls.select.labelWrapping" },
  { value: "aria-label", labelKey: "controls.select.labelAriaLabel" },
  { value: "none", labelKey: "controls.select.labelNone" },
];

const labelAssociation = computed(() => model.value.labelAssociation ?? "for-id");

const optionsText = computed({
  get: () => (model.value.options ?? []).join("\n"),
  set: (value: string) => {
    const items = value.split("\n").map((s) => s.trim()).filter(Boolean);
    update("options", items);
    if (model.value.selectedOption && !items.includes(model.value.selectedOption)) {
      update("selectedOption", "");
    }
  },
});

const NONE_VALUE = "__none__";

const selectItems = computed(() => [
  { label: t("controls.select.selectedNone"), value: NONE_VALUE },
  ...(model.value.options ?? []).map((item) => ({ label: item, value: item })),
]);

const selectedModel = computed({
  get: () => model.value.selectedOption || NONE_VALUE,
  set: (value: string) => update("selectedOption", value === NONE_VALUE ? "" : value),
});

/**
 * Set `selectedOption` from a label posted by the iframe. The label
 * is matched against the current options so anything stale (a user
 * picking an option that was just removed from the Options textarea
 * in the same frame) is ignored.
 */
function applyIframePick(payload: unknown) {
  if (typeof payload !== "object" || payload === null) return;
  const label = (payload as { label?: unknown }).label;
  if (typeof label !== "string" || label.length === 0) return;
  const items = model.value.options ?? [];
  if (!items.includes(label)) return;
  update("selectedOption", label);
}

// Iframe bridge — without these, picking an option inside the
// rendered <select> (or the <div role="combobox"> popup) had no
// effect on the host model and the next re-render overwrote the
// user's pick.
usePreviewMessage({
  "select:change": applyIframePick,
  "combobox:select": applyIframePick,
});
</script>

<template>
  <div class="flex flex-col gap-4">
    <ResetDefaultsSection v-model="model" />
    <USeparator />

    <UFormField class="flex flex-col">
      <template #label>
        <span class="control-group-title">{{ t('controls.select.label') }}</span>
      </template>
      <UInput
        :model-value="model.label ?? ''"
        :placeholder="t('controls.select.labelPlaceholder')"
        class="w-full"
        @update:model-value="update('label', String($event))"
      />
    </UFormField>

    <USeparator />

    <fieldset class="flex flex-col gap-3 border-0 p-0 m-0">
      <legend class="control-group-title mb-1.5">
        <a
          href="#topic-select"
          class="control-label-link"
          @click.prevent="focusLearnTopic('select')"
        >
          {{ t('controls.select.labelAssociation') }}
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
    </fieldset>

    <USeparator />

    <UFormField class="flex flex-col">
      <template #label>
        <span class="control-group-title">{{ t('controls.select.options') }}</span>
      </template>
      <UTextarea
        v-model="optionsText"
        :placeholder="t('controls.select.optionsPlaceholder')"
        :rows="4"
        class="w-full"
      />
    </UFormField>

    <!--
      Placeholder option lives in the options-related stack, above the
      Default selection dropdown. Only shown for `select-native` —
      `<select multiple>` displays every option simultaneously (so a
      "please choose" entry is meaningless) and `<div role="combobox">`
      already uses its trigger text as the placeholder hint.
    -->
    <UCheckbox
      v-if="model.renderAs === 'select-native' || model.renderAs == null"
      :model-value="model.hasPlaceholder === true"
      :label="t('controls.select.hasPlaceholder')"
      variant="card"
      color="primary"
      size="md"
      :ui="CONTROL_CARD_UI"
      @update:model-value="update('hasPlaceholder', $event === true)"
    />

    <UFormField class="flex flex-col">
      <template #label>
        <span class="control-group-title">{{ t('controls.select.selectedOption') }}</span>
      </template>
      <USelect
        v-model="selectedModel"
        :items="selectItems"
        size="sm"
        class="w-full"
      />
    </UFormField>

    <USeparator />

    <!--
      Attributes section only appears for the `<div role="combobox">`
      variant — the two flags inside drive ARIA properties that don't
      apply to the native `<select>` element. Each flag is a card-
      checkbox so the State + Attributes sections read as a pair.
    -->
    <template v-if="model.renderAs === 'div-combobox'">
      <fieldset class="flex flex-col gap-2 border-0 p-0 m-0">
        <legend class="control-group-title mb-1.5">
          {{ t('controls.select.attributes') }}
        </legend>
        <div class="grid grid-cols-2 gap-3">
          <UCheckbox
            :model-value="model.comboboxAriaControls === true"
            :label="t('controls.select.comboboxAriaControls')"
            variant="card"
            color="primary"
            size="md"
            :ui="CONTROL_CARD_UI"
            @update:model-value="update('comboboxAriaControls', $event === true)"
          />
          <UCheckbox
            :model-value="model.comboboxListboxRole === true"
            :label="t('controls.select.comboboxListboxRole')"
            variant="card"
            color="primary"
            size="md"
            :ui="CONTROL_CARD_UI"
            @update:model-value="update('comboboxListboxRole', $event === true)"
          />
        </div>
      </fieldset>

      <USeparator />
    </template>

    <fieldset class="flex flex-col gap-2 border-0 p-0 m-0">
      <legend class="control-group-title mb-1.5">
        {{ t('controls.select.state') }}
      </legend>
      <div class="grid grid-cols-2 gap-3">
        <UCheckbox
          :model-value="model.required === true"
          :label="t('controls.select.required')"
          variant="card"
          color="primary"
          size="md"
          :ui="CONTROL_CARD_UI"
          @update:model-value="update('required', $event === true)"
        />
        <UCheckbox
          :model-value="model.disabled === true"
          :label="t('controls.select.disabled')"
          variant="card"
          color="primary"
          size="md"
          :ui="CONTROL_CARD_UI"
          @update:model-value="update('disabled', $event === true)"
        />
      </div>
    </fieldset>

    <USeparator />

    <UFormField class="flex flex-col">
      <template #label>
        <span class="control-group-title">{{ t('controls.select.name') }}</span>
      </template>
      <UInput
        :model-value="model.name ?? ''"
        :placeholder="t('controls.select.namePlaceholder')"
        class="w-full"
        @update:model-value="update('name', String($event))"
      />
    </UFormField>
  </div>
</template>
