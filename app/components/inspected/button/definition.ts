import { renderButton } from "./render";
import { targetSizeAA, targetSizeAAA } from "~/rules/button/target-size";
import { buttonManualChecklist } from "~/rules/button/manual-checklist";
import type { ComponentDefinition } from "~/types/component";

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

export const buttonDefinition: ComponentDefinition<ButtonProps> = {
  id: "button",
  name: "Button",
  tagName: "button",

  defaultProps: {
    label: "Trigger Demo Action",
    contentType: "text",
  },

  controls: [
    { kind: "text", key: "label", label: "Button Label" },
    {
      kind: "group",
      label: "Dimensions",
      controls: [
        {
          kind: "slider",
          key: "width",
          label: "Width",
          min: 16,
          max: 400,
          step: 10,
          unit: "px",
        },
        {
          kind: "slider",
          key: "height",
          label: "Height",
          min: 16,
          max: 400,
          step: 10,
          unit: "px",
        },
        {
          kind: "slider",
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
      kind: "group",
      label: "Border",
      controls: [
        {
          kind: "slider",
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
      kind: "group",
      label: "Text",
      controls: [
        {
          kind: "slider",
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
      kind: "group",
      label: "Colours",
      controls: [
        { kind: "colour", key: "bg", label: "Background" },
        { kind: "colour", key: "fgText", label: "Text colour" },
        { kind: "colour", key: "borderColor", label: "Border colour" },
      ],
    },
    {
      kind: "group",
      label: "ARIA",
      controls: [
        {
          kind: "segmented",
          key: "contentType",
          label: "Button content",
          options: [
            { value: "text", label: "Text" },
            { value: "icon", label: "Icon" },
          ],
        },
        {
          kind: "text",
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
