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
import { disclosureNoState } from "~/rules/buttons/disclosure-triggers/disclosure-no-state";
import { disclosureStateOutOfSync } from "~/rules/buttons/disclosure-triggers/disclosure-state-out-of-sync";
import { buttonManualChecklist } from "~/rules/buttons/shared/manual-checklist";
import type { ComponentDefinition } from "~/types/component";

export const disclosureTriggerDefinition: ComponentDefinition<ButtonProps> = {
  id: "buttons-disclosure-triggers",
  name: "Disclosure Trigger",
  tagName: "button",

  defaultProps: {
    renderAs: "button-button",
    wrappers: [],
    label: "Show details",
    value: "",
    name: "",
    src: "",
    alt: "",
    disabled: false,
    contentType: "text",
    focusRingEnabled: false,
    disclosureBehaviour: "aria-expanded",
    disclosureExpanded: false,
    disclosureShowControls: true,
    disclosurePanelText:
      "Change the disclosure behaviour in the controls panel. Notice how the attributes change in response when triggering the button.",
  },

  variants: variants(["button-button", "button"]),

  contextWrappers: [formWrapper, linkWrapper],

  controls: [],

  domRules: [targetSizeAA, targetSizeAAA],

  rules: [
    focusableInAnchor,
    focusNotVisible,
    focusLowContrast,
    disclosureNoState,
    disclosureStateOutOfSync,
  ],
  primaryLearnTopicId: "disclosure-triggers",
  relatedLearnTopicIds: [
    "accessible-name",
    "vague-label",
    "menu-triggers",
    "native-rendering",
  ],
  relevantConcepts: ["button-element", "aria-state", "disclosure-pattern", "accessible-name"],
  manualChecklist: buttonManualChecklist,
  render: renderButton,
  controlsComponent: defineAsyncComponent(
    () => import("./DisclosureControls.vue"),
  ),
  // The panel reveal IS the feedback — a generic "Click event fired"
  // toast on top of that would be noise.
  suppressDemoClickToast: true,
};
