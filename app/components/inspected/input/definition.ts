import { renderInput } from "./render";
import type { ComponentDefinition } from "~/types/component";

/**
 * Props for the inspected `<input>` element.
 *
 * Today's controls panel is hardcoded to Button and won't render any
 * of these yet, but the props shape is in place so render.ts can be
 * driven once the panel decoupling lands.
 *
 * Future props (when controls are wired): autocomplete, disabled,
 * readonly, ariaLabel, ariaDescribedBy, helpText, errorMessage,
 * width, fontSize, padding, borderWidth, bg, fgText, borderColor.
 */
export interface InputProps {
  label: string;
  type: "text" | "email" | "tel" | "url" | "password" | "number" | "search";
  name: string;
  placeholder: string;
  required: boolean;
}

export const inputDefinition: ComponentDefinition<InputProps> = {
  id: "input",
  name: "Input",
  tagName: "input",
  defaultProps: {
    label: "Email",
    type: "email",
    name: "email",
  },
  // Controls, prop-based rules, and manual checklist will be filled in
  // when the panel decoupling lands. For now the input renders with
  // sensible defaults and any axe findings still flow through.
  controls: [],
  rules: [],
  manualChecklist: [],
  render: renderInput,
};
