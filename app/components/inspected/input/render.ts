import type { InputProps } from "./definition";

function escape(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function renderInput(props?: Partial<InputProps>): string {
  const label = escape(props?.label ?? "Email");
  const type = escape(props?.type ?? "email");
  const name = escape(props?.name ?? "email");

  const attrs: string[] = [`type="${type}"`, `id="al-input"`, `name="${name}"`];
  if (props?.placeholder) {
    attrs.push(`placeholder="${escape(props.placeholder)}"`);
  }
  if (props?.required) attrs.push("required");

  const labelStyle = "display:block;margin-bottom:4px;";

  return [
    `<form>`,
    `<label for="al-input" style="${labelStyle}">${label}</label>`,
    `<input ${attrs.join(" ")} />`,
    `</form>`,
  ].join("");
}
