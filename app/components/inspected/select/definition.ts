import { renderSelect } from "./render";
import { formSubmitWrapper } from "./wrappers";
import { selectManualChecklist } from "~/rules/select/manual-checklist";
import { selectNoLabel } from "~/rules/select/select-no-label";
import { selectOptionsEmpty } from "~/rules/select/select-options-empty";
import { selectNotKeyboard } from "~/rules/select/select-not-keyboard";
import type { ComponentDefinition } from "~/types/component";
import type { CssLength } from "~/composables/useUnitConversion";

export type SelectRenderAs
  = | "select-native"
    | "select-multiple"
    | "div-combobox";

export type SelectLabelAssociation
  = | "for-id"
    | "wrapping"
    | "aria-label"
    | "none";

export interface SelectProps {
  renderAs: SelectRenderAs;

  name: string;

  wrappers: string[];

  label: string;

  options: string[];

  selectedOption: string;

  labelAssociation: SelectLabelAssociation;

  required: boolean;
  disabled: boolean;
  hasPlaceholder: boolean;
  comboboxAriaControls: boolean;
  comboboxListboxRole: boolean;

  fontSize: CssLength;
  bg: string;
  fgText: string;
  borderColor: string;
}

export const selectDefinition: ComponentDefinition<SelectProps> = {
  id: "select",
  name: "Select",
  tagName: "select",

  defaultProps: {
    renderAs: "select-native",
    name: "ocean",
    wrappers: [],
    label: "Choose an ocean: ",
    options: ["Antarctic", "Arctic", "Atlantic", "Indian", "Pacific"],
    selectedOption: "",
    labelAssociation: "for-id",
    required: false,
    disabled: false,
    hasPlaceholder: false,
    comboboxAriaControls: false,
    comboboxListboxRole: false,
  },

  variants: [
    {
      key: "select-native",
      label: "<select>",
      description: "components.select.variants.select-native.description",
      status: "recommended",
      statusNote: "components.select.variants.select-native.statusNote",
      section: "<select> Element",
      seeAlsoTopicId: "select",
    },
    {
      key: "select-multiple",
      label: "<select multiple>",
      description: "components.select.variants.select-multiple.description",
      status: "info",
      statusNote: "components.select.variants.select-multiple.statusNote",
      section: "<select> Element",
      seeAlsoTopicId: "select",
    },
    {
      key: "div-combobox",
      label: "<div role=\"combobox\">",
      description: "components.select.variants.div-combobox.description",
      status: "avoid",
      statusNote: "components.select.variants.div-combobox.statusNote",
      section: "Custom alternative",
      seeAlsoTopicId: "select",
    },
  ],
  contextWrappers: [formSubmitWrapper],
  controls: [],
  rules: [selectNoLabel, selectOptionsEmpty, selectNotKeyboard],
  primaryLearnTopicId: "select",
  relatedLearnTopicIds: [
    "accessible-name",
    "vague-label",
    "native-rendering",
    "form-wrapping",
  ],
  relevantConcepts: [
    "form-control",
    "accessible-name",
    "form-context",
    "native-elements",
  ],
  manualChecklist: selectManualChecklist,
  render: renderSelect,
  controlsComponent: defineAsyncComponent(() => import("./SelectControls.vue")),
  suppressDemoClickToast: true,
};
