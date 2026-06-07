import type { CheckboxProps } from "./definition";
import type { CssLength } from "~/composables/useUnitConversion";
import type { RenderedFragment } from "~/types/component";

function escape(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function fmt(length: CssLength): string {
  return `${length.value}${length.unit}`;
}

interface InputAttrs {
  id: string;
  name: string;
  value: string;
  checked: boolean;
  required: boolean;
  disabled: boolean;
  ariaLabel?: string;
  style: string;
}

// CSS for the `div-checkbox` variant. Builds a checkbox-shaped square
// using `::before` with an inline SVG checkmark for the checked state.
// `[aria-checked="true"]` drives the visual; the inspected element
// class lets the iframe shell post `demo:click` when it's clicked.
const DIV_CHECKBOX_CSS
  = `.al-div-checkbox{display:inline-flex;align-items:center;gap:0.5em;cursor:pointer;user-select:none;font-family:Arial,Helvetica,sans-serif;outline:none;padding:0.2em 0.3em;}`
    + `.al-div-checkbox::before{content:'';display:inline-block;width:1em;height:1em;border:2px solid #444;border-radius:2px;background:#fff;flex-shrink:0;box-sizing:border-box;}`
    + `.al-div-checkbox[aria-checked="true"]::before{background:#1d4ed8 url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' fill='white'%3E%3Cpath d='M6.5 12.1 3.2 8.8l1.4-1.4 1.9 1.9 4.9-4.9 1.4 1.4z'/%3E%3C/svg%3E") center/contain no-repeat;border-color:#1d4ed8;}`
    + `.al-div-checkbox:focus-visible{outline:2px solid #1d4ed8;outline-offset:2px;}`
    + `.al-div-checkbox[aria-disabled="true"]{opacity:0.5;cursor:not-allowed;}`;

function inputTag(
  attrs: InputAttrs,
  indeterminate: boolean,
  ariaChecked: boolean,
): string {
  const parts: string[] = [
    "type=\"checkbox\"",
    `id="${attrs.id}"`,
    `name="${escape(attrs.name)}"`,
    `value="${escape(attrs.value)}"`,
  ];
  if (attrs.checked) parts.push("checked");
  if (attrs.required) parts.push("required");
  if (attrs.disabled) parts.push("disabled");
  // aria-checked on a native checkbox is the redundant pattern the
  // `checkbox-aria-checked-redundant` rule warns about. The render
  // still honours the prop so the user can see the resulting markup.
  if (ariaChecked) parts.push(`aria-checked="${attrs.checked}"`);
  if (attrs.ariaLabel) parts.push(`aria-label="${escape(attrs.ariaLabel)}"`);
  // `indeterminate` is JS-only — see preview-shell.html for the
  // post-render hook that reads this marker.
  if (indeterminate) parts.push("data-al-indeterminate");
  return `<input ${parts.join(" ")}${attrs.style} />`;
}

/**
 * Build the inline `style` attribute string (with leading space) so it
 * can be concatenated into the open tag. Returns an empty string when
 * no styling props are set, so the rendered HTML stays clean.
 */
function styleAttr(props: Partial<CheckboxProps>): string {
  const decls: string[] = [];
  if (props.fontSize) decls.push(`font-size:${fmt(props.fontSize)}`);
  if (props.bg) decls.push(`background:${props.bg}`);
  if (props.fgText) decls.push(`color:${props.fgText}`);
  if (props.borderColor) decls.push(`border-color:${props.borderColor}`);
  return decls.length ? ` style="${decls.join(";")}"` : "";
}

/**
 * Render the native input-checkbox variant using the chosen label-
 * association strategy. `id` lets group rendering pass distinct ids
 * to each row.
 */
function renderNativeCheckboxRow(
  props: Partial<CheckboxProps>,
  id: string,
  labelText: string,
): string {
  const association = props.labelAssociation ?? "for-id";
  const style = styleAttr(props);
  const safeLabel = escape(labelText);
  const ariaChecked = props.ariaChecked === true;

  const baseAttrs: InputAttrs = {
    id,
    name: props.name ?? "",
    value: props.value ?? "",
    checked: props.checked === true,
    required: props.required === true,
    disabled: props.disabled === true,
    style,
  };
  const indeterminate = props.indeterminate === true;

  switch (association) {
    case "wrapping": {
      const wrappedAttrs: string[] = [
        "type=\"checkbox\"",
        `id="${id}"`,
        `name="${escape(baseAttrs.name)}"`,
        `value="${escape(baseAttrs.value)}"`,
      ];
      if (baseAttrs.checked) wrappedAttrs.push("checked");
      if (baseAttrs.required) wrappedAttrs.push("required");
      if (baseAttrs.disabled) wrappedAttrs.push("disabled");
      if (ariaChecked) wrappedAttrs.push(`aria-checked="${baseAttrs.checked}"`);
      if (indeterminate) wrappedAttrs.push("data-al-indeterminate");
      return `<label><input ${wrappedAttrs.join(" ")}${style} /> ${safeLabel}</label>`;
    }

    case "aria-label":
      return inputTag(
        { ...baseAttrs, ariaLabel: labelText },
        indeterminate,
        ariaChecked,
      );

    case "none":
      return inputTag(baseAttrs, indeterminate, ariaChecked);

    case "for-id":
    default:
      return [
        inputTag(baseAttrs, indeterminate, ariaChecked),
        ` <label for="${id}">${safeLabel}</label>`,
      ].join("");
  }
}

/**
 * Render the `div-checkbox` variant — a styled `<div>` with
 * `role="checkbox"` and `aria-checked`. The visible label is the
 * div's text content (the accessible name comes from there). The
 * `al-inspected-element` class lets the iframe shell post
 * `demo:click` on click so the studio's `checked` state flips.
 */
function renderDivCheckboxRow(
  props: Partial<CheckboxProps>,
  labelText: string,
): string {
  const checked = props.checked === true;
  const disabled = props.disabled === true;
  const ariaChecked = props.ariaChecked !== false; // div needs aria-checked
  const safeLabel = escape(labelText);

  const attrs: string[] = [
    `class="al-div-checkbox al-inspected-element"`,
    `role="checkbox"`,
    `tabindex="${disabled ? "-1" : "0"}"`,
  ];
  if (ariaChecked) attrs.push(`aria-checked="${checked}"`);
  if (disabled) attrs.push(`aria-disabled="true"`);
  return `<div ${attrs.join(" ")}>${safeLabel}</div>`;
}

/**
 * Render the inspected checkbox.
 *
 * Two render variants:
 *   - 'input-checkbox' (default): a native `<input type="checkbox">`
 *     with optional label-association strategies.
 *   - 'div-checkbox': a styled `<div role="checkbox" aria-checked>` —
 *     the custom pattern that needs `aria-checked` to expose its
 *     state. Demonstrates why ARIA matters when the native semantics
 *     are not available.
 *
 * Three group modes, independent of the render variant:
 *   - 'single' renders one labelled checkbox.
 *   - 'group-with-fieldset' wraps multiple checkboxes in <fieldset>
 *     with the `label` prop becoming the <legend> text. This is the
 *     correct pattern for related choices.
 *   - 'group-no-fieldset' renders the same set without the fieldset
 *     wrapper. Visually identical to sighted users; assistive tech
 *     loses the group relationship entirely. axe-core does NOT catch
 *     this — our `checkbox-group-no-fieldset` rule does.
 */
export function renderCheckbox(
  props?: Partial<CheckboxProps>,
): RenderedFragment {
  if (!props) return { html: "<input type=\"checkbox\" />" };

  const groupMode = props.groupMode ?? "single";
  const isDiv = props.renderAs === "div-checkbox";

  const renderRow = (id: string, labelText: string): string =>
    isDiv
      ? renderDivCheckboxRow(props, labelText)
      : renderNativeCheckboxRow(props, id, labelText);

  let html: string;

  if (groupMode === "single") {
    html = renderRow("al-checkbox", props.label ?? "");
  } else {
    const items = props.groupItems?.length ? props.groupItems : [];
    const rows = items.map((itemLabel, index) =>
      `<div>${renderRow(`al-checkbox-${index}`, itemLabel)}</div>`,
    ).join("");

    if (groupMode === "group-with-fieldset") {
      const legend = escape(props.label ?? "");
      html = `<fieldset><legend>${legend}</legend>${rows}</fieldset>`;
    } else {
      // group-no-fieldset: no surrounding fieldset/legend.
      // The visible "group title" still renders as a paragraph above
      // the checkboxes so sighted users see the same UI as the
      // correct pattern — that's the whole point of the anti-pattern
      // demo.
      const heading = escape(props.label ?? "");
      html = `<p style="font-weight:600;margin:0 0 0.4em;">${heading}</p>${rows}`;
    }
  }

  return isDiv ? { html, css: DIV_CHECKBOX_CSS } : { html };
}
