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

    <USeparator />

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

    <fieldset class="flex flex-col gap-2 border-0 p-0 m-0">
      <legend class="control-group-title mb-1.5">
        {{ t('controls.select.state') }}
      </legend>

      <UFormField>
        <template #label>
          <span class="control-group-title">{{ t('controls.select.required') }}</span>
        </template>
        <USwitch
          :model-value="model.required === true"
          size="sm"
          color="primary"
          @update:model-value="update('required', $event === true)"
        />
      </UFormField>

      <UFormField>
        <template #label>
          <span class="control-group-title">{{ t('controls.select.disabled') }}</span>
        </template>
        <USwitch
          :model-value="model.disabled === true"
          size="sm"
          color="primary"
          @update:model-value="update('disabled', $event === true)"
        />
      </UFormField>
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
