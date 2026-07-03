<script setup lang="ts">
/**
 * Mounts the full studio for a real (non-placeholder) component definition.
 *
 * Controls panel is sourced from `definition.controlsComponent`
 */
import type { ComponentDefinition } from "~/types/component";

const props = defineProps<{
  definition: ComponentDefinition<Record<string, unknown>>;
}>();

const { t } = useI18n();
const { componentProps } = useInspectedComponent(props.definition);

const { dirty: canReset, reset: resetToDefaults } = useComponentReset(
  componentProps,
  props.definition.defaultProps,
);

const resetLabels = computed(() => ({
  action: t("controls.reset.action"),
  ariaLabel: t("controls.reset.ariaLabel"),
  enabledTitle: t("controls.reset.enabledTitle"),
  disabledTitle: t("controls.reset.disabledTitle"),
}));
const {
  activeComponentName,
  activeLearnTopicId,
  activeRelevantConcepts,
  activeRelatedLearnTopicIds,
} = useActiveComponent();

const renderAs = computed({
  get: () => (componentProps.value.renderAs as string | undefined) ?? "",
  set: (next: string) => {
    componentProps.value = { ...componentProps.value, renderAs: next };
  },
});

const variantPlaceholder = computed(() =>
  t("variantPicker.placeholderForElement", { name: props.definition.name }),
);

const enabledWrappers = computed({
  get: () => (componentProps.value.wrappers as string[] | undefined) ?? [],
  set: (next: string[]) => {
    componentProps.value = { ...componentProps.value, wrappers: next };
  },
});

/**
 * Context-wrappers actually available for the current variant. A wrapper
 * may declare `availableFor(renderAs)` to opt out of certain variants -
 * for example, `<button>` wrapping another `<button>` can't exist at
 * runtime because the HTML parser auto-closes the outer button.
 */
const availableContextWrappers = computed(() => {
  const all = props.definition.contextWrappers ?? [];
  const renderAs = componentProps.value.renderAs as string | undefined;
  return all.filter((w) => w.availableFor?.(renderAs) ?? true);
});

watch(availableContextWrappers, (next) => {
  const current = (componentProps.value.wrappers as string[] | undefined)?.[0];
  if (!current) return;
  if (!next.some((w) => w.key === current)) {
    componentProps.value = { ...componentProps.value, wrappers: [] };
  }
});

const toast = useToast();

interface FormSubmittedEntry {
  name: string;
  value: string;
}

/**
 * Build the description text for the form-submitted toast. Each
 * checked checkbox / filled input contributes a `name=value` pair;
 * an empty form (e.g. all checkboxes unchecked) renders as the
 * "(no payload)" label.
 */
function buildSubmittedDescription(entries: FormSubmittedEntry[]): string {
  if (!entries.length) return t("studio.toasts.formSubmittedNoPayload");
  return entries.map((e) => `${e.name}=${e.value}`).join(", ");
}

const formSubmittedAction = computed(() => [
  {
    label: t("studio.toasts.formSubmittedLink"),
    onClick: () => openLearnTopic("form-wrapping"),
    color: "neutral" as const,
    variant: "link" as const,
  },
]);

const imageSubmitAction = computed(() => [
  {
    label: t("studio.toasts.imageSubmitLink"),
    onClick: () => openLearnTopic("image-button-coordinates"),
    color: "neutral" as const,
    variant: "link" as const,
  },
]);

const submitNoFormAction = computed(() => [
  {
    label: t("studio.toasts.submitNoFormLink"),
    onClick: () => openLearnTopic("button-types"),
    color: "neutral" as const,
    variant: "link" as const,
  },
]);

usePreviewMessage({
  "demo:click": () => {
    if (props.definition.suppressDemoClickToast) return;
    toast.add({
      title: t("studio.toasts.demoAction"),
      icon: "i-lucide-circle-check",
      color: "success",
    });
  },
  "form:submitted": (data) => {
    toast.add({
      title: t("studio.toasts.formSubmitted"),
      description: buildSubmittedDescription(data.entries),
      icon: "i-lucide-send",
      color: "info",
      // Two optional follow-up links, mutually exclusive by construction:
      //  - a type-less <button> defaulted to submit (the implicit-submit
      //    pitfall) → "Why did the button send a form submission?"
      //  - an <input type="image"> submit that also posts click
      //    coordinates → "Why is the button attempting to submit coordinates?"
      // An explicit type="submit" button is doing exactly what the
      // developer wrote, so neither prompt applies.
      actions: data.wasImplicitSubmit
        ? formSubmittedAction.value
        : data.wasImageSubmit
          ? imageSubmitAction.value
          : undefined,
    });
  },
  "form:reset": () => {
    toast.add({
      title: t("studio.toasts.formReset"),
      icon: "i-lucide-rotate-ccw",
      color: "warning",
    });
  },
  "form:submitMissingForm": () => {
    toast.add({
      title: t("studio.toasts.submitNoForm"),
      icon: "i-lucide-circle-alert",
      color: "error",
      actions: submitNoFormAction.value,
    });
  },
  "form:resetMissingForm": () => {
    toast.add({
      title: t("studio.toasts.resetNoForm"),
      icon: "i-lucide-circle-alert",
      color: "error",
    });
  },
});

onMounted(() => {
  activeComponentName.value = props.definition.name;
  activeLearnTopicId.value = props.definition.primaryLearnTopicId ?? null;
  activeRelevantConcepts.value = props.definition.relevantConcepts ?? [];
  activeRelatedLearnTopicIds.value = props.definition.relatedLearnTopicIds ?? [];
});

onBeforeUnmount(() => {
  activeComponentName.value = null;
  activeLearnTopicId.value = null;
  activeRelevantConcepts.value = [];
  activeRelatedLearnTopicIds.value = [];
});
</script>

<template>
  <div class="flex flex-1 h-full min-h-0">
    <div class="flex-1 flex min-w-0">
      <PreviewIframe ref="previewRef" />
    </div>
  </div>
  <Teleport
    v-if="props.definition.variants?.length"
    to="#preview-toolbar-variant"
  >
    <VariantPicker
      v-model="renderAs"
      :variants="props.definition.variants"
      :placeholder="variantPlaceholder"
    />
  </Teleport>
  <Teleport
    v-if="availableContextWrappers.length"
    to="#preview-toolbar-wrappers"
  >
    <WrapperToggles
      v-model="enabledWrappers"
      :options="availableContextWrappers"
      :element-name="props.definition.tagName"
    />
  </Teleport>
  <Teleport :to="`#${UTILITY_RESET_CELL_ID}`">
    <ResetControl
      :disabled="!canReset"
      :labels="resetLabels"
      @reset="resetToDefaults"
    />
  </Teleport>
  <Teleport
    v-if="props.definition.controlsComponent"
    :to="`#${INSPECTOR_PANEL_IDS.controls}`"
  >
    <component
      :is="props.definition.controlsComponent"
      v-model="componentProps"
    />
  </Teleport>
  <Teleport :to="`#${INSPECTOR_PANEL_IDS.issues}`">
    <IssuesPanel />
  </Teleport>
  <Teleport :to="`#${INSPECTOR_PANEL_IDS.manual}`">
    <ManualReviewPanel :checklist="props.definition.manualChecklist" />
  </Teleport>
  <Teleport :to="`#${INSPECTOR_PANEL_IDS.learn}`">
    <LearnPanel />
  </Teleport>
</template>
