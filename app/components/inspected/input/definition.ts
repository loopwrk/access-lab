import { renderInput } from "./render";
import { formSubmitWrapper } from "./wrappers";
import { inputManualChecklist } from "~/rules/input/manual-checklist";
import { placeholderContrast } from "~/rules/input/placeholder-contrast";
import { ariaLabelWithoutVisibleLabel } from "~/rules/input/aria-label-without-visible-label";
import { numberInputForFormattedValue } from "~/rules/input/number-for-formatted-value";
import { missingAutocomplete } from "~/rules/input/missing-autocomplete";
import type { ComponentDefinition } from "~/types/component";
import type { CssLength } from "~/composables/useUnitConversion";

/**
 * Visible label association strategy. Mirrors the pattern used by the
 * checkbox and radio components — each mode renders differently and
 * produces a different screen-reader announcement.
 */
export type InputLabelAssociation
  = | "for-id" // <label for="x"><input id="x"> + label sibling
    | "wrapping" // <label><input> Text </label>
    | "aria-label" // <input aria-label="..."> (no visible text label)
    | "none" // <input> with no accessible name — anti-pattern
    | "title"; // <input title="..."> — named only by a tooltip (anti-pattern; trips axe label-title-only)

/**
 * Set of `type=` values the studio surfaces in the variant picker.
 * Drives the variant chip; the active value lives in `props.renderAs`
 * matching the pattern used by every other inspected component.
 */
export type InputType
  = | "text"
    | "email"
    | "tel"
    | "url"
    | "password"
    | "number"
    | "search";

export type InputStyleTarget = "label" | "input" | "placeholder" | "helpText";

export interface InputTextStyleSlice {
  fontSize?: CssLength;
  fgText?: string;
}

export interface InputProps {
  renderAs: InputType;
  label: string;
  placeholder: string;
  helpText: string;
  name: string;
  /**
   * The `autocomplete` token (e.g. "email", "tel", "postal-code"). When set,
   * the renderer emits it on the input. An invalid value trips axe's own
   * `autocomplete-valid`; a missing value on an identifiable field trips the
   * `input-missing-autocomplete` custom rule.
   */
  autocomplete?: string;
  required: boolean;
  disabled: boolean;
  labelAssociation: InputLabelAssociation;

  /**
   * When `renderAs === "search"`, an optional visible magnifying-glass
   * icon to render alongside the input. Signals "this is a search
   * field" to sighted users and softens the
   * `aria-label-without-visible-label` rule from serious to moderate
   * when used together with the `aria-label` association mode.
   */
  showSearchIcon: boolean;

  ariaHidden: boolean;
  ariaLabel: boolean;

  // Optional surrounding context (e.g. <form>). Read by
  // ComponentStudio's applyContextWrappers chain.
  wrappers: string[];

  // Input element's style (the "input" target slice). Kept flat at
  // the top level for backwards compatibility with the original
  // controls; semantically equivalent to an `inputStyle` slice.
  fontSize: CssLength;
  bg: string;
  fgText: string;
  borderColor: string;

  // Per-target style slices for the other three targets. Placeholder
  // requires injecting a `::placeholder` CSS rule (inline style won't
  // reach the pseudo-element) — handled by the renderer.
  labelStyle?: InputTextStyleSlice;
  placeholderStyle?: InputTextStyleSlice;
  helpTextStyle?: InputTextStyleSlice;
}

export const inputDefinition: ComponentDefinition<InputProps> = {
  id: "input",
  name: "Input",
  tagName: "input",
  defaultProps: {
    renderAs: "email",
    label: "Email",
    placeholder: "",
    helpText: "",
    name: "email",
    required: false,
    disabled: false,
    labelAssociation: "for-id",
    showSearchIcon: false,
    ariaHidden: false,
    ariaLabel: false,
    wrappers: [],
  },
  variants: [
    {
      key: "text",
      label: "<input type=\"text\">",
      status: "info",
      statusNote: "components.input.variants.text.statusNote",
      section: "<input> Type",
    },
    {
      key: "email",
      label: "<input type=\"email\">",
      status: "info",
      statusNote: "components.input.variants.email.statusNote",
      section: "<input> Type",
    },
    {
      key: "tel",
      label: "<input type=\"tel\">",
      status: "info",
      statusNote: "components.input.variants.tel.statusNote",
      section: "<input> Type",
    },
    {
      key: "url",
      label: "<input type=\"url\">",
      status: "info",
      statusNote: "components.input.variants.url.statusNote",
      section: "<input> Type",
    },
    {
      key: "password",
      label: "<input type=\"password\">",
      status: "info",
      statusNote: "components.input.variants.password.statusNote",
      section: "<input> Type",
    },
    {
      key: "number",
      label: "<input type=\"number\">",
      status: "info",
      statusNote: "components.input.variants.number.statusNote",
      section: "<input> Type",
    },
    {
      key: "search",
      label: "<input type=\"search\">",
      status: "info",
      statusNote: "components.input.variants.search.statusNote",
      section: "<input> Type",
    },
  ],
  contextWrappers: [formSubmitWrapper],
  controls: [],
  rules: [
    placeholderContrast,
    ariaLabelWithoutVisibleLabel,
    numberInputForFormattedValue,
    missingAutocomplete,
  ],
  manualChecklist: inputManualChecklist,
  render: renderInput,
  controlsComponent: defineAsyncComponent(() => import("./InputControls.vue")),
  relatedLearnTopicIds: [
    "accessible-name",
    "vague-label",
    "invisible-text",
    "form-wrapping",
    "native-rendering",
  ],
  relevantConcepts: [
    "form-control",
    "accessible-name",
    "form-context",
    "native-elements",
  ],
};
