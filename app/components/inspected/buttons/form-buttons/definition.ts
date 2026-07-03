import { renderButton } from "../shared/render";
import { variants } from "../shared/variants";
import { formWrapper, linkWrapper, buttonWrapper } from "../shared/wrappers";
import type { ButtonProps } from "../shared/types";
import { targetSizeAA, targetSizeAAA } from "~/rules/buttons/shared/target-size";
import { focusableInAnchor } from "~/rules/buttons/shared/focusable-in-anchor";
import { focusNotVisible, focusLowContrast } from "~/rules/buttons/shared/focus-visible";
import { buttonManualChecklist } from "~/rules/buttons/shared/manual-checklist";
import type { ComponentDefinition } from "~/types/component";

export const formButtonDefinition: ComponentDefinition<ButtonProps> = {
  id: "buttons-form-buttons",
  name: "Form Button",
  tagName: "button",

  defaultProps: {
    renderAs: "button-submit",
    wrappers: ["form"],
    label: "Save changes",
    value: "",
    name: "",
    src: "/images/click-event-button.svg",
    alt: "",
    disabled: false,
    contentType: "text",
    focusRingEnabled: false,
  },

  variants: variants([
    "button-submit",
    "button-reset",
    "input-submit",
    "input-button",
    "input-reset",
    "input-image",
  ]),

  contextWrappers: [formWrapper, linkWrapper, buttonWrapper],


  domRules: [targetSizeAA, targetSizeAAA],

  rules: [
    focusableInAnchor,
    focusNotVisible,
    focusLowContrast,
  ],
  primaryLearnTopicId: "form-wrapping",
  relatedLearnTopicIds: [
    "button-types",
    "button-value-attribute",
    "accessible-name",
    "vague-label",
    "image-button-coordinates",
  ],
  relevantConcepts: ["button-element", "form-context", "accessible-name", "disabled-state"],
  manualChecklist: buttonManualChecklist,
  render: renderButton,
  controlsComponent: defineAsyncComponent(
    () => import("./FormButtonControls.vue"),
  ),
};
