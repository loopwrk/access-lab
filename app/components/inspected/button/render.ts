import type { ButtonProps } from "./definition";
import type { CssLength } from "~/composables/useUnitConversion";

function escape(str: string): string {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function fmt(length: CssLength): string {
  return `${length.value}${length.unit}`;
}

function side(
  explicit: CssLength | undefined,
  shorthand: CssLength | undefined,
): CssLength {
  return explicit ?? shorthand ?? { value: 0, unit: "px" };
}

export function renderButton(props?: Partial<ButtonProps>): string {
  if (!props) return "<button>Button Label</button>";

  const style: string[] = [];

  if (props.bg) style.push(`background:${props.bg}`);
  if (props.fgText) style.push(`color:${props.fgText}`);
  if (props.width) style.push(`width:${fmt(props.width)}`);
  if (props.height) style.push(`height:${fmt(props.height)}`);
  if (props.fontSize) style.push(`font-size:${fmt(props.fontSize)}`);

  const hasIndividualPadding =
    props.paddingTop != null ||
    props.paddingRight != null ||
    props.paddingBottom != null ||
    props.paddingLeft != null;

  if (hasIndividualPadding) {
    const pt = side(props.paddingTop, props.padding);
    const pr = side(props.paddingRight, props.padding);
    const pb = side(props.paddingBottom, props.padding);
    const pl = side(props.paddingLeft, props.padding);
    style.push(`padding:${fmt(pt)} ${fmt(pr)} ${fmt(pb)} ${fmt(pl)}`);
  } else if (props.padding != null) {
    style.push(`padding:${fmt(props.padding)}`);
  }

  const hasIndividualBorder =
    props.borderTopWidth != null ||
    props.borderRightWidth != null ||
    props.borderBottomWidth != null ||
    props.borderLeftWidth != null;

  if (hasIndividualBorder) {
    const bt = side(props.borderTopWidth, props.borderWidth);
    const br = side(props.borderRightWidth, props.borderWidth);
    const bb = side(props.borderBottomWidth, props.borderWidth);
    const bl = side(props.borderLeftWidth, props.borderWidth);
    style.push(
      `border-top-width:${fmt(bt)}`,
      `border-right-width:${fmt(br)}`,
      `border-bottom-width:${fmt(bb)}`,
      `border-left-width:${fmt(bl)}`,
      `border-style:solid`,
    );
  } else if (props.borderWidth != null && props.borderWidth.value > 0) {
    style.push(`border-width:${fmt(props.borderWidth)}`, "border-style:solid");
  }

  const hasBorder =
    hasIndividualBorder ||
    (props.borderWidth != null && props.borderWidth.value > 0);
  if (props.borderColor && hasBorder) {
    style.push(`border-color:${props.borderColor}`);
  }

  const styleStr = style.join(";");

  const label = escape(props.label ?? "Button Label");

  const attrs: string[] = [];
  if (props.ariaLabel) attrs.push(`aria-label="${escape(props.ariaLabel)}"`);

  const content =
    props.contentType === "icon"
      ? '<span aria-hidden="true">&#128269;</span>'
      : label;

  const html = `<button${attrs.length ? " " + attrs.join(" ") : ""}${styleStr ? ` style="${styleStr}"` : ""} onclick="parent.postMessage({type:'demo:click'},window.location.origin)">${content}</button>`;

  return html;
}
