import type { RadioProps } from "./definition";
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

function valueFromLabel(label: string): string {
  return label.trim().toLowerCase().replace(/\s+/g, "-");
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

function inputTag(attrs: InputAttrs): string {
  const parts: string[] = [
    "type=\"radio\"",
    `id="${attrs.id}"`,
    `name="${escape(attrs.name)}"`,
    `value="${escape(attrs.value)}"`,
  ];
  if (attrs.checked) parts.push("checked");
  if (attrs.required) parts.push("required");
  if (attrs.disabled) parts.push("disabled");
  if (attrs.ariaLabel) parts.push(`aria-label="${escape(attrs.ariaLabel)}"`);
  return `<input ${parts.join(" ")}${attrs.style} />`;
}

function styleAttr(props: Partial<RadioProps>): string {
  const decls: string[] = [];
  if (props.fontSize) decls.push(`font-size:${fmt(props.fontSize)}`);
  if (props.bg) decls.push(`background:${props.bg}`);
  if (props.fgText) decls.push(`color:${props.fgText}`);
  if (props.borderColor) decls.push(`border-color:${props.borderColor}`);
  return decls.length ? ` style="${decls.join(";")}"` : "";
}
function renderSingleRadio(
  props: Partial<RadioProps>,
  id: string,
  labelText: string,
  isSelected: boolean,
): string {
  const association = props.labelAssociation ?? "for-id";
  const style = styleAttr(props);
  const safeLabel = escape(labelText);

  const baseAttrs: InputAttrs = {
    id,
    name: props.name ?? "",
    value: valueFromLabel(labelText),
    checked: isSelected,
    required: props.required === true,
    disabled: props.disabled === true,
    style,
  };

  switch (association) {
    case "wrapping": {
      const wrappedAttrs: string[] = [
        "type=\"radio\"",
        `id="${id}"`,
        `name="${escape(baseAttrs.name)}"`,
        `value="${escape(baseAttrs.value)}"`,
      ];
      if (baseAttrs.checked) wrappedAttrs.push("checked");
      if (baseAttrs.required) wrappedAttrs.push("required");
      if (baseAttrs.disabled) wrappedAttrs.push("disabled");
      return `<label><input ${wrappedAttrs.join(" ")}${style} /> ${safeLabel}</label>`;
    }

    case "aria-label":
      return inputTag({ ...baseAttrs, ariaLabel: labelText });

    case "none":
      return inputTag(baseAttrs);

    case "for-id":
    default:
      return [
        inputTag(baseAttrs),
        ` <label for="${id}">${safeLabel}</label>`,
      ].join("");
  }
}

export function renderRadio(props?: Partial<RadioProps>): string {
  if (!props) return "<input type=\"radio\" />";

  const groupMode = props.groupMode ?? "group-with-fieldset";
  const items = props.groupItems?.length ? props.groupItems : [];
  const selected = props.selectedItem ?? "";

  const rows = items
    .map((itemLabel, index) => {
      // `required` on a radio is group-level; emitting it on every
      // input is redundant. First one carries the attribute.
      const itemProps: Partial<RadioProps> = {
        ...props,
        required: props.required === true && index === 0,
      };
      return `<div>${renderSingleRadio(
        itemProps,
        `al-radio-${index}`,
        itemLabel,
        itemLabel === selected,
      )}</div>`;
    })
    .join("");

  if (groupMode === "group-with-fieldset") {
    const legend = escape(props.label ?? "");
    return `<fieldset><legend>${legend}</legend>${rows}</fieldset>`;
  }

  const heading = escape(props.label ?? "");
  return `<p style="font-weight:600;margin:0 0 0.4em;">${heading}</p>${rows}`;
}
