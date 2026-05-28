import type { ButtonProps, ButtonRenderAs } from "./definition";
import type { CssLength } from "~/composables/useUnitConversion";

const DEFAULT_LABEL = "Button Label";

const BUTTON_TYPE_BY_RENDER_AS: Partial<Record<ButtonRenderAs, string>> = {
  "button-submit": "submit",
  "button-reset": "reset",
  "button-button": "button",
};

const INPUT_TYPE_BY_RENDER_AS: Partial<Record<ButtonRenderAs, string>> = {
  "input-submit": "submit",
  "input-button": "button",
  "input-reset": "reset",
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function escapeAttribute(value: string): string {
  return escapeHtml(value).replace(/"/g, "&quot;");
}

// Selector hook for the injected :focus-visible block. Only applied
// when the override is on.
const INSPECTED_CLASS = "al-inspected-element";

function buildFocusStyleBlock(props: Partial<ButtonProps>): string {
  if (!props.focusRingEnabled) return "";

  const width = props.focusRingWidth
    ? formatLength(props.focusRingWidth)
    : "2px";
  const color = props.focusRingColor ?? "#1d4ed8";
  const offset = props.focusRingOffset
    ? formatLength(props.focusRingOffset)
    : "2px";

  return `<style>.${INSPECTED_CLASS}:focus-visible{outline:${width} solid ${color};outline-offset:${offset};}</style>`;
}

function withInspectedClass(
  extraAttrs: string[],
  focusRingEnabled: boolean,
): string[] {
  if (!focusRingEnabled) return extraAttrs;
  return [`class="${INSPECTED_CLASS}"`, ...extraAttrs];
}

function formatLength(length: CssLength): string {
  return `${length.value}${length.unit}`;
}

function resolveSide(
  explicit: CssLength | undefined,
  shorthand: CssLength | undefined,
): CssLength {
  return explicit ?? shorthand ?? { value: 0, unit: "px" };
}

function buildInlineStyle(props: Partial<ButtonProps>): string {
  const declarations: string[] = [];

  if (props.bg) declarations.push(`background:${props.bg}`);
  if (props.fgText) declarations.push(`color:${props.fgText}`);
  if (props.width) declarations.push(`width:${formatLength(props.width)}`);
  if (props.height) declarations.push(`height:${formatLength(props.height)}`);
  if (props.fontSize) {
    declarations.push(`font-size:${formatLength(props.fontSize)}`);
  }

  const hasIndividualPadding =
    props.paddingTop != null ||
    props.paddingRight != null ||
    props.paddingBottom != null ||
    props.paddingLeft != null;

  if (hasIndividualPadding) {
    const top = resolveSide(props.paddingTop, props.padding);
    const right = resolveSide(props.paddingRight, props.padding);
    const bottom = resolveSide(props.paddingBottom, props.padding);
    const left = resolveSide(props.paddingLeft, props.padding);
    declarations.push(
      `padding:${formatLength(top)} ${formatLength(right)} ${formatLength(bottom)} ${formatLength(left)}`,
    );
  } else if (props.padding != null) {
    declarations.push(`padding:${formatLength(props.padding)}`);
  }

  const hasIndividualBorder =
    props.borderTopWidth != null ||
    props.borderRightWidth != null ||
    props.borderBottomWidth != null ||
    props.borderLeftWidth != null;

  if (hasIndividualBorder) {
    const top = resolveSide(props.borderTopWidth, props.borderWidth);
    const right = resolveSide(props.borderRightWidth, props.borderWidth);
    const bottom = resolveSide(props.borderBottomWidth, props.borderWidth);
    const left = resolveSide(props.borderLeftWidth, props.borderWidth);
    declarations.push(
      `border-top-width:${formatLength(top)}`,
      `border-right-width:${formatLength(right)}`,
      `border-bottom-width:${formatLength(bottom)}`,
      `border-left-width:${formatLength(left)}`,
      `border-style:solid`,
    );
  } else if (props.borderWidth != null && props.borderWidth.value > 0) {
    declarations.push(
      `border-width:${formatLength(props.borderWidth)}`,
      "border-style:solid",
    );
  }

  const hasAnyBorder =
    hasIndividualBorder ||
    (props.borderWidth != null && props.borderWidth.value > 0);
  if (props.borderColor && hasAnyBorder) {
    declarations.push(`border-color:${props.borderColor}`);
  }

  return declarations.join(";");
}

function renderNativeButton(
  props: Partial<ButtonProps>,
  style: string,
  explicitType: string | undefined,
): string {
  const label = escapeHtml(props.label ?? DEFAULT_LABEL);
  const content =
    props.contentType === "icon"
      ? '<span aria-hidden="true">&#128269;</span>'
      : label;

  const attrs: string[] = [];
  if (explicitType) attrs.push(`type="${explicitType}"`);
  if (props.name) attrs.push(`name="${escapeAttribute(props.name)}"`);
  if (props.value) attrs.push(`value="${escapeAttribute(props.value)}"`);
  if (props.ariaLabel) {
    attrs.push(`aria-label="${escapeAttribute(props.ariaLabel)}"`);
  }
  if (props.disabled) attrs.push("disabled");
  if (style) attrs.push(`style="${style}"`);

  return `<button ${withInspectedClass(attrs, props.focusRingEnabled === true).join(" ")}>${content}</button>`;
}

function renderInputButton(
  type: string,
  props: Partial<ButtonProps>,
  style: string,
): string {
  const value = props.label ?? "";

  const attrs: string[] = [`type="${type}"`];
  if (props.name) attrs.push(`name="${escapeAttribute(props.name)}"`);
  if (value) attrs.push(`value="${escapeAttribute(value)}"`);
  if (props.ariaLabel) {
    attrs.push(`aria-label="${escapeAttribute(props.ariaLabel)}"`);
  }
  if (props.disabled) attrs.push("disabled");
  if (style) attrs.push(`style="${style}"`);

  return `<input ${withInspectedClass(attrs, props.focusRingEnabled === true).join(" ")}>`;
}

function renderInputImage(props: Partial<ButtonProps>, style: string): string {
  const attrs: string[] = [`type="image"`];
  if (props.src) attrs.push(`src="${escapeAttribute(props.src)}"`);
  if (props.alt) attrs.push(`alt="${escapeAttribute(props.alt)}"`);
  if (props.name) attrs.push(`name="${escapeAttribute(props.name)}"`);
  if (props.value) attrs.push(`value="${escapeAttribute(props.value)}"`);
  if (props.ariaLabel) {
    attrs.push(`aria-label="${escapeAttribute(props.ariaLabel)}"`);
  }
  if (props.disabled) attrs.push("disabled");
  if (style) attrs.push(`style="${style}"`);

  return `<input ${withInspectedClass(attrs, props.focusRingEnabled === true).join(" ")}>`;
}

export function renderButton(props?: Partial<ButtonProps>): string {
  if (!props) return `<button>${DEFAULT_LABEL}</button>`;

  const style = buildInlineStyle(props);
  const focusBlock = buildFocusStyleBlock(props);
  const renderAs = props.renderAs ?? "button";

  let element: string;
  if (renderAs === "input-image") {
    element = renderInputImage(props, style);
  } else {
    const inputType = INPUT_TYPE_BY_RENDER_AS[renderAs];
    if (inputType) {
      element = renderInputButton(inputType, props, style);
    } else {
      const explicitButtonType = BUTTON_TYPE_BY_RENDER_AS[renderAs];
      element = renderNativeButton(props, style, explicitButtonType);
    }
  }

  // Style block first so it's parsed before the element it targets.
  // The block is empty when focusRingEnabled is false, in which case
  // the browser's own :focus-visible style is what the user sees.
  return `${focusBlock}${element}`;
}
