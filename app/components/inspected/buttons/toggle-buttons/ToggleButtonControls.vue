<script setup lang="ts">
import type { BaseButtonProps } from "~/types/button";
import type { ToggleBehaviour } from "../shared/types";
import { toggleButtonDefinition } from "./definition";
import ContentSection from "~/components/studio/sections/ContentSection.vue";
import AriaSection from "~/components/studio/sections/AriaSection.vue";
import ToggleStateSection from "~/components/studio/sections/ToggleStateSection.vue";
import TextSection from "~/components/studio/sections/TextSection.vue";
import DimensionsSection from "~/components/studio/sections/DimensionsSection.vue";
import BorderSection from "~/components/studio/sections/BorderSection.vue";
import ColoursSection from "~/components/studio/sections/ColoursSection.vue";
import FocusSection from "~/components/studio/sections/FocusSection.vue";

type ToggleModel = Partial<BaseButtonProps> & {
  wrappers?: string[];
  toggleBehaviour?: ToggleBehaviour;
  togglePressed?: boolean;
};

const model = defineModel<ToggleModel>({ required: true });

const tagName = toggleButtonDefinition.tagName;
const { naturalSize } = useNaturalSize(model, tagName);
const defaults = useButtonStudioDefaults(tagName);

// Iframe click bridge: when the inspected button is activated inside
// the iframe, preview-shell.html posts `demo:click` back to the host.
// For an active toggle behaviour, that activation flips togglePressed
// here — which re-renders the iframe with the new ARIA state and the
// pressed-state CSS class, so a real screen reader announces the change.
usePreviewMessage({
  "demo:click": () => {
    const behaviour = model.value.toggleBehaviour;
    if (!behaviour || behaviour === "none") return;
    model.value.togglePressed = !model.value.togglePressed;
  },
});
</script>

<template>
  <div class="flex flex-col gap-4">
    <ContentSection v-model="model" />
    <USeparator />

    <AriaSection
      v-model="model"
      hide-disabled
    />
    <USeparator />

    <ToggleStateSection v-model="model" />
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
