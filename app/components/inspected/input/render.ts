import type { InputProps, InputTextStyleSlice } from "./definition";
import type { CssLength } from "~/composables/useUnitConversion";
import type { RenderedFragment } from "~/types/component";

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
 * Build the inline `style` attribute string (with leading space) so it
 * can be concatenated into the open tag. Returns an empty string when
 * no styling props are set, so the rendered HTML stays clean.
 */
function styleAttr(props: Partial<InputProps>): string {
  const decls: string[] = [];
  if (props.fontSize) decls.push(`font-size:${fmt(props.fontSize)}`);
  if (props.bg) decls.push(`background:${props.bg}`);
  if (props.fgText) decls.push(`color:${props.fgText}`);
  if (props.borderColor) decls.push(`border-color:${props.borderColor}`);
  return decls.length ? ` style="${decls.join(";")}"` : "";
}

/**
 * Append font-size / colour declarations from a target's style slice
 * onto a base list of declarations. Used for the label and help-text
 * elements where only those two properties are user-controllable.
 */
function appendTextStyle(decls: string[], slice?: InputTextStyleSlice): void {
  if (slice?.fontSize) decls.push(`font-size:${fmt(slice.fontSize)}`);
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
  style: string;
}

function inputTag(attrs: InputAttrs): string {
  const parts: string[] = [
    `type="${escape(attrs.type)}"`,
    `id="${attrs.id}"`,
    `name="${escape(attrs.name)}"`,
  ];
  if (attrs.placeholder) {
    parts.push(`placeholder="${escape(attrs.placeholder)}"`);
  }
  if (attrs.required) parts.push("required");
  if (attrs.disabled) parts.push("disabled");
  if (attrs.ariaLabel) parts.push(`aria-label="${escape(attrs.ariaLabel)}"`);
  if (attrs.ariaDescribedby) {
    parts.push(`aria-describedby="${attrs.ariaDescribedby}"`);
  }
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
  if (slice?.fontSize) decls.push(`font-size:${fmt(slice.fontSize)}`);
  if (slice?.fgText) decls.push(`color:${slice.fgText}`);
  if (decls.length === 0) return "";
  return `#al-input::placeholder{${decls.join(";")};}`;
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
  if (slice?.fontSize) decls[2] = `font-size:${fmt(slice.fontSize)}`;
  if (slice?.fgText) decls[3] = `color:${slice.fgText}`;
  return ` style="${decls.join(";")}"`;
}

export function renderInput(props?: Partial<InputProps>): RenderedFragment {
  const association = props?.labelAssociation ?? "for-id";
  const labelText = escape(props?.label ?? "Email");
  const helpText = props?.helpText ? escape(props.helpText) : "";

  const baseAttrs: InputAttrs = {
    id: "al-input",
    type: props?.renderAs ?? "text",
    name: props?.name ?? "",
    placeholder: props?.placeholder ?? "",
    required: props?.required === true,
    disabled: props?.disabled === true,
    ariaDescribedby: helpText ? "al-input-help" : undefined,
    style: styleAttr(props ?? {}),
  };

  let body: string;
  switch (association) {
    case "wrapping": {
      const inner = inputTag(baseAttrs);
      const labelStyle = labelStyleAttr(props?.labelStyle, ["display:block"]);
      body = `<label${labelStyle}>${labelText} ${inner}</label>`;
      break;
    }

    case "aria-label":
      body = inputTag({ ...baseAttrs, ariaLabel: props?.label ?? "Email" });
      break;

    case "none":
      body = inputTag(baseAttrs);
      break;

    case "for-id":
    default: {
      const labelStyle = labelStyleAttr(props?.labelStyle, [
        "display:block",
        "margin-bottom:4px",
        "margin-right:8px",
      ]);
      const labelTag = `<label for="al-input"${labelStyle}>${labelText}:</label>`;
      body = `${labelTag}${inputTag(baseAttrs)}`;
      break;
    }
  }

  if (helpText) {
    body += `<small id="al-input-help"${helpTextStyleAttr(props?.helpTextStyle)}>${helpText}</small>`;
  }

  const css = placeholderCss(props?.placeholderStyle);
  return css ? { html: body, css } : { html: body };
}
