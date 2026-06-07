import { renderCheckbox } from "./render";
import { formSubmitWrapper } from "./wrappers";
import { checkboxManualChecklist } from "~/rules/checkbox/manual-checklist";
import { checkboxGroupNoFieldset } from "~/rules/checkbox/group-no-fieldset";
import { checkboxAriaCheckedRedundant } from "~/rules/checkbox/aria-checked-redundant";
import type { ComponentDefinition } from "~/types/component";
import type { CssLength } from "~/composables/useUnitConversion";

export type CheckboxLabelAssociation =
  | "for-id" // <label for="x"><input id="x"> + label sibling
  | "wrapping" // <label><input> Text </label>
  | "aria-label" // <input aria-label="..."> (no visible text label)
  | "none"; // <input> with no accessible name — anti-pattern

/**
 * How many checkboxes to render and whether they sit inside a
 * <fieldset>/<legend>. Groups without a fieldset are an anti-pattern
 * that axe-core does not flag — that's our custom rule's job.
 */
export type CheckboxGroupMode =
  | "single" // one checkbox + label
  | "group-with-fieldset" // multiple checkboxes inside <fieldset><legend>
  | "group-no-fieldset"; // multiple checkboxes, no fieldset (anti-pattern)

export interface CheckboxProps {
  renderAs: string;

  name: string;
  value: string;

  // Optional surrounding context (e.g. <form>). Read by
  // ComponentStudio's applyContextWrappers chain.
  wrappers: string[];

  label: string;
  labelAssociation: CheckboxLabelAssociation;

  checked: boolean;
  indeterminate: boolean;

  // Validation
  required: boolean;
  disabled: boolean;

  groupMode: CheckboxGroupMode;
  groupItems: string[];

  /**
   * Whether to emit `aria-checked` on the rendered element. For the
   * div-checkbox variant this is the only mechanism that exposes state
   * to assistive technology, so it's effectively required. For the
   * native input-checkbox variant it's redundant — the browser
   * already exposes checked state through the built-in checkbox role.
   * The `checkbox-aria-checked-redundant` rule warns about that case.
   */
  ariaChecked: boolean;

  fontSize: CssLength;
  bg: string;
  fgText: string;
  borderColor: string;
}

export const checkboxDefinition: ComponentDefinition<CheckboxProps> = {
  id: "checkbox",
  name: "Checkbox",
  tagName: "input",

  defaultProps: {
    renderAs: "input-checkbox",
    name: "newsletter",
    value: "subscribe",
    wrappers: [],
    label: "Subscribe to the newsletter",
    labelAssociation: "for-id",
    checked: false,
    indeterminate: false,
    required: false,
    disabled: false,
    groupMode: "single",
    groupItems: ["Updates", "Promotions", "Newsletter"],
    ariaChecked: false,
  },

  variants: [
    {
      key: "input-checkbox",
      label: '<input type="checkbox">',
      status: "recommended",
      statusNote: "components.checkbox.variants.input-checkbox.statusNote",
      section: "<input> Element",
    },
    {
      key: "div-checkbox",
      label: '<div role="checkbox">',
      status: "info",
      statusNote: "components.checkbox.variants.div-checkbox.statusNote",
      section: "Custom Element",
    },
  ],
  contextWrappers: [formSubmitWrapper],
  controls: [],
  rules: [checkboxGroupNoFieldset, checkboxAriaCheckedRedundant],
  primaryLearnTopicId: "checkbox",
  relatedLearnTopicIds: [
    "radio",
    "switches",
    "accessible-name",
    "form-wrapping",
    "vague-label",
  ],
  relevantConcepts: [
    "form-control",
    "accessible-name",
    "form-context",
    "native-elements",
  ],
  manualChecklist: checkboxManualChecklist,
  render: renderCheckbox,
  controlsComponent: defineAsyncComponent(
    () => import("./CheckboxControls.vue"),
  ),
  suppressDemoClickToast: true,
};
