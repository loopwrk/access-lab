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
import { switchNoRole } from "~/rules/buttons/switches/switch-no-role";
import { switchWrongAttribute } from "~/rules/buttons/switches/switch-wrong-attribute";
import { buttonManualChecklist } from "~/rules/buttons/shared/manual-checklist";
import type { ComponentDefinition } from "~/types/component";

export const switchDefinition: ComponentDefinition<ButtonProps> = {
  id: "buttons-switches",
  name: "Switch",
  tagName: "button",

  defaultProps: {
    renderAs: "button-button",
    wrappers: [],
    label: "Toggle notification",
    value: "",
    name: "",
    src: "",
    alt: "",
    disabled: false,
    contentType: "text",
    focusRingEnabled: false,
    switchBehaviour: "role-switch",
    switchChecked: false,
    switchPillStyling: true,
  },

  variants: variants(["button-button", "button", "input-checkbox-switch"]),

  contextWrappers: [formWrapper, linkWrapper],

  controls: [],

  rules: [
    targetSizeAA,
    targetSizeAAA,
    focusableInAnchor,
    focusNotVisible,
    focusLowContrast,
    switchNoRole,
    switchWrongAttribute,
  ],
  primaryLearnTopicId: "switches",
  manualChecklist: buttonManualChecklist,
  render: renderButton,
  controlsComponent: defineAsyncComponent(() => import("./SwitchControls.vue")),
  // The switches page surfaces its own state-driven notification toast
  // (see SwitchControls.vue). The generic click toast would fire on
  // top of it on every flip, so we silence it here.
  suppressDemoClickToast: true,
};
