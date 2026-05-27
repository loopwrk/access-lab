import type { ButtonProps, ButtonRenderAs } from "./definition";
import type { CssLength } from "~/composables/useUnitConversion";

const DEFAULT_LABEL = "Button Label";

const CLICK_BRIDGE = `onclick="parent.postMessage({type:'demo:click'},window.location.origin)"`;

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
  if (props.ariaLabel) {
    attrs.push(`aria-label="${escapeAttribute(props.ariaLabel)}"`);
  }
  if (style) attrs.push(`style="${style}"`);
  attrs.push(CLICK_BRIDGE);

  return `<button ${attrs.join(" ")}>${content}</button>`;
}

function renderInputButton(
  type: string,
  props: Partial<ButtonProps>,
  style: string,
): string {
  const value = props.label ?? "";

  const attrs: string[] = [`type="${type}"`];
  if (value) attrs.push(`value="${escapeAttribute(value)}"`);
  if (props.ariaLabel) {
    attrs.push(`aria-label="${escapeAttribute(props.ariaLabel)}"`);
  }
  if (style) attrs.push(`style="${style}"`);
  attrs.push(CLICK_BRIDGE);

  return `<input ${attrs.join(" ")}>`;
}

export function renderButton(props?: Partial<ButtonProps>): string {
  if (!props) return `<button>${DEFAULT_LABEL}</button>`;

  const style = buildInlineStyle(props);
  const renderAs = props.renderAs ?? "button";

  const inputType = INPUT_TYPE_BY_RENDER_AS[renderAs];
  if (inputType) {
    return renderInputButton(inputType, props, style);
  }

  const explicitButtonType = BUTTON_TYPE_BY_RENDER_AS[renderAs];
  return renderNativeButton(props, style, explicitButtonType);
}
