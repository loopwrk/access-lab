import { renderInput } from "./render";
import type { ComponentDefinition } from "~/types/component";
import type { CssLength } from "~/composables/useUnitConversion";
export interface InputProps {
  // Content
  label: string;
  placeholder: string;
  helpText: string;
  type: "text" | "email" | "tel" | "url" | "password" | "number" | "search";
  name: string;
  required: boolean;
  showLabel: boolean;
  ariaLabel: string;
  fontSize: CssLength;
  bg: string;
  fgText: string;
  borderColor: string;
}

export const inputDefinition: ComponentDefinition<InputProps> = {
  id: "input",
  name: "Input",
  tagName: "input",
  defaultProps: {
    label: "Email",
    placeholder: "",
    helpText: "",
    type: "email",
    name: "email",
    required: false,
    showLabel: true,
    ariaLabel: "",
  },
  controls: [],
  rules: [],
  manualChecklist: [],
  render: renderInput,
  controlsComponent: defineAsyncComponent(() => import("./InputControls.vue")),
  relevantConcepts: ["form-control", "accessible-name", "form-context", "native-elements"],
};
