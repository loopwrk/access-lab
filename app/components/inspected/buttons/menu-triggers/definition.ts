import { renderButton } from "../shared/render";
import { variants } from "../shared/variants";
import { linkWrapper } from "../shared/wrappers";
import type { ButtonProps } from "../shared/types";
import { targetSizeAA, targetSizeAAA } from "~/rules/buttons/shared/target-size";
import { focusableInAnchor } from "~/rules/buttons/shared/focusable-in-anchor";
import { focusNotVisible, focusLowContrast } from "~/rules/buttons/shared/focus-visible";
import { menuNoHasPopup } from "~/rules/buttons/menu-triggers/menu-no-haspopup";
import { menuNoExpanded } from "~/rules/buttons/menu-triggers/menu-no-expanded";
import { menuTriggerManualChecklist } from "~/rules/buttons/menu-triggers/manual-checklist";
import type { ComponentDefinition } from "~/types/component";

export const menuTriggerDefinition: ComponentDefinition<ButtonProps> = {
  id: "buttons-menu-triggers",
  name: "Menu Trigger",
  tagName: "button",

  defaultProps: {
    renderAs: "button-button",
    wrappers: [],
    label: "Account",
    value: "",
    name: "",
    src: "",
    alt: "",
    disabled: false,
    contentType: "text",
    focusRingEnabled: false,
    menuBehaviour: "aria-expanded-haspopup",
    menuOpen: false,
    menuShowControls: true,
  },

  variants: variants(["button-button", "button"]),

  // The form wrapper is deliberately omitted — a menu trigger inside a
  // form would default to type=submit and submit the form on click,
  // which is the wrong demo. The link wrapper is fine for the focusable-
  // in-anchor lesson.
  contextWrappers: [linkWrapper],


  domRules: [targetSizeAA, targetSizeAAA],

  rules: [
    focusableInAnchor,
    focusNotVisible,
    focusLowContrast,
    menuNoHasPopup,
    menuNoExpanded,
  ],
  primaryLearnTopicId: "menu-triggers",
  relatedLearnTopicIds: [
    "disclosure-triggers",
    "accessible-name",
    "vague-label",
    "button-types",
  ],
  relevantConcepts: ["button-element", "aria-state", "menu-pattern", "accessible-name"],
  manualChecklist: menuTriggerManualChecklist,
  render: renderButton,
  controlsComponent: defineAsyncComponent(
    () => import("./MenuTriggerControls.vue"),
  ),
  // The popup reveal is the feedback — the generic click toast would
  // pile on top of it.
  suppressDemoClickToast: true,
};
