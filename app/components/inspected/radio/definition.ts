import { renderRadio } from "./render";
import { formSubmitWrapper } from "./wrappers";
import { radioManualChecklist } from "~/rules/radio/manual-checklist";
import { radioGroupNoFieldset } from "~/rules/radio/group-no-fieldset";
import type { ComponentDefinition } from "~/types/component";
import type { CssLength } from "~/composables/useUnitConversion";

export type RadioLabelAssociation
  = | "for-id"
    | "wrapping"
    | "aria-label"
    | "none";

export type RadioGroupMode
  = | "group-with-fieldset" // correct: <fieldset><legend>…
    | "group-no-fieldset"; // anti-pattern: visible heading only

export interface RadioProps {
  renderAs: string;

  name: string;

  wrappers: string[];

  label: string;

  groupItems: string[];

  selectedItem: string;

  labelAssociation: RadioLabelAssociation;
  groupMode: RadioGroupMode;

  required: boolean;
  disabled: boolean;

  fontSize: CssLength;
  bg: string;
  fgText: string;
  borderColor: string;
}

export const radioDefinition: ComponentDefinition<RadioProps> = {
  id: "radio",
  name: "Radio",
  tagName: "input",

  defaultProps: {
    renderAs: "input-radio",
    name: "plan",
    wrappers: [],
    label: "Which plan would you like?",
    groupItems: ["Free", "Pro", "Enterprise"],
    selectedItem: "Free",
    labelAssociation: "for-id",
    groupMode: "group-with-fieldset",
    required: false,
    disabled: false,
  },

  variants: [
    {
      key: "input-radio",
      label: "<input type=\"radio\">",
      status: "recommended",
      statusNote: "components.radio.variants.input-radio.statusNote",
      section: "<input> Element",
    },
  ],
  contextWrappers: [formSubmitWrapper],
  controls: [],
  rules: [radioGroupNoFieldset],
  primaryLearnTopicId: "radio",
  relatedLearnTopicIds: [
    "checkbox",
    "accessible-name",
    "form-wrapping",
    "vague-label",
  ],
  relevantConcepts: ["form-control", "accessible-name", "form-context", "aria-state", "native-elements"],
  manualChecklist: radioManualChecklist,
  render: renderRadio,
  controlsComponent: defineAsyncComponent(() => import("./RadioControls.vue")),
  suppressDemoClickToast: true,
};
