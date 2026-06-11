import type { InputProps, InputTextStyleSlice } from "./definition";
import type { RenderedFragment } from "~/types/component";
import { associateLabel } from "~/utils/associateLabel";
import { escapeHtml } from "~/utils/escapeHtml";
import { formatCssLength } from "~/utils/formatCssLength";
import { inlineStyleAttribute } from "~/utils/inlineStyleAttribute";

/**
 * Append font-size / colour declarations from a target's style slice
 * onto a base list of declarations. Used for the label and help-text
 * elements where only those two properties are user-controllable.
 */
function appendTextStyle(decls: string[], slice?: InputTextStyleSlice): void {
  if (slice?.fontSize)
    decls.push(`font-size:${formatCssLength(slice.fontSize)}`);
  if (slice?.fgText) decls.push(`color:${slice.fgText}`);
}

interface InputAttrs {
  id: string;
  type: string;
  name: string;
  placeholder: string;
  required: boolean;
  disabled: boolean;
  ariaLabel?: string;
  ariaDescribedby?: string;
  ariaHidden: boolean;
  style: string;
}

function inputTag(attrs: InputAttrs): string {
  const parts: string[] = [
    `type="${escapeHtml(attrs.type)}"`,
    `id="${attrs.id}"`,
    `name="${escapeHtml(attrs.name)}"`,
  ];
  if (attrs.placeholder) {
    parts.push(`placeholder="${escapeHtml(attrs.placeholder)}"`);
  }
  if (attrs.required) parts.push("required");
  if (attrs.disabled) parts.push("disabled");
  if (attrs.ariaLabel)
    parts.push(`aria-label="${escapeHtml(attrs.ariaLabel)}"`);
  if (attrs.ariaDescribedby) {
    parts.push(`aria-describedby="${attrs.ariaDescribedby}"`);
  }
  // `aria-hidden` lives in the Attributes section as an opt-in flag.
  // Applies to the input element itself — for any variant — so the
  // user can demonstrate the anti-pattern (a form field hidden from
  // AT) and see the markup change.
  if (attrs.ariaHidden) parts.push(`aria-hidden="true"`);
  return `<input ${parts.join(" ")}${attrs.style} />`;
}

function labelStyleAttr(
  slice: InputTextStyleSlice | undefined,
  baseDecls: string[],
): string {
  const decls = [...baseDecls];
  appendTextStyle(decls, slice);
  return ` style="${decls.join(";")}"`;
}

/**
 * Build the `::placeholder` CSS rule from the placeholder style slice.
 * Returns an empty string when no placeholder styling is set.
 * Placeholder styling cannot be applied via inline `style=` — it
 * requires a CSS rule targeting the pseudo-element, so this output is
 * carried in the RenderedFragment's `css` slot.
 */
function placeholderCss(slice: InputTextStyleSlice | undefined): string {
  const decls: string[] = [];
  if (slice?.fontSize)
    decls.push(`font-size:${formatCssLength(slice.fontSize)}`);
  if (slice?.fgText) decls.push(`color:${slice.fgText}`);
  if (decls.length === 0) return "";
  return `#al-input::placeholder{${decls.join(";")};}`;
}

/**
 * Wrap an input's HTML in a flex span with the magnifying-glass icon
 * when the input is a search field AND the user has opted in via the
 * `showSearchIcon` prop. Works for every label-association mode — the
 * wrapping happens on the input element itself, so for-id puts the
 * icon next to the input below the label, wrapping puts it next to
 * the input inside the label, etc.
 *
 * The icon span never carries `aria-hidden` from the studio. The
 * generic `ariaHidden` attribute now applies to the input element
 * itself (see Attributes section), so the icon's decorative
 * semantics aren't auto-decided here — the user controls all
 * `aria-hidden` placement explicitly.
 */
function maybeWrapWithSearchIcon(
  inputHtml: string,
  props: Partial<InputProps>,
): string {
  const showIcon = props.renderAs === "search" && props.showSearchIcon === true;
  if (!showIcon) return inputHtml;
  const icon
    = `<span style="display:inline-flex;align-items:center;justify-content:center;width:1.2em;height:1.2em;margin-right:0.4em;color:#555;vertical-align:middle;">`
      + `<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">`
      + `<circle cx="11" cy="11" r="8"></circle>`
      + `<line x1="21" y1="21" x2="16.65" y2="16.65"></line>`
      + `</svg>`
      + `</span>`;
  return `<span style="display:inline-flex;align-items:center;">${icon}${inputHtml}</span>`;
}

function helpTextStyleAttr(slice: InputTextStyleSlice | undefined): string {
  const decls = [
    "display:block",
    "margin-top:4px",
    "font-size:0.85em",
    "color:#666",
  ];
  // The slice's values override the defaults if set (fontSize replaces
  // the 0.85em default; fgText replaces #666).
  if (slice?.fontSize)
    decls[2] = `font-size:${formatCssLength(slice.fontSize)}`;
  if (slice?.fgText) decls[3] = `color:${slice.fgText}`;
  return ` style="${decls.join(";")}"`;
}

export function renderInput(props?: Partial<InputProps>): RenderedFragment {
  const association = props?.labelAssociation ?? "for-id";
  // Empty stays empty. The model's Field label is the single source
  // of truth — when the user clears it, the rendered <label> /
  // aria-label go empty too, and axe correctly fires the `label`
  // rule. Filling in a phantom default would hide the "no accessible
  // name" anti-pattern the user is probably trying to surface.
  const rawLabel = typeof props?.label === "string" ? props.label : "";
  const helpText = props?.helpText ? escapeHtml(props.helpText) : "";

  const baseAttrs: InputAttrs = {
    id: "al-input",
    type: props?.renderAs ?? "text",
    name: props?.name ?? "",
    placeholder: props?.placeholder ?? "",
    required: props?.required === true,
    disabled: props?.disabled === true,
    // When the user opts in via the Attributes section's aria-label
    // checkbox, the input gets `aria-label="<labelText>"` regardless
    // of label-association mode. The aria-label mode below also sets
    // this explicitly — that branch's value wins. An empty label
    // intentionally falls through the inputTag's truthy guard and
    // emits no aria-label attribute at all.
    ariaLabel: props?.ariaLabel === true ? rawLabel : undefined,
    ariaDescribedby: helpText ? "al-input-help" : undefined,
    ariaHidden: props?.ariaHidden === true,
    style: inlineStyleAttribute(props ?? {}),
  };

  // The wrapping label is plain block; the for-id label adds spacing
  // because it sits outside the control as a sibling.
  const labelStyle =
    association === "wrapping"
      ? labelStyleAttr(props?.labelStyle, ["display:block"])
      : labelStyleAttr(props?.labelStyle, ["display:block", "margin-bottom:4px", "margin-right:8px"]);

  let body = associateLabel({
    association,
    controlId: "al-input",
    labelText: rawLabel,
    labelStyle,
    labelPosition: "before",
    // The magnifying-glass icon wraps the input element itself (not
    // the label), so it appears next to the input in every mode.
    renderControl: (ariaLabelText) =>
      maybeWrapWithSearchIcon(
        inputTag(ariaLabelText === undefined ? baseAttrs : { ...baseAttrs, ariaLabel: ariaLabelText }),
        props ?? {},
      ),
  });

  if (helpText) {
    body += `<small id="al-input-help"${helpTextStyleAttr(props?.helpTextStyle)}>${helpText}</small>`;
  }

  const html = `<div>${body}</div>`;

  const css = placeholderCss(props?.placeholderStyle);
  return css ? { html, css } : { html };
}
