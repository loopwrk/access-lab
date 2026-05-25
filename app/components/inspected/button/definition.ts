import { renderButton } from "./render";
import { targetSizeAA, targetSizeAAA } from "~/rules/button/target-size";
import { buttonManualChecklist } from "~/rules/button/manual-checklist";

export interface ButtonProps {
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

export const buttonDefinition = {
  id: "button" as const,
  name: "Button",
  tagName: "button" as const,

  defaultProps: {
    label: "Button Label",
    contentType: "text" as const,
  },

  controls: [
    { kind: "text" as const, key: "label", label: "Button Label" },
    {
      kind: "group" as const,
      label: "Dimensions",
      controls: [
        {
          kind: "slider" as const,
          key: "width",
          label: "Width",
          min: 16,
          max: 400,
          step: 10,
          unit: "px",
        },
        {
          kind: "slider" as const,
          key: "height",
          label: "Height",
          min: 16,
          max: 400,
          step: 10,
          unit: "px",
        },
        {
          kind: "slider" as const,
          key: "padding",
          label: "Padding",
          min: 0,
          max: 120,
          step: 2,
          unit: "px",
          splittable: true,
        },
      ],
    },
    {
      kind: "group" as const,
      label: "Border",
      controls: [
        {
          kind: "slider" as const,
          key: "borderWidth",
          label: "Border width",
          min: 0,
          max: 20,
          step: 1,
          unit: "px",
          splittable: true,
        },
      ],
    },
    {
      kind: "group" as const,
      label: "Text",
      controls: [
        {
          kind: "slider" as const,
          key: "fontSize",
          label: "Font size",
          min: 8,
          max: 128,
          step: 2,
          unit: "px",
        },
      ],
    },
    {
      kind: "group" as const,
      label: "Colours",
      controls: [
        { kind: "colour" as const, key: "bg", label: "Background" },
        { kind: "colour" as const, key: "fgText", label: "Text colour" },
        { kind: "colour" as const, key: "borderColor", label: "Border colour" },
      ],
    },
    {
      kind: "group" as const,
      label: "ARIA",
      controls: [
        {
          kind: "segmented" as const,
          key: "contentType",
          label: "Button content",
          options: [
            { value: "text", label: "Text" },
            { value: "icon", label: "Icon" },
          ],
        },
        {
          kind: "text" as const,
          key: "ariaLabel",
          label: "aria-label",
          placeholder: "e.g. Search products",
        },
      ],
    },
  ],

  rules: [targetSizeAA, targetSizeAAA],
  manualChecklist: buttonManualChecklist,
  render: renderButton,
};
