interface ButtonProps {
  label: string;
  width: number;
  height: number;
  padding: number;
  paddingTop: number;
  paddingRight: number;
  paddingBottom: number;
  paddingLeft: number;
  fontSize: number;
  bg: string;
  fgText: string;
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

  const styleStr = style.join(";");

  const label = escape(props.label || "Click Me!");

  return styleStr
    ? `<button style="${styleStr}">${label}</button>`
    : `<button>${label}</button>`;
}
