<script setup lang="ts">
import type { RadioProps, RadioLabelAssociation, RadioGroupMode } from "./definition";
import ResetDefaultsSection from "~/components/ButtonStudio/sections/ResetDefaultsSection.vue";

const model = defineModel<Partial<RadioProps>>({ required: true });

function update<K extends keyof RadioProps>(key: K, value: RadioProps[K]) {
  model.value = { ...model.value, [key]: value };
}

const { t } = useI18n();
const { focusLearnTopic } = useInspectorTab();

const LABEL_OPTIONS: { value: RadioLabelAssociation; labelKey: string }[] = [
  { value: "for-id", labelKey: "controls.radio.labelForId" },
  { value: "wrapping", labelKey: "controls.radio.labelWrapping" },
  { value: "aria-label", labelKey: "controls.radio.labelAriaLabel" },
  { value: "none", labelKey: "controls.radio.labelNone" },
];

const GROUP_OPTIONS: { value: RadioGroupMode; labelKey: string }[] = [
  { value: "group-with-fieldset", labelKey: "controls.radio.groupWithFieldset" },
  { value: "group-no-fieldset", labelKey: "controls.radio.groupNoFieldset" },
];

const labelAssociation = computed(() => model.value.labelAssociation ?? "for-id");
const groupMode = computed(() => model.value.groupMode ?? "group-with-fieldset");

const groupItemsText = computed({
  get: () => (model.value.groupItems ?? []).join("\n"),
  set: (value: string) => {
    const items = value.split("\n").map((s) => s.trim()).filter(Boolean);
    // Single combined write. Two back-to-back `update()` calls race through
    // defineModel — the second reads `model.value` before the first emit has
    // committed, so it spreads a stale copy and drops the `groupItems` change.
    // That only bit when the cleared-selection branch ran (removing the
    // currently-selected item), which silently reverted the list edit. Same
    // fix CheckboxControls uses for its parent-sync writes.
    const next: Partial<RadioProps> = { ...model.value, groupItems: items };
    if (model.value.selectedItem && !items.includes(model.value.selectedItem)) {
      next.selectedItem = "";
    }
    model.value = next;
  },
});

// Reka UI (under USelect) forbids `value=""` on a SelectItem — the
// empty string is reserved as the "no selection" sentinel. We still
// want the user to be able to *pick* "(none)" from the dropdown
// (deselect after picking something), so we use a non-empty sentinel
// in the dropdown and translate it to/from the model's empty string.
//
// Computed (not inline) so the array reference stays stable across
// re-renders; an unstable items prop causes Reka's popover to
// flicker / hang in a half-open state.
const NONE_VALUE = "__none__";

const selectItems = computed(() => [
  { label: t("controls.radio.selectedNone"), value: NONE_VALUE },
  ...(model.value.groupItems ?? []).map((item) => ({ label: item, value: item })),
]);

const selectModel = computed({
  get: () => model.value.selectedItem || NONE_VALUE,
  set: (value: string) => update("selectedItem", value === NONE_VALUE ? "" : value),
});

// Iframe click bridge: when the user picks a radio inside the
// rendered group, preview-shell forwards the change as
// `demo:click-child` with the index. Map that back to the label so
// the model's `selectedItem` matches what the user just chose —
// otherwise the next host-side re-render would overwrite the
// in-iframe selection.
usePreviewMessage({
  "demo:click-child": (payload: unknown) => {
    if (typeof payload !== "object" || payload === null) return;
    const index = (payload as { index?: unknown }).index;
    if (typeof index !== "number") return;
    const pickedItem = (model.value.groupItems ?? [])[index];
    if (pickedItem === undefined) return;
    update("selectedItem", pickedItem);
  },
});
</script>

<template>
  <div class="flex flex-col gap-4">
    <ResetDefaultsSection v-model="model" />
    <USeparator />

    <UFormField class="flex flex-col">
      <template #label>
        <span class="control-group-title">{{ t('controls.radio.label') }}</span>
      </template>
      <UInput
        :model-value="model.label ?? ''"
        :placeholder="t('controls.radio.labelPlaceholder')"
        class="w-full"
        @update:model-value="update('label', String($event))"
      />
    </UFormField>

    <USeparator />

    <fieldset class="flex flex-col gap-3 border-0 p-0 m-0">
      <legend class="control-group-title mb-1.5">
        <a
          href="#topic-radio"
          class="control-label-link"
          @click.prevent="focusLearnTopic('radio')"
        >
          {{ t('controls.radio.labelAssociation') }}
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

    <fieldset class="flex flex-col gap-3 border-0 p-0 m-0">
      <legend class="control-group-title mb-1.5">
        <a
          href="#topic-radio"
          class="control-label-link"
          @click.prevent="focusLearnTopic('radio')"
        >
          {{ t('controls.radio.groupMode') }}
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
          v-for="opt in GROUP_OPTIONS"
          :key="opt.value"
          :color="groupMode === opt.value ? 'primary' : 'neutral'"
          :variant="groupMode === opt.value ? 'solid' : 'ghost'"
          @click="update('groupMode', opt.value)"
        >
          {{ t(opt.labelKey) }}
        </UButton>
      </UFieldGroup>
    </fieldset>

    <USeparator />

    <UFormField class="flex flex-col">
      <template #label>
        <span class="control-group-title">{{ t('controls.radio.groupItems') }}</span>
      </template>
      <UTextarea
        v-model="groupItemsText"
        :placeholder="t('controls.radio.groupItemsPlaceholder')"
        :rows="4"
        class="w-full"
      />
    </UFormField>

    <USeparator />

    <UFormField class="flex flex-col">
      <template #label>
        <span class="control-group-title">{{ t('controls.radio.selectedItem') }}</span>
      </template>
      <USelect
        v-model="selectModel"
        :items="selectItems"
        size="sm"
        class="w-full"
      />
    </UFormField>

    <USeparator />

    <fieldset class="flex flex-col gap-2 border-0 p-0 m-0">
      <legend class="control-group-title mb-1.5">
        {{ t('controls.radio.state') }}
      </legend>
      <div class="grid grid-cols-2 gap-3">
        <UCheckbox
          :model-value="model.required === true"
          :label="t('controls.radio.required')"
          variant="card"
          color="primary"
          size="md"
          :ui="CONTROL_CARD_UI"
          @update:model-value="update('required', $event === true)"
        />
        <UCheckbox
          :model-value="model.disabled === true"
          :label="t('controls.radio.disabled')"
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
        <span class="control-group-title">{{ t('controls.radio.name') }}</span>
      </template>
      <UInput
        :model-value="model.name ?? ''"
        :placeholder="t('controls.radio.namePlaceholder')"
        class="w-full"
        @update:model-value="update('name', String($event))"
      />
    </UFormField>
  </div>
</template>
