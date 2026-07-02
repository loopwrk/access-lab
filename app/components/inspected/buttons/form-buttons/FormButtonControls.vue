<script setup lang="ts">
import type { BaseButtonProps } from "~/types/button";
import { formButtonDefinition } from "./definition";
import ContentSection from "~/components/studio/sections/ContentSection.vue";
import AriaSection from "~/components/studio/sections/AriaSection.vue";
import TextSection from "~/components/studio/sections/TextSection.vue";
import DimensionsSection from "~/components/studio/sections/DimensionsSection.vue";
import BorderSection from "~/components/studio/sections/BorderSection.vue";
import ColoursSection from "~/components/studio/sections/ColoursSection.vue";
import FocusSection from "~/components/studio/sections/FocusSection.vue";

const model = defineModel<Partial<BaseButtonProps> & { wrappers?: string[] }>({ required: true });

const tagName = formButtonDefinition.tagName;
const { naturalSize } = useNaturalSize(model, tagName);
const defaults = useButtonStudioDefaults(tagName);

const isImageInput = computed(() => model.value.renderAs === "input-image");
const isButtonTag = computed(() => !(model.value.renderAs ?? "button").startsWith("input-"));

// Switching to an `<input>` variant clears any icon contentType because
// inputs are void elements and can't host inner markup.
watch(isButtonTag, (buttonTag) => {
  if (!buttonTag && model.value.contentType === "icon") {
    model.value.contentType = "text";
  }
});

const VARIANT_DEFAULT_LABELS: Record<string, string> = {
  "button-submit": "Save changes",
  "button-reset": "Discard changes",
  "input-submit": "Save changes",
  "input-reset": "Discard changes",
};

const ALL_KNOWN_DEFAULTS = new Set<string>([
  ...Object.values(VARIANT_DEFAULT_LABELS),
  "",
]);

const VARIANTS_WRAPPED_IN_FORM_BY_DEFAULT = new Set([
  "button-submit",
  "button-reset",
  "input-submit",
  "input-reset",
  "input-image",
]);

const FORM_WRAPPER_KEY = "form";

watch(() => model.value.renderAs, (newRenderAs) => {
  // Swap to variant default label only when the user hasn't typed
  // something bespoke (current value matches any known default).
  if (ALL_KNOWN_DEFAULTS.has(model.value.label ?? "")) {
    model.value.label = VARIANT_DEFAULT_LABELS[newRenderAs ?? ""] ?? "";
  }

  // Variant choice wins for the container: submit-like variants force
  // Form; non-submit variants only clear Form (Link or Button container
  // survives).
  const shouldWrap = VARIANTS_WRAPPED_IN_FORM_BY_DEFAULT.has(newRenderAs ?? "");
  const currentKey = (model.value.wrappers ?? [])[0];
  if (shouldWrap) {
    if (currentKey !== FORM_WRAPPER_KEY) model.value.wrappers = [FORM_WRAPPER_KEY];
  } else if (currentKey === FORM_WRAPPER_KEY) {
    model.value.wrappers = [];
  }
});
</script>

<template>
  <div class="flex flex-col gap-4">
    <ContentSection v-model="model" />
    <USeparator />

    <AriaSection v-model="model" />
    <USeparator />

    <TextSection
      v-if="!isImageInput"
      v-model="model"
      :defaults="defaults"
    />
    <USeparator v-if="!isImageInput" />

    <DimensionsSection
      v-model="model"
      :defaults="defaults"
      :natural-size="naturalSize"
    />
    <USeparator />

    <BorderSection
      v-model="model"
      :defaults="defaults"
    />
    <USeparator />

    <ColoursSection
      v-model="model"
      :defaults="defaults"
      :hide-bg-and-text="isImageInput"
    />
    <USeparator />

    <FocusSection v-model="model" />
  </div>
</template>
