<script setup lang="ts">
import type { BaseButtonProps } from "~/types/button";
import type { DisclosureBehaviour } from "../shared/types";
import { disclosureTriggerDefinition } from "./definition";
import ResetDefaultsSection from "~/components/studio/sections/ResetDefaultsSection.vue";
import ContentSection from "~/components/studio/sections/ContentSection.vue";
import AriaSection from "~/components/studio/sections/AriaSection.vue";
import DisclosureStateSection from "~/components/studio/sections/DisclosureStateSection.vue";
import TextSection from "~/components/studio/sections/TextSection.vue";
import DimensionsSection from "~/components/studio/sections/DimensionsSection.vue";
import BorderSection from "~/components/studio/sections/BorderSection.vue";
import ColoursSection from "~/components/studio/sections/ColoursSection.vue";
import FocusSection from "~/components/studio/sections/FocusSection.vue";

type DisclosureModel = Partial<BaseButtonProps> & {
  wrappers?: string[];
  disclosureBehaviour?: DisclosureBehaviour;
  disclosureExpanded?: boolean;
  disclosureShowControls?: boolean;
};

const model = defineModel<DisclosureModel>({ required: true });

const tagName = disclosureTriggerDefinition.tagName;
const { naturalSize } = useNaturalSize(model, tagName);
const defaults = useButtonStudioDefaults(tagName);

// Iframe interaction bridge: the shell reports each trigger activation as a
// `demo:activate` fact (see the data-al-interaction marker on the rendered
// wrapper). We decide what it means here — flip disclosureExpanded, which
// re-renders the iframe with the new ARIA state (when the behaviour exposes
// it) and reveals or hides the sibling panel via the `hidden` attribute.
// Listening for the fact rather than `demo:click` means a type-less <button>
// (which the shell treats as a submit elsewhere) still toggles the panel.
usePreviewMessage({
  "demo:activate": () => {
    model.value.disclosureExpanded = !model.value.disclosureExpanded;
  },
});
</script>

<template>
  <div class="flex flex-col gap-4">
    <ResetDefaultsSection v-model="model" />
    <USeparator />

    <ContentSection v-model="model" />
    <USeparator />

    <AriaSection v-model="model" />
    <USeparator />

    <DisclosureStateSection v-model="model" />
    <USeparator />

    <TextSection
      v-model="model"
      :defaults="defaults"
    />
    <USeparator />

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
    />
    <USeparator />

    <FocusSection v-model="model" />
  </div>
</template>
