import { renderButton } from "../shared/render";
import { variants } from "../shared/variants";
import { formWrapper, linkWrapper } from "../shared/wrappers";
import type { ButtonProps } from "../shared/types";
import {
  targetSizeAA,
  targetSizeAAA,
} from "~/rules/buttons/shared/target-size";
import { focusableInAnchor } from "~/rules/buttons/shared/focusable-in-anchor";
import {
  focusNotVisible,
  focusLowContrast,
} from "~/rules/buttons/shared/focus-visible";
import { ariaLabelWithoutVisibleContent } from "~/rules/buttons/shared/aria-label-without-visible-content";
import { buttonManualChecklist } from "~/rules/buttons/shared/manual-checklist";
import type { ComponentDefinition } from "~/types/component";

export const actionTriggerDefinition: ComponentDefinition<ButtonProps> = {
  id: "buttons-action-triggers",
  name: "Action buttons",
  tagName: "button",

  defaultProps: {
    renderAs: "button-button",
    wrappers: [],
    label: "Trigger click event",
    value: "",
    name: "",
    src: "",
    alt: "",
    disabled: false,
    contentType: "text",
    focusRingEnabled: false,
  },

  variants: variants(["button-button", "button"]),

  contextWrappers: [formWrapper, linkWrapper],

  controls: [],

  domRules: [targetSizeAA, targetSizeAAA],

  rules: [
    focusableInAnchor,
    focusNotVisible,
    focusLowContrast,
    ariaLabelWithoutVisibleContent,
  ],
  manualChecklist: buttonManualChecklist,
  render: renderButton,
  controlsComponent: defineAsyncComponent(
    () => import("./ActionTriggerControls.vue"),
  ),
  relatedLearnTopicIds: [
    "button-types",
    "accessible-name",
    "vague-label",
    "button-disabled-states",
    "native-rendering",
  ],
  relevantConcepts: [
    "button-element",
    "accessible-name",
    "disabled-state",
    "native-elements",
  ],
};
