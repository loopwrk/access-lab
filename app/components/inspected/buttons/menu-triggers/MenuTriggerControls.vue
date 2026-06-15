<script setup lang="ts">
import type { BaseButtonProps } from "~/types/button";
import type { MenuBehaviour } from "../shared/types";
import { menuTriggerDefinition } from "./definition";
import ResetDefaultsSection from "~/components/ButtonStudio/sections/ResetDefaultsSection.vue";
import ContentSection from "~/components/ButtonStudio/sections/ContentSection.vue";
import AriaSection from "~/components/ButtonStudio/sections/AriaSection.vue";
import MenuStateSection from "~/components/ButtonStudio/sections/MenuStateSection.vue";
import TextSection from "~/components/ButtonStudio/sections/TextSection.vue";
import DimensionsSection from "~/components/ButtonStudio/sections/DimensionsSection.vue";
import BorderSection from "~/components/ButtonStudio/sections/BorderSection.vue";
import ColoursSection from "~/components/ButtonStudio/sections/ColoursSection.vue";
import FocusSection from "~/components/ButtonStudio/sections/FocusSection.vue";

type MenuModel = Partial<BaseButtonProps> & {
  wrappers?: string[];
  menuBehaviour?: MenuBehaviour;
  menuOpen?: boolean;
  menuShowControls?: boolean;
};

const model = defineModel<MenuModel>({ required: true });

const tagName = menuTriggerDefinition.tagName;
const { naturalSize } = useNaturalSize(model, tagName);
const defaults = useButtonStudioDefaults(tagName);

// Iframe interaction bridge: the shell reports each trigger activation as a
// `demo:activate` fact (see the data-al-interaction marker on the rendered
// wrapper). We decide what it means here — flip menuOpen, which re-renders the
// iframe with or without the `hidden` attribute on the popup. Listening for the
// fact rather than `demo:click` means a type-less <button> (which the shell
// treats as a submit elsewhere) still opens the popup. The studio deliberately
// does not wire arrow-key navigation, Escape, or outside-click — those belong
// in the production keyboard contract and are covered by the manual checklist.
usePreviewMessage({
  "demo:activate": () => {
    model.value.menuOpen = !model.value.menuOpen;
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

    <MenuStateSection v-model="model" />
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
