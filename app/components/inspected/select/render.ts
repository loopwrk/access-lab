import type { SelectProps } from "./definition";
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

function styleAttr(props: Partial<SelectProps>): string {
  const decls: string[] = [];
  if (props.fontSize) decls.push(`font-size:${fmt(props.fontSize)}`);
  if (props.bg) decls.push(`background:${props.bg}`);
  if (props.fgText) decls.push(`color:${props.fgText}`);
  if (props.borderColor) decls.push(`border-color:${props.borderColor}`);
  return decls.length ? ` style="${decls.join(";")}"` : "";
}

function valueFromLabel(label: string): string {
  return label.trim().toLowerCase().replace(/\s+/g, "-");
}

function renderOptions(
  options: string[],
  selected: string,
): string {
  return options
    .map((label) => {
      const value = valueFromLabel(label);
      const isSelected = label === selected;
      return `<option value="${escape(value)}"${
        isSelected ? " selected" : ""
      }>${escape(label)}</option>`;
    })
    .join("");
}

function renderSelectAttrs(
  props: Partial<SelectProps>,
  extraAttrs: string[] = [],
): string {
  const attrs: string[] = [...extraAttrs];
  if (props.name) attrs.push(`name="${escape(props.name)}"`);
  if (props.labelAssociation === "for-id") attrs.push("id=\"al-select\"");
  if (props.required) attrs.push("required");
  if (props.disabled) attrs.push("disabled");
  if (props.labelAssociation === "aria-label" && props.label) {
    attrs.push(`aria-label="${escape(props.label)}"`);
  }
  return attrs.join(" ");
}

function wrapWithLabel(
  props: Partial<SelectProps>,
  selectMarkup: string,
): string {
  const association = props.labelAssociation ?? "for-id";
  const safeLabel = escape(props.label ?? "");

  switch (association) {
    case "wrapping":
      return `<label>${safeLabel} ${selectMarkup}</label>`;
    case "for-id":
      return `<label for="al-select">${safeLabel}</label> ${selectMarkup}`;
    case "aria-label":
    case "none":
    default:
      return selectMarkup;
  }
}

function renderNativeSelect(
  props: Partial<SelectProps>,
  extraAttrs: string[] = [],
): string {
  const style = styleAttr(props);
  const options = props.options?.length ? props.options : [];
  const selected = props.selectedOption ?? "";
  const attrs = renderSelectAttrs(props, extraAttrs);
  const optionsHtml = renderOptions(options, selected);
  return wrapWithLabel(
    props,
    `<select ${attrs}${style}>${optionsHtml}</select>`,
  );
}

function renderDivCombobox(props: Partial<SelectProps>): string {
  const style = styleAttr(props);
  const safeLabel = escape(props.label ?? "");
  const selected = props.selectedOption ?? "";
  const display = selected ? escape(selected) : "Choose an option";

  // Anti-pattern demo: looks like a combobox but no aria-controls,
  // no listbox element, no keyboard handlers — a pure visual stand-in.
  // The custom rule + manual checklist call out what's missing.
  const trigger = `<div role="combobox" aria-expanded="false" tabindex="0"${style}>${display} ▾</div>`;

  if (props.labelAssociation === "wrapping") {
    return `<label>${safeLabel} ${trigger}</label>`;
  }
  if (props.labelAssociation === "for-id") {
    return `<label>${safeLabel}</label> ${trigger}`;
  }
  return trigger;
}

export function renderSelect(props?: Partial<SelectProps>): string {
  if (!props) return "<select></select>";

  switch (props.renderAs) {
    case "select-multiple":
      return renderNativeSelect(props, ["multiple"]);
    case "div-combobox":
      return renderDivCombobox(props);
    case "select-native":
    default:
      return renderNativeSelect(props);
  }
}
