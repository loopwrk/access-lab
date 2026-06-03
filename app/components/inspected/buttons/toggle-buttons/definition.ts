import { renderButton } from "../shared/render";
import { variants } from "../shared/variants";
import { formWrapper, linkWrapper } from "../shared/wrappers";
import type { ButtonProps } from "../shared/types";
import { targetSizeAA, targetSizeAAA } from "~/rules/buttons/shared/target-size";
import { focusableInAnchor } from "~/rules/buttons/shared/focusable-in-anchor";
import { focusNotVisible, focusLowContrast } from "~/rules/buttons/shared/focus-visible";
import { toggleStateMissing } from "~/rules/buttons/toggle-buttons/toggle-state-missing";
import { toggleWrongAttribute } from "~/rules/buttons/toggle-buttons/toggle-wrong-attribute";
import { buttonManualChecklist } from "~/rules/buttons/shared/manual-checklist";
import type { ComponentDefinition } from "~/types/component";

export const toggleButtonDefinition: ComponentDefinition<ButtonProps> = {
  id: "buttons-toggle-buttons",
  name: "Toggle Button",
  tagName: "button",

  defaultProps: {
    renderAs: "button-button",
    wrappers: [],
    label: "Mute",
    value: "",
    name: "",
    src: "",
    alt: "",
    disabled: false,
    contentType: "text",
    focusRingEnabled: false,
    toggleBehaviour: "aria-pressed",
    togglePressed: false,
  },

  variants: variants(["button-button", "button"]),

  contextWrappers: [formWrapper, linkWrapper],

  controls: [],

  rules: [
    targetSizeAA,
    targetSizeAAA,
    focusableInAnchor,
    focusNotVisible,
    focusLowContrast,
    toggleStateMissing,
    toggleWrongAttribute,
  ],
  primaryLearnTopicId: "toggle-buttons",
  relevantConcepts: ["button-element", "aria-state", "accessible-name"],
  manualChecklist: buttonManualChecklist,
  render: renderButton,
  controlsComponent: defineAsyncComponent(
    () => import("./ToggleButtonControls.vue"),
  ),
};
