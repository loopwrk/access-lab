import { renderButton } from "../shared/render";
import { variants } from "../shared/variants";
import { formWrapper, linkWrapper } from "../shared/wrappers";
import type { ButtonProps } from "../shared/types";
import {
  targetSizeAA,
  targetSizeAAA,
} from "~/rules/buttons/shared/target-size";
import { focusableInAnchor } from "~/rules/buttons/shared/focusable-in-anchor";
import {
  focusNotVisible,
  focusLowContrast,
} from "~/rules/buttons/shared/focus-visible";
import { toggleStateMissing } from "~/rules/buttons/toggle-buttons/toggle-state-missing";
import { toggleWrongAttribute } from "~/rules/buttons/toggle-buttons/toggle-wrong-attribute";
import { buttonManualChecklist } from "~/rules/buttons/shared/manual-checklist";
import type { ComponentDefinition, RenderedFragment } from "~/types/component";

const SAMPLE_TEXT = "This sample text turns bold when the toggle is on.";

// Production-style JS shown in the JavaScript pane. The studio's iframe
// runs the simpler version (defined in preview-shell.html) on every
// onclick — but the JS pane shows whichever production pattern best fits
// the active behaviour so a student copying the code learns the right
// idiom for the HTML they're looking at.

// For the canonical aria-pressed behaviour: the JS also keeps
// aria-pressed in sync. Production code that omits this flip would
// leave screen-reader users with a stale state.
const ARIA_PRESSED_TOGGLE_JS = `const button = document.querySelector('[aria-pressed]');
const text = document.querySelector('p');

function toggleBold() {
   const isPressed = button.getAttribute('aria-pressed') === 'true';
   button.setAttribute('aria-pressed', String(!isPressed));
   const isBold = text.querySelector('strong') !== null;
   text.innerHTML = isBold ? text.textContent : "<strong>" + text.textContent + "</strong>";
}`;

// For the aria-checked (wrong attribute), visual-only, and "none"
// behaviours the minimum production-style code is just the strong-wrap
// toggle — no ARIA to flip.
const SIMPLE_TOGGLE_JS = `const text = document.querySelector('p');

function toggleBold() {
   const isBold = text.querySelector('strong') !== null;
   text.innerHTML = isBold ? text.textContent : "<strong>" + text.textContent + "</strong>";
}`;

function jsForBehaviour(props?: Partial<ButtonProps>): string {
  if (props?.toggleBehaviour === "aria-pressed") return ARIA_PRESSED_TOGGLE_JS;
  return SIMPLE_TOGGLE_JS;
}

// Add `onclick="toggleBold()"` to the inspected button so the rendered
// HTML reads as production-style code. The actual function lives in
// the iframe shell (see preview-shell.html); on click, it wraps/unwraps
// the sample paragraph's text in `<strong>`. The host also re-renders
// after the click bridge fires demo:click — the renderer produces the
// same markup, so the inline path and the state-driven path converge.
function injectOnclickHandler(html: string): string {
  return html.replace("<button ", `<button onclick="toggleBold()" `);
}

// The shared renderer emits a generic magnifying-glass glyph for any icon-
// content button. Toggle buttons specifically demonstrate Bold, so when the
// user turns on icon content we swap in the Lucide "bold" icon instead. Scoped
// to this component only — every other button keeps the shared magnifier.
// SHARED_ICON is the exact markup renderNativeButton emits in shared/render.ts;
// the replace is a no-op for text content (the string isn't present). The icon
// is sized in em and strokes in currentColor so it tracks the button's font
// size and text colour like the magnifier it replaces.
const SHARED_ICON = "<span aria-hidden=\"true\">&#128269;</span>";
const BOLD_ICON
  = "<span aria-hidden=\"true\" style=\"display: inline-flex; vertical-align: middle;\">"
    + "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"1em\" height=\"1em\" viewBox=\"0 0 24 24\">"
    + "<path fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\" d=\"M6 12h9a4 4 0 0 1 0 8H7a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h7a4 4 0 0 1 0 8\"/>"
    + "</svg></span>";

function swapInBoldIcon(html: string): string {
  return html.replace(SHARED_ICON, BOLD_ICON);
}

// Toggle buttons always render with a paragraph of sample text below
// the inspected button. When the toggle is pressed, the text is wrapped
// in `<strong>` so the user sees the toggle's effect happen on real
// content — making the "apply or remove an effect" mental model visible
// without having to read the HTML pane. The sample text is part of the
// rendered output (not a context wrapper) because it isn't a container
// that surrounds the button — it's a sibling that demonstrates state.
function renderToggleButton(props?: Partial<ButtonProps>): RenderedFragment {
  const { html, css } = renderButton(props);
  const htmlWithHandler = swapInBoldIcon(injectOnclickHandler(html));
  const pressed = props?.togglePressed === true;
  const formatted = pressed ? `<strong>${SAMPLE_TEXT}</strong>` : SAMPLE_TEXT;
  const wrapped
    = `<div style="display: flex; flex-direction: column; gap: 0.85em; align-items: flex-start; font-family: Arial, Helvetica, sans-serif;">`
      + htmlWithHandler
      + `<p style="margin: 0; max-width: 32ch; color: #000;">${formatted}</p>`
      + `</div>`;
  const js = jsForBehaviour(props);
  return css ? { html: wrapped, css, js } : { html: wrapped, js };
}

export const toggleButtonDefinition: ComponentDefinition<ButtonProps> = {
  id: "buttons-toggle-buttons",
  name: "Toggle Button",
  tagName: "button",

  defaultProps: {
    renderAs: "button-button",
    wrappers: [],
    label: "Bold",
    value: "",
    name: "",
    src: "",
    alt: "",
    disabled: false,
    contentType: "text",
    focusRingEnabled: false,
    toggleBehaviour: "aria-pressed",
    togglePressed: false,
  },

  variants: variants(["button-button", "button"]),

  contextWrappers: [formWrapper, linkWrapper],

  controls: [],

  domRules: [targetSizeAA, targetSizeAAA],

  rules: [
    focusableInAnchor,
    focusNotVisible,
    focusLowContrast,
    toggleStateMissing,
    toggleWrongAttribute,
  ],
  primaryLearnTopicId: "toggle-buttons",
  relatedLearnTopicIds: [
    "toggle-vs-switch",
    "switches",
    "accessible-name",
    "vague-label",
    "button-disabled-states",
  ],
  relevantConcepts: ["button-element", "aria-state", "accessible-name"],
  manualChecklist: buttonManualChecklist,
  render: renderToggleButton,
  controlsComponent: defineAsyncComponent(
    () => import("./ToggleButtonControls.vue"),
  ),
  // Click feedback is visible in the iframe — the sample text below
  // the button flips into <strong> when the toggle is pressed. The
  // generic "Click event fired" toast would be redundant noise.
  suppressDemoClickToast: true,
};
