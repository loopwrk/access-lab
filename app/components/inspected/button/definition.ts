import { renderButton } from "./render";
import { targetSizeAA, targetSizeAAA } from "~/rules/button/target-size";
import { buttonManualChecklist } from "~/rules/button/manual-checklist";
import type { ComponentDefinition } from "~/types/component";
import type { CssLength } from "~/composables/useUnitConversion";

export type ButtonRenderAs =
  | "button"
  | "button-submit"
  | "button-reset"
  | "button-button"
  | "input-submit"
  | "input-button"
  | "input-reset";

export interface ButtonProps {
  renderAs: ButtonRenderAs;
  wrappers: string[];
  label: string;
  width: CssLength;
  height: CssLength;
  padding: CssLength;
  paddingTop: CssLength;
  paddingRight: CssLength;
  paddingBottom: CssLength;
  paddingLeft: CssLength;
  borderWidth: CssLength;
  borderTopWidth: CssLength;
  borderRightWidth: CssLength;
  borderBottomWidth: CssLength;
  borderLeftWidth: CssLength;
  fontSize: CssLength;
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
    renderAs: "button-button",
    wrappers: [],
    label: "Trigger Demo Action",
    contentType: "text",
  },

  variants: [
    {
      key: "button-button",
      label: '<button type="button">',
      description: "components.button.variants.button-button.description",
      status: "recommended",
      statusNote: "components.button.variants.button-button.statusNote",
      section: "<button> Element",
    },
    {
      key: "button",
      label: "<button>",
      description: "components.button.variants.button.description",
      status: "avoid",
      statusNote: "components.button.variants.button.statusNote",
      section: "<button> Element",
    },
    {
      key: "button-submit",
      label: '<button type="submit">',
      description: "components.button.variants.button-submit.description",
      status: "info",
      statusNote: "components.button.variants.button-submit.statusNote",
      section: "<button> Element",
    },
    {
      key: "button-reset",
      label: '<button type="reset">',
      description: "components.button.variants.button-reset.description",
      status: "rare",
      statusNote: "components.button.variants.button-reset.statusNote",
      section: "<button> Element",
    },
    {
      key: "input-submit",
      label: '<input type="submit">',
      description: "components.button.variants.input-submit.description",
      status: "neutral",
      statusNote: "components.button.variants.input-submit.statusNote",
      section: "<input> Alternative",
    },
    {
      key: "input-button",
      label: '<input type="button">',
      description: "components.button.variants.input-button.description",
      status: "avoid",
      statusNote: "components.button.variants.input-button.statusNote",
      section: "<input> Alternative",
    },
    {
      key: "input-reset",
      label: '<input type="reset">',
      description: "components.button.variants.input-reset.description",
      status: "rare",
      statusNote: "components.button.variants.input-reset.statusNote",
      section: "<input> Alternative",
    },
  ],

  contextWrappers: [
    {
      key: "form",
      label: "<form>",
      learnTopicId: "form-wrapping",
      wrap: (renderedHtml: string) => `<form>${renderedHtml}</form>`,
    },
  ],

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
  // Lazy-loaded panel. Static import would cycle because ButtonControls
  // imports the ButtonProps type from this file. defineAsyncComponent
  // defers the panel module until ComponentStudio mounts it.
  controlsComponent: defineAsyncComponent(() => import("./ButtonControls.vue")),
};
