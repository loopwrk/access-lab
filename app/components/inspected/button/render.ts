interface ButtonProps {
  label: string;
  width: number;
  height: number;
  padding: number;
  fontSize: number;
  bg: string;
  color: string;
}

function escape(str: string): string {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export function renderButton(props?: Partial<ButtonProps>): string {
  if (!props) return "<button>Button</button>";

  const style = [
    props.bg && `background:${props.bg}`,
    props.color && `color:${props.color}`,
    props.width && `width:${props.width}px`,
    props.height && `height:${props.height}px`,
    props.fontSize && `font-size:${props.fontSize}px`,
    props.padding != null && `padding:${props.padding}px`,
  ]
    .filter(Boolean)
    .join(";");

  const label = escape(props.label || "Button");

  return style
    ? `<button style="${style}">${label}</button>`
    : `<button>${label}</button>`;
}
