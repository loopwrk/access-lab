<script setup lang="ts">
import type { BaseButtonProps } from "~/types/button";
import type { ButtonRenderAs, SwitchBehaviour } from "../shared/types";
import { switchDefinition } from "./definition";
import ResetDefaultsSection from "~/components/ButtonStudio/sections/ResetDefaultsSection.vue";
import ContentSection from "~/components/ButtonStudio/sections/ContentSection.vue";
import AriaSection from "~/components/ButtonStudio/sections/AriaSection.vue";
import SwitchStateSection from "~/components/ButtonStudio/sections/SwitchStateSection.vue";
import TextSection from "~/components/ButtonStudio/sections/TextSection.vue";
import DimensionsSection from "~/components/ButtonStudio/sections/DimensionsSection.vue";
import BorderSection from "~/components/ButtonStudio/sections/BorderSection.vue";
import ColoursSection from "~/components/ButtonStudio/sections/ColoursSection.vue";
import FocusSection from "~/components/ButtonStudio/sections/FocusSection.vue";

type SwitchModel = Partial<BaseButtonProps> & {
  renderAs?: ButtonRenderAs;
  wrappers?: string[];
  switchBehaviour?: SwitchBehaviour;
  switchChecked?: boolean;
  switchPillStyling?: boolean;
};

const model = defineModel<SwitchModel>({ required: true });

const tagName = switchDefinition.tagName;
const { naturalSize } = useNaturalSize(model, tagName);
const defaults = useButtonStudioDefaults(tagName);

// Iframe click bridge. When the rendered control is activated in the
// iframe (button click or native-checkbox change), preview-shell posts
// `demo:click` back; we flip switchChecked so the new state re-renders
// and a real screen reader announces it. The input-checkbox-switch
// variant is always an active switch regardless of `switchBehaviour`
// (the markup hardcodes role="switch"), so we skip the behaviour gate
// for that variant. The dark-mode background flip is driven from the
// render output's CSS (a :has() rule reads aria-checked), so no extra
// side-effect is needed here.
usePreviewMessage({
  "demo:click": () => {
    if (model.value.renderAs !== "input-checkbox-switch") {
      const behaviour = model.value.switchBehaviour;
      if (!behaviour || behaviour === "none") return;
    }
    model.value.switchChecked = !model.value.switchChecked;
  },
});
</script>

<template>
  <div class="flex flex-col gap-4">
    <ResetDefaultsSection v-model="model" />
    <USeparator />

    <ContentSection
      v-model="model"
      :hide-content-type="model.switchPillStyling === true"
    />
    <USeparator />

    <AriaSection v-model="model" />
    <USeparator />

    <template v-if="model.renderAs !== 'input-checkbox-switch'">
      <SwitchStateSection v-model="model" />
      <USeparator />
    </template>

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
