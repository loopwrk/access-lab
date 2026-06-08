<script setup lang="ts">
import type { CheckboxProps, CheckboxLabelAssociation, CheckboxGroupMode } from "./definition";
import ResetDefaultsSection from "~/components/ButtonStudio/sections/ResetDefaultsSection.vue";

const model = defineModel<Partial<CheckboxProps>>({ required: true });

function update<K extends keyof CheckboxProps>(key: K, value: CheckboxProps[K]) {
  model.value = { ...model.value, [key]: value };
}

const { t } = useI18n();
const { focusLearnTopic } = useInspectorTab();

const LABEL_OPTIONS: { value: CheckboxLabelAssociation; labelKey: string }[] = [
  { value: "for-id", labelKey: "controls.checkbox.labelForId" },
  { value: "wrapping", labelKey: "controls.checkbox.labelWrapping" },
  { value: "aria-label", labelKey: "controls.checkbox.labelAriaLabel" },
  { value: "none", labelKey: "controls.checkbox.labelNone" },
];

const GROUP_OPTIONS: { value: CheckboxGroupMode; labelKey: string }[] = [
  { value: "single", labelKey: "controls.checkbox.groupSingle" },
  { value: "group-with-fieldset", labelKey: "controls.checkbox.groupWithFieldset" },
  { value: "group-no-fieldset", labelKey: "controls.checkbox.groupNoFieldset" },
  { value: "parent-with-children", labelKey: "controls.checkbox.groupParentWithChildren" },
];

const CARD_UI = CONTROL_CARD_UI;

const labelAssociation = computed(() => model.value.labelAssociation ?? "for-id");
const groupMode = computed(() => model.value.groupMode ?? "single");

// Auto-enable `aria-checked` when the user switches to the div-checkbox
// variant - the div has no other state mechanism, so the demo would be
// broken without it. The user can still manually disable it to see
// what that looks like.
watch(
  () => model.value.renderAs,
  (next, prev) => {
    if (next === "div-checkbox" && prev !== "div-checkbox") {
      update("ariaChecked", true);
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
 * function — returns the `checked` and `indeterminate` pair the
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
 * Apply the parent's derived state. Single write to `model.value`
 * because two back-to-back writes through `defineModel` race: the
 * second write reads `model.value` from the prop which has not yet
 * been refreshed by the first emit's parent-side commit.
 */
function syncParentFromChildren(children: boolean[]) {
  const next = deriveParentState(children);
  model.value = { ...model.value, ...next };
}

// Iframe click bridge:
//   - `demo:click` — the inspected parent checkbox (or a standalone
//     checkbox in any other group mode) was activated. In the
//     `parent-with-children` mode, this cascades to all children
//     and clears `indeterminate`, matching the canonical "select
//     all" pattern in the Learn article. In every other mode it
//     just flips `checked`.
//   - `demo:click-child` — a child in the `parent-with-children`
//     layout was activated. Flip the matching entry in
//     `childChecked`, then auto-sync the parent.
usePreviewMessage({
  "demo:click": () => {
    const newChecked = !(model.value.checked === true);
    if (model.value.groupMode === "parent-with-children") {
      const children = (model.value.childChecked ?? []).map(() => newChecked);
      model.value = {
        ...model.value,
        checked: newChecked,
        indeterminate: false,
        childChecked: children,
      };
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
      // independent boolean. No parent to derive, no auto-sync —
      // just update the one entry the user clicked.
      model.value = { ...model.value, childChecked: next };
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
    const parentInSyncBefore
      = (model.value.checked === true) === oldDerived.checked
      && (model.value.indeterminate === true) === oldDerived.indeterminate;

    if (parentInSyncBefore) {
      // One combined write — parent's checked + indeterminate and the
      // child array all live in the same model object, so writing
      // them together avoids the two-writes-race that drops the
      // childChecked update on the floor.
      const newDerived = deriveParentState(next);
      model.value = {
        ...model.value,
        childChecked: next,
        ...newDerived,
      };
    } else {
      // Parent already overridden — touch only the children.
      model.value = { ...model.value, childChecked: next };
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
        <a href="#topic-accessible-name" class="control-group-title control-label-link"
          @click.prevent="focusLearnTopic('accessible-name')">
          {{ t('controls.checkbox.label') }}
          <UIcon name="i-lucide-arrow-up-right" class="control-label-link-icon" aria-hidden="true" />
        </a>
      </template>
      <UInput :model-value="model.label ?? ''" :placeholder="t('controls.checkbox.labelPlaceholder')" class="w-full"
        @update:model-value="update('label', String($event))" />
    </UFormField>

    <USeparator />

    <!-- Label-association pattern -->
    <fieldset class="flex flex-col gap-3 border-0 p-0 m-0">
      <legend class="control-group-title mb-1.5">
        <a href="#topic-checkbox" class="control-label-link" @click.prevent="focusLearnTopic('checkbox')">
          {{ t('controls.checkbox.labelAssociation') }}
          <UIcon name="i-lucide-arrow-up-right" class="control-label-link-icon" aria-hidden="true" />
        </a>
      </legend>
      <UFieldGroup size="sm" orientation="vertical">
        <UButton v-for="opt in LABEL_OPTIONS" :key="opt.value"
          :color="labelAssociation === opt.value ? 'primary' : 'neutral'"
          :variant="labelAssociation === opt.value ? 'solid' : 'ghost'" @click="update('labelAssociation', opt.value)">
          {{ t(opt.labelKey) }}
        </UButton>
      </UFieldGroup>
    </fieldset>

    <USeparator />

    <!-- Group rendering -->
    <fieldset class="flex flex-col gap-3 border-0 p-0 m-0">
      <legend class="control-group-title mb-1.5">
        <a href="#topic-checkbox" class="control-label-link" @click.prevent="focusLearnTopic('checkbox')">
          {{ t('controls.checkbox.groupMode') }}
          <UIcon name="i-lucide-arrow-up-right" class="control-label-link-icon" aria-hidden="true" />
        </a>
      </legend>
      <UFieldGroup size="sm" orientation="vertical">
        <UButton v-for="opt in GROUP_OPTIONS" :key="opt.value" :color="groupMode === opt.value ? 'primary' : 'neutral'"
          :variant="groupMode === opt.value ? 'solid' : 'ghost'" @click="update('groupMode', opt.value)">
          {{ t(opt.labelKey) }}
        </UButton>
      </UFieldGroup>
    </fieldset>

    <USeparator />

    <fieldset class="flex flex-col gap-2 border-0 p-0 m-0">
      <legend class="control-group-title mb-1.5">
        {{ t('controls.checkbox.state') }}
      </legend>
      <div class="grid grid-cols-2 gap-3">
        <UCheckbox :model-value="model.checked === true" :label="t('controls.checkbox.checked')" variant="card"
          color="primary" size="md" :ui="CARD_UI" @update:model-value="update('checked', $event === true)" />
        <UCheckbox :model-value="model.indeterminate === true" :label="t('controls.checkbox.indeterminate')"
          variant="card" color="primary" size="md" :ui="CARD_UI"
          @update:model-value="update('indeterminate', $event === true)" />
        <UCheckbox :model-value="model.required === true" :label="t('controls.checkbox.required')" variant="card"
          color="primary" size="md" :ui="CARD_UI" @update:model-value="update('required', $event === true)" />
        <UCheckbox :model-value="model.disabled === true" :label="t('controls.checkbox.disabled')" variant="card"
          color="primary" size="md" :ui="CARD_UI" @update:model-value="update('disabled', $event === true)" />
      </div>
    </fieldset>

    <USeparator />

    <!--
      ARIA. Single card spanning the full width — matches the State
      grid's visual language so the two sections read as a pair, but
      laid out 1-column because there is only one flag here today.
    -->
    <fieldset class="flex flex-col gap-2 border-0 p-0 m-0">
      <legend class="control-group-title mb-1.5">
        {{ t('controls.checkbox.aria') }}
      </legend>
      <UCheckbox :model-value="model.ariaChecked === true" :label="t('controls.checkbox.ariaChecked')" variant="card"
        color="primary" size="md" :ui="CARD_UI" @update:model-value="update('ariaChecked', $event === true)" />
    </fieldset>

    <USeparator />

    <!-- Form attributes -->
    <UFormField class="flex flex-col">
      <template #label>
        <span class="control-group-title">{{ t('controls.checkbox.name') }}</span>
      </template>
      <UInput :model-value="model.name ?? ''" :placeholder="t('controls.checkbox.namePlaceholder')" class="w-full"
        @update:model-value="update('name', String($event))" />
    </UFormField>

    <UFormField class="flex flex-col">
      <template #label>
        <span class="control-group-title">{{ t('controls.checkbox.value') }}</span>
      </template>
      <UInput :model-value="model.value ?? ''" :placeholder="t('controls.checkbox.valuePlaceholder')" class="w-full"
        @update:model-value="update('value', String($event))" />
    </UFormField>
  </div>
</template>
