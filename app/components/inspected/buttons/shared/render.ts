import type { ButtonProps, ButtonRenderAs } from "./types";
import type { CssLength } from "~/composables/useUnitConversion";
import type { RenderedFragment } from "~/types/component";

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

const INSPECTED_CLASS = "al-inspected-element";
const PRESSED_CLASS = "al-pressed";
const SWITCH_CLASS = "al-switch";
const SWITCH_WRAP_CLASS = "al-switch-wrap";
const SWITCH_LABEL_ID = "al-switch-label";
const SWITCH_INPUT_ID = "al-switch-input";

function buildCss(props: Partial<ButtonProps>): string {
  const rules: string[] = [];

  if (props.focusRingEnabled) {
    const width = props.focusRingWidth
      ? formatLength(props.focusRingWidth)
      : "2px";
    const color = props.focusRingColor ?? "#1d4ed8";
    const offset = props.focusRingOffset
      ? formatLength(props.focusRingOffset)
      : "2px";
    rules.push(
      `.${INSPECTED_CLASS}:focus-visible{outline:${width} solid ${color};outline-offset:${offset};}`,
    );
  }

  // Pressed-state tint. For pilled switches the tint is slightly
  // stronger — the track visibly darkens by a couple of shades when on,
  // matching the gray-on / darker-gray-off pattern Nuxt UI uses
  // (without swapping in a brand colour).
  if (isToggleable(props) || isSwitchable(props)) {
    const alpha = isPilledSwitch(props) ? "0.25" : "0.18";
    rules.push(
      `.${INSPECTED_CLASS}.${PRESSED_CLASS}{box-shadow:inset 0 0 0 999px rgb(0 0 0 / ${alpha});}`,
    );
  }

  if (isPilledSwitch(props)) {
    // Each declaration on the host (the <button>) is gated on whether
    // the user has set a competing inline style. When they have, we
    // drop the studio's declaration so the CSS pane matches reality.
    const hostDecls: string[] = [`position:relative;`];
    if (!hasUserPadding(props)) hostDecls.push(`padding:0;`);
    if (props.width == null) hostDecls.push(`width:2.8rem;`);
    if (props.height == null) hostDecls.push(`height:1.6rem;`);
    hostDecls.push(`border:none;`, `border-radius:999px;`);

    rules.push(
      `.${SWITCH_WRAP_CLASS}{display:inline-flex;flex-direction:column;align-items:flex-start;gap:0.8em;font-family:Arial, Helvetica, sans-serif;}`,
      `.${INSPECTED_CLASS}.${SWITCH_CLASS}{${hostDecls.join("")}}`,
      `.${INSPECTED_CLASS}.${SWITCH_CLASS}::before{` +
        `content:'';` +
        `position:absolute;` +
        `left:0.2em;` +
        `top:50%;` +
        `width:1.2em;` +
        `height:1.2em;` +
        `margin-top:-0.6em;` +
        `border-radius:50%;` +
        `background:#fff;` +
        `box-shadow:0 1px 3px rgb(0 0 0 / 0.3);` +
        `transition:left 220ms cubic-bezier(0.4, 0, 0.2, 1);` +
        `pointer-events:none;` +
        `}`,
      `.${INSPECTED_CLASS}.${SWITCH_CLASS}.${PRESSED_CLASS}::before{` +
        `left:calc(100% - 1.2em - 0.2em);` +
        `}`,
    );
  }

  return rules.join("");
}

function hasUserPadding(props: Partial<ButtonProps>): boolean {
  return (
    props.padding != null ||
    props.paddingTop != null ||
    props.paddingRight != null ||
    props.paddingBottom != null ||
    props.paddingLeft != null
  );
}

function isToggleable(props: Partial<ButtonProps>): boolean {
  return props.toggleBehaviour != null && props.toggleBehaviour !== "none";
}

function isSwitchable(props: Partial<ButtonProps>): boolean {
  return props.switchBehaviour != null && props.switchBehaviour !== "none";
}

function isPilledSwitch(props: Partial<ButtonProps>): boolean {
  // Pill+thumb visual relies on ::before, which void elements like
  // <input> can't host. Restrict to <button>-tag variants.
  const renderAs = props.renderAs ?? "button";
  const isButtonTag = !renderAs.startsWith("input-");
  return (
    isSwitchable(props) && props.switchPillStyling !== false && isButtonTag
  );
}

function buildElementClass(props: Partial<ButtonProps>): string | null {
  const tokens: string[] = [];
  const pressed =
    (isToggleable(props) && props.togglePressed) ||
    (isSwitchable(props) && props.switchChecked);
  const needsInspected =
    props.focusRingEnabled || isPilledSwitch(props) || pressed;
  if (needsInspected) tokens.push(INSPECTED_CLASS);
  if (isPilledSwitch(props)) tokens.push(SWITCH_CLASS);
  if (pressed) tokens.push(PRESSED_CLASS);
  return tokens.length ? tokens.join(" ") : null;
}

function withInspectedClass(
  extraAttrs: string[],
  props: Partial<ButtonProps>,
): string[] {
  const cls = buildElementClass(props);
  if (!cls) return extraAttrs;
  return [`class="${cls}"`, ...extraAttrs];
}

function toggleAttrs(props: Partial<ButtonProps>): string[] {
  if (!isToggleable(props)) return [];
  const pressed = props.togglePressed === true;
  switch (props.toggleBehaviour) {
    case "aria-pressed":
      return [`aria-pressed="${pressed}"`];
    case "aria-checked":
      return [`aria-checked="${pressed}"`];
    case "visual-only":
      return [];
    default:
      return [];
  }
}

function switchAttrs(props: Partial<ButtonProps>): string[] {
  if (!isSwitchable(props)) return [];
  const checked = props.switchChecked === true;
  switch (props.switchBehaviour) {
    case "role-switch":
      return [`role="switch"`, `aria-checked="${checked}"`];
    case "aria-pressed":
      return [`aria-pressed="${checked}"`];
    default:
      return [];
  }
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
  externalLabelId?: string,
): string {
  const label = escapeHtml(props.label ?? DEFAULT_LABEL);
  // When the label lives outside the button (pilled switch), the
  // accessible name is provided by aria-labelledby and the button's
  // text content is empty.
  const content = externalLabelId
    ? ""
    : props.contentType === "icon"
      ? '<span aria-hidden="true">&#128269;</span>'
      : label;

  const attrs: string[] = [];
  if (explicitType) attrs.push(`type="${explicitType}"`);
  if (props.name) attrs.push(`name="${escapeAttribute(props.name)}"`);
  if (props.value) attrs.push(`value="${escapeAttribute(props.value)}"`);
  if (externalLabelId) {
    attrs.push(`aria-labelledby="${externalLabelId}"`);
  } else if (props.ariaLabel) {
    attrs.push(`aria-label="${escapeAttribute(props.ariaLabel)}"`);
  }
  attrs.push(...toggleAttrs(props));
  attrs.push(...switchAttrs(props));
  if (props.disabled) attrs.push("disabled");
  if (style) attrs.push(`style="${style}"`);

  return `<button ${withInspectedClass(attrs, props).join(" ")}>${content}</button>`;
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

  return `<input ${withInspectedClass(attrs, props).join(" ")}>`;
}

function renderInputCheckboxSwitch(
  props: Partial<ButtonProps>,
  style: string,
): string {
  const label = escapeHtml(props.label ?? DEFAULT_LABEL);
  const attrs: string[] = [
    `id="${SWITCH_INPUT_ID}"`,
    `type="checkbox"`,
    `role="switch"`,
  ];
  if (props.name) attrs.push(`name="${escapeAttribute(props.name)}"`);
  if (props.value) attrs.push(`value="${escapeAttribute(props.value)}"`);
  if (props.switchChecked) attrs.push("checked");
  if (props.disabled) attrs.push("disabled");
  if (style) attrs.push(`style="${style}"`);

  const input = `<input ${withInspectedClass(attrs, props).join(" ")}>`;
  return `<label for="${SWITCH_INPUT_ID}"><span>${label}</span>${input}</label>`;
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

  return `<input ${withInspectedClass(attrs, props).join(" ")}>`;
}

export function renderButton(props?: Partial<ButtonProps>): RenderedFragment {
  if (!props) return { html: `<button>${DEFAULT_LABEL}</button>` };

  const style = buildInlineStyle(props);
  const css = buildCss(props);
  const renderAs = props.renderAs ?? "button";
  const pilled = isPilledSwitch(props);

  let element: string;
  if (renderAs === "input-image") {
    element = renderInputImage(props, style);
  } else if (renderAs === "input-checkbox-switch") {
    element = renderInputCheckboxSwitch(props, style);
  } else {
    const inputType = INPUT_TYPE_BY_RENDER_AS[renderAs];
    if (inputType) {
      element = renderInputButton(inputType, props, style);
    } else {
      const explicitButtonType = BUTTON_TYPE_BY_RENDER_AS[renderAs];
      element = renderNativeButton(
        props,
        style,
        explicitButtonType,
        pilled ? SWITCH_LABEL_ID : undefined,
      );
    }
  }

  // Pilled switches render the label as a sibling element instead of
  // inside the button. The accessible name flows from aria-labelledby
  // on the button to the span's id, matching the canonical production
  // pattern (visible label left, switch right).
  if (pilled) {
    const labelText = escapeHtml(props.label ?? DEFAULT_LABEL);
    element =
      `<div class="${SWITCH_WRAP_CLASS}">` +
      `<span id="${SWITCH_LABEL_ID}">${labelText}</span>` +
      element +
      `</div>`;
  }

  return css ? { html: element, css } : { html: element };
}
