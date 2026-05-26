import type { InputProps } from "./definition";
import type { CssLength } from "~/composables/useUnitConversion";

function escape(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Keep in sync with useUnitConversion.formatLength. Local because
 *  render.ts can't call composables. */
function fmt(length: CssLength): string {
  return `${length.value}${length.unit}`;
}

/**
 * Render an `<input>` with optional surrounding `<label>` and help text.
 *
 * The render function mirrors what a developer would actually write:
 * a `<form>` wrapper, a `<label for>` tied to the input by id, an
 * input element with optional placeholder / required / aria-label /
 * aria-describedby, and an optional `<small>` for help text linked
 * through aria-describedby. Hiding the label removes the element
 * entirely so the rule engine can warn when nothing else (aria-label)
 * provides an accessible name.
 */
export function renderInput(props?: Partial<InputProps>): string {
  const label = escape(props?.label ?? "Email");
  const type = escape(props?.type ?? "email");
  const name = escape(props?.name ?? "email");
  const showLabel = props?.showLabel !== false;

  const inputStyle: string[] = [];
  if (props?.fontSize) inputStyle.push(`font-size:${fmt(props.fontSize)}`);
  if (props?.bg) inputStyle.push(`background:${props.bg}`);
  if (props?.fgText) inputStyle.push(`color:${props.fgText}`);
  if (props?.borderColor) inputStyle.push(`border-color:${props.borderColor}`);
  const inputStyleAttr = inputStyle.length
    ? ` style="${inputStyle.join(";")}"`
    : "";

  const attrs: string[] = [`type="${type}"`, `id="al-input"`, `name="${name}"`];
  if (props?.placeholder) {
    attrs.push(`placeholder="${escape(props.placeholder)}"`);
  }
  if (props?.required) attrs.push("required");
  if (!showLabel && props?.ariaLabel) {
    attrs.push(`aria-label="${escape(props.ariaLabel)}"`);
  }
  if (props?.helpText) {
    attrs.push(`aria-describedby="al-input-help"`);
  }

  const parts: string[] = ["<form>"];
  if (showLabel) {
    parts.push(
      `<label for="al-input" style="display:block;margin-bottom:4px;">${label}</label>`,
    );
  }
  parts.push(`<input ${attrs.join(" ")}${inputStyleAttr} />`);
  if (props?.helpText) {
    parts.push(
      `<small id="al-input-help" style="display:block;margin-top:4px;font-size:0.85em;color:#666;">${escape(
        props.helpText,
      )}</small>`,
    );
  }
  parts.push("</form>");
  return parts.join("");
}
