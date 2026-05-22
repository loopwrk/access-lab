interface ButtonProps {
  label: string;
  width: number;
  height: number;
  padding: number;
  paddingTop: number;
  paddingRight: number;
  paddingBottom: number;
  paddingLeft: number;
  borderWidth: number;
  borderTopWidth: number;
  borderRightWidth: number;
  borderBottomWidth: number;
  borderLeftWidth: number;
  fontSize: number;
  bg: string;
  fgText: string;
  borderColor: string;
  ariaLabel: string;
  contentType: "text" | "icon";
}

function escape(str: string): string {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export function renderButton(props?: Partial<ButtonProps>): string {
  if (!props) return "<button>Click Me!</button>";

  const style: string[] = [];

  if (props.bg) style.push(`background:${props.bg}`);
  if (props.fgText) style.push(`color:${props.fgText}`);
  if (props.width) style.push(`min-width:${props.width}px`);
  if (props.height) style.push(`min-height:${props.height}px`);
  if (props.fontSize) style.push(`font-size:${props.fontSize}px`);

  const hasIndividualPadding =
    props.paddingTop != null ||
    props.paddingRight != null ||
    props.paddingBottom != null ||
    props.paddingLeft != null;

  if (hasIndividualPadding) {
    const fallback = props.padding ?? 0;
    const pt = props.paddingTop ?? fallback;
    const pr = props.paddingRight ?? fallback;
    const pb = props.paddingBottom ?? fallback;
    const pl = props.paddingLeft ?? fallback;
    style.push(`padding:${pt}px ${pr}px ${pb}px ${pl}px`);
  } else if (props.padding != null) {
    style.push(`padding:${props.padding}px`);
  }

  const hasIndividualBorder =
    props.borderTopWidth != null ||
    props.borderRightWidth != null ||
    props.borderBottomWidth != null ||
    props.borderLeftWidth != null;

  if (hasIndividualBorder) {
    const fallback = props.borderWidth ?? 0;
    const bt = props.borderTopWidth ?? fallback;
    const br = props.borderRightWidth ?? fallback;
    const bb = props.borderBottomWidth ?? fallback;
    const bl = props.borderLeftWidth ?? fallback;
    style.push(
      `border-top-width:${bt}px`,
      `border-right-width:${br}px`,
      `border-bottom-width:${bb}px`,
      `border-left-width:${bl}px`,
      `border-style:solid`,
    );
  } else if (props.borderWidth != null && props.borderWidth > 0) {
    style.push(`border-width:${props.borderWidth}px`, "border-style:solid");
  }

  if (
    props.borderColor &&
    (hasIndividualBorder ||
      (props.borderWidth != null && props.borderWidth > 0))
  ) {
    style.push(`border-color:${props.borderColor}`);
  }

  const styleStr = style.join(";");

  const label = escape(props.label ?? "Click Me!");

  const attrs: string[] = [];
  if (props.ariaLabel) attrs.push(`aria-label="${escape(props.ariaLabel)}"`);

  const content =
    props.contentType === "icon"
      ? '<span aria-hidden="true">&#128269;</span>'
      : label;

  const html = `<button${attrs.length ? " " + attrs.join(" ") : ""}${styleStr ? ` style="${styleStr}"` : ""}>${content}</button>`;

  return html;
}
