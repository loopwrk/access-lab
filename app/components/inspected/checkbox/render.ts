import type { CheckboxProps } from "./definition";
import type { CssLength } from "~/composables/useUnitConversion";

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

function inputTag(attrs: InputAttrs, indeterminate: boolean): string {
  const parts: string[] = [
    "type=\"checkbox\"",
    `id="${attrs.id}"`,
    `name="${escape(attrs.name)}"`,
    `value="${escape(attrs.value)}"`,
  ];
  if (attrs.checked) parts.push("checked");
  if (attrs.required) parts.push("required");
  if (attrs.disabled) parts.push("disabled");
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
 * Render a single checkbox row using the chosen label-association
 * strategy. `id` lets group rendering pass distinct ids to each row.
 */
function renderSingleCheckbox(
  props: Partial<CheckboxProps>,
  id: string,
  labelText: string,
): string {
  const association = props.labelAssociation ?? "for-id";
  const style = styleAttr(props);
  const safeLabel = escape(labelText);

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
      if (indeterminate) wrappedAttrs.push("data-al-indeterminate");
      return `<label><input ${wrappedAttrs.join(" ")}${style} /> ${safeLabel}</label>`;
    }

    case "aria-label":
      return inputTag({ ...baseAttrs, ariaLabel: labelText }, indeterminate);

    case "none":
      return inputTag(baseAttrs, indeterminate);

    case "for-id":
    default:
      return [
        inputTag(baseAttrs, indeterminate),
        ` <label for="${id}">${safeLabel}</label>`,
      ].join("");
  }
}

/**
 * Render the inspected checkbox.
 *
 * Three group modes:
 *   - 'single' renders one labelled checkbox.
 *   - 'group-with-fieldset' wraps multiple checkboxes in <fieldset>
 *     with the `label` prop becoming the <legend> text. This is the
 *     correct pattern for related choices.
 *   - 'group-no-fieldset' renders the same set without the fieldset
 *     wrapper. Visually identical to sighted users; assistive tech
 *     loses the group relationship entirely. axe-core does NOT catch
 *     this — our `checkbox-group-no-fieldset` rule does.
 */
export function renderCheckbox(props?: Partial<CheckboxProps>): string {
  if (!props) return "<input type=\"checkbox\" />";

  const groupMode = props.groupMode ?? "single";

  if (groupMode === "single") {
    return renderSingleCheckbox(props, "al-checkbox", props.label ?? "");
  }

  const items = props.groupItems?.length ? props.groupItems : [];
  const rows = items.map((itemLabel, index) =>
    `<div>${renderSingleCheckbox(
      // Each checkbox in a group typically shares the same name and
      // submits its own value. We don't override here — the user picks
      // a single name in the controls panel and every row shares it.
      props,
      `al-checkbox-${index}`,
      itemLabel,
    )}</div>`,
  ).join("");

  if (groupMode === "group-with-fieldset") {
    const legend = escape(props.label ?? "");
    return `<fieldset><legend>${legend}</legend>${rows}</fieldset>`;
  }

  // group-no-fieldset: no surrounding fieldset/legend.
  // The visible "group title" still renders as a paragraph above the
  // checkboxes so sighted users see the same UI as the correct
  // pattern — that's the whole point of the anti-pattern demo.
  const heading = escape(props.label ?? "");
  return `<p style="font-weight:600;margin:0 0 0.4em;">${heading}</p>${rows}`;
}
