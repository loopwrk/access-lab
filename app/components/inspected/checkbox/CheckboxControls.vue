<script setup lang="ts">
import type { CheckboxProps, CheckboxLabelAssociation, CheckboxGroupMode } from "./definition";
import ResetDefaultsSection from "~/components/ButtonStudio/sections/ResetDefaultsSection.vue";
import ControlCardCheckbox from "~/components/controls/ControlCardCheckbox.vue";
import SectionLegend from "~/components/controls/SectionLegend.vue";
import LearnLink from "~/components/controls/LearnLink.vue";

const model = defineModel<Partial<CheckboxProps>>({ required: true });
const { update, updateMany } = useModelUpdater(model);

const { t } = useI18n();

// Label-association picker labels vary by variant. The native
// `<input type="checkbox">` uses `<label for>` and `<label>`-wrapping
// idiomatically; a `<div role="checkbox">` cannot use either -
// `<label for>` doesn't bind to non-form-controls and a wrapping
// `<label>` doesn't extend click activation to a div. The four enum
// values stay the same; only the user-facing labels change so the
// picker reads as ARIA-appropriate when the div variant is active.
const LABEL_OPTIONS_NATIVE: { value: CheckboxLabelAssociation; labelKey: string }[] = [
  { value: "for-id", labelKey: "controls.checkbox.labelForId" },
  { value: "wrapping", labelKey: "controls.checkbox.labelWrapping" },
  { value: "aria-label", labelKey: "controls.checkbox.labelAriaLabel" },
  { value: "none", labelKey: "controls.checkbox.labelNone" },
];

const LABEL_OPTIONS_DIV: { value: CheckboxLabelAssociation; labelKey: string }[] = [
  { value: "for-id", labelKey: "controls.checkbox.labelAriaLabelledby" },
  { value: "wrapping", labelKey: "controls.checkbox.labelNameFromContent" },
  { value: "aria-label", labelKey: "controls.checkbox.labelAriaLabel" },
  { value: "none", labelKey: "controls.checkbox.labelNone" },
];

const labelOptions = computed(() =>
  model.value.renderAs === "div-checkbox" ? LABEL_OPTIONS_DIV : LABEL_OPTIONS_NATIVE,
);

const GROUP_OPTIONS: { value: CheckboxGroupMode; labelKey: string }[] = [
  { value: "single", labelKey: "controls.checkbox.groupSingle" },
  { value: "group-with-fieldset", labelKey: "controls.checkbox.groupWithFieldset" },
  { value: "group-no-fieldset", labelKey: "controls.checkbox.groupNoFieldset" },
  { value: "parent-with-children", labelKey: "controls.checkbox.groupParentWithChildren" },
];

const labelAssociation = computed(() => model.value.labelAssociation ?? "for-id");
const groupMode = computed(() => model.value.groupMode ?? "single");

// Keep `aria-checked` aligned with whichever variant *needs* it.
//
//   - Switching to `div-checkbox` → enable. The div has no other
//     state mechanism, so without it the demo starts broken and
//     axe-core fires a misleading critical violation that has more
//     to do with the studio's defaults than the user's choices.
//   - Switching back to `input-checkbox` → disable. Without this
//     symmetric clear, a leftover `aria-checked` from a previous
//     div visit makes the native variant fire the
//     `checkbox-aria-checked-redundant` rule even though the user
//     never opted in to that attribute on the native control.
//
// The user can still manually flip the "Add aria-checked" card on
// either variant to demonstrate the corresponding anti-pattern.
watch(
  () => model.value.renderAs,
  (next, prev) => {
    if (next === prev) return;
    if (next === "div-checkbox") {
      update("ariaChecked", true);
    } else if (prev === "div-checkbox") {
      update("ariaChecked", false);
    }
  },
);

watch(
  () => model.value.groupMode,
  (next, prev) => {
    if (next === "parent-with-children" && prev !== "parent-with-children") {
      const children = model.value.childChecked ?? [];
      syncParentFromChildren(children);
    }
  },
);

/**
 * Compute the parent's derived state from a children array. Pure
 * function - returns the `checked` and `indeterminate` pair the
 * canonical "select all" pattern requires:
 *
 *   - 0 children ticked  → unchecked
 *   - all children ticked → checked
 *   - some ticked         → indeterminate (and checked is false)
 */
function deriveParentState(children: boolean[]): {
  checked: boolean;
  indeterminate: boolean;
} {
  const total = children.length;
  const ticked = children.filter(Boolean).length;
  if (ticked === 0) return { checked: false, indeterminate: false };
  if (ticked === total) return { checked: true, indeterminate: false };
  return { checked: false, indeterminate: true };
}

/**
 * Apply the parent's derived `checked` + `indeterminate` state. The two keys
 * move together, so write them in a single `updateMany`.
 */
function syncParentFromChildren(children: boolean[]) {
  updateMany(deriveParentState(children));
}

// Iframe click bridge:
//   - `demo:click` - the inspected parent checkbox (or a standalone
//     checkbox in any other group mode) was activated. In the
//     `parent-with-children` mode, this cascades to all children
//     and clears `indeterminate`, matching the canonical "select
//     all" pattern in the Learn article. In every other mode it
//     just flips `checked`.
//   - `demo:click-child` - a child in the `parent-with-children`
//     layout was activated. Flip the matching entry in
//     `childChecked`, then auto-sync the parent.
usePreviewMessage({
  "demo:click": () => {
    const newChecked = !(model.value.checked === true);
    if (model.value.groupMode === "parent-with-children") {
      const children = (model.value.childChecked ?? []).map(() => newChecked);
      updateMany({ checked: newChecked, indeterminate: false, childChecked: children });
      return;
    }
    update("checked", newChecked);
  },
  "demo:click-child": (payload: unknown) => {
    if (typeof payload !== "object" || payload === null) return;
    const index = (payload as { index?: unknown }).index;
    if (typeof index !== "number") return;
    const current = model.value.childChecked ?? [];
    const next = [...current];
    next[index] = !(next[index] === true);

    if (model.value.groupMode !== "parent-with-children") {
      // group-with-fieldset / group-no-fieldset: every child is an
      // independent boolean. No parent to derive, no auto-sync -
      // just update the one entry the user clicked.
      update("childChecked", next);
      return;
    }

    // parent-with-children: auto-sync the parent only when its state
    // was already in sync with the children *before* this click. If
    // the user has manually toggled a State card into a mismatch,
    // that override represents exactly the production bug they want
    // to demonstrate (e.g. code that forgets to clear `indeterminate`
    // when children settle). Overwriting their override on the next
    // child click would erase the very anti-pattern the demo is meant
    // to surface. The `checkbox-parent-child-mismatch` rule keeps
    // flagging the disagreement so the lesson stays visible.
    const oldDerived = deriveParentState(current);
    const parentInSyncBefore =
      (model.value.checked === true) === oldDerived.checked &&
      (model.value.indeterminate === true) === oldDerived.indeterminate;

    if (parentInSyncBefore) {
      // Parent + children move together: re-derive the parent and write it
      // alongside the child array in one mutation.
      updateMany({ childChecked: next, ...deriveParentState(next) });
    } else {
      // Parent already overridden - touch only the children.
      update("childChecked", next);
    }
  },
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
          topic="accessible-name"
          :label="t('controls.checkbox.label')"
        />
      </template>
      <UInput
        :model-value="model.label ?? ''"
        :placeholder="t('controls.checkbox.labelPlaceholder')"
        class="w-full"
        @update:model-value="update('label', String($event))"
      />
    </UFormField>

    <USeparator />

    <!-- Label-association pattern -->
    <fieldset class="flex flex-col gap-3 border-0 p-0 m-0">
      <SectionLegend
        :label="t('controls.checkbox.labelAssociation')"
        learn-topic="checkbox"
      />
      <UFieldGroup
        size="sm"
        orientation="vertical"
      >
        <UButton
          v-for="opt in labelOptions"
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

    <!-- Group rendering -->
    <fieldset class="flex flex-col gap-3 border-0 p-0 m-0">
      <SectionLegend
        :label="t('controls.checkbox.groupMode')"
        learn-topic="checkbox"
      />
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

    <fieldset class="flex flex-col gap-2 border-0 p-0 m-0">
      <SectionLegend :label="t('controls.checkbox.state')" />
      <div class="grid grid-cols-2 gap-3">
        <ControlCardCheckbox
          :model-value="model.checked === true"
          :label="t('controls.checkbox.checked')"
          @update:model-value="update('checked', $event)"
        />
        <ControlCardCheckbox
          :model-value="model.indeterminate === true"
          :label="t('controls.checkbox.indeterminate')"
          @update:model-value="update('indeterminate', $event)"
        />
        <ControlCardCheckbox
          :model-value="model.required === true"
          :label="t('controls.checkbox.required')"
          @update:model-value="update('required', $event)"
        />
        <ControlCardCheckbox
          :model-value="model.disabled === true"
          :label="t('controls.checkbox.disabled')"
          @update:model-value="update('disabled', $event)"
        />
      </div>
    </fieldset>

    <USeparator />

    <!--
      ARIA. Single card spanning the full width - matches the State
      grid's visual language so the two sections read as a pair, but
      laid out 1-column because there is only one flag here today.
    -->
    <fieldset class="flex flex-col gap-2 border-0 p-0 m-0">
      <SectionLegend :label="t('controls.checkbox.aria')" />
      <ControlCardCheckbox
        :model-value="model.ariaChecked === true"
        :label="t('controls.checkbox.ariaChecked')"
        @update:model-value="update('ariaChecked', $event)"
      />
    </fieldset>

    <USeparator />

    <!-- Form attributes -->
    <UFormField class="flex flex-col">
      <template #label>
        <span class="control-group-title">{{ t("controls.checkbox.name") }}</span>
      </template>
      <UInput
        :model-value="model.name ?? ''"
        :placeholder="t('controls.checkbox.namePlaceholder')"
        class="w-full"
        @update:model-value="update('name', String($event))"
      />
    </UFormField>

    <UFormField class="flex flex-col">
      <template #label>
        <span class="control-group-title">{{ t("controls.checkbox.value") }}</span>
      </template>
      <UInput
        :model-value="model.value ?? ''"
        :placeholder="t('controls.checkbox.valuePlaceholder')"
        class="w-full"
        @update:model-value="update('value', String($event))"
      />
    </UFormField>
  </div>
</template>
