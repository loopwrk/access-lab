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
import { switchNoRole } from "~/rules/buttons/switches/switch-no-role";
import { switchWrongAttribute } from "~/rules/buttons/switches/switch-wrong-attribute";
import { buttonManualChecklist } from "~/rules/buttons/shared/manual-checklist";
import type { ComponentDefinition, RenderedFragment } from "~/types/component";

// Dark-mode demo CSS. Pairs with the `body.dark-mode` class that the
// iframe shell's pre-defined `toggleDarkMode()` function toggles when
// the rendered button's inline onclick fires. Visible in the CSS pane
// as production-canonical code.
const DARK_MODE_CSS = `body.dark-mode{background:#000;color:#fff;}`;

// Canonical production-style JS shown in the JavaScript pane. The
// studio's iframe actually runs the simpler version (defined in
// preview-shell.html) on every onclick — but the JS pane shows
// whichever production pattern best fits the active variant so a
// student copying the code learns the right idiom for their HTML.

// For the canonical role="switch" + aria-checked pattern: the JS
// also keeps aria-checked in sync. Production code that omits this
// flip would leave screen-reader users with a stale state.
const ROLE_SWITCH_DARK_MODE_JS = `const switchElement = document.querySelector('[role="switch"]');

function toggleDarkMode() {
   const isOn = switchElement.getAttribute('aria-checked') === 'true';
   switchElement.setAttribute('aria-checked', String(!isOn));
   document.body.classList.toggle("dark-mode");
}`;

// For the aria-pressed and "none" behaviours (and the native-checkbox
// variant whose `:checked` state the browser tracks automatically),
// the minimum production-style code is just the body-class toggle.
const SIMPLE_DARK_MODE_JS = `function toggleDarkMode() {
   document.body.classList.toggle("dark-mode");
}`;

function jsForVariant(props?: Partial<ButtonProps>): string {
  // The native-checkbox variant hardcodes role="switch" but tracks
  // state via the input's `:checked` (not aria-checked). Showing the
  // role-switch JS here would be misleading — it reads aria-checked.
  if (props?.renderAs === "input-checkbox-switch") return SIMPLE_DARK_MODE_JS;
  if (props?.switchBehaviour === "role-switch") return ROLE_SWITCH_DARK_MODE_JS;
  return SIMPLE_DARK_MODE_JS;
}

// Add `onclick="toggleDarkMode()"` to the inspected element so the
// rendered HTML reads as production-style code. The actual function
// lives in the iframe shell (see preview-shell.html); on click, it
// toggles `body.dark-mode` so the CSS rule above engages. For the
// native-checkbox variant the inspected element is `<input>`; for
// every other variant (including the pill-switch wrap, where the
// inspected pill is the only `<button>` in the output) it's
// `<button>`.
function injectOnclickHandler(
  html: string,
  variant: string | undefined,
): string {
  const opener = variant === "input-checkbox-switch" ? "<input " : "<button ";
  return html.replace(opener, `${opener}onclick="toggleDarkMode()" `);
}

function renderSwitch(props?: Partial<ButtonProps>): RenderedFragment {
  const { html, css } = renderButton(props);
  const htmlWithHandler = injectOnclickHandler(html, props?.renderAs);
  const combinedCss = css ? `${css}${DARK_MODE_CSS}` : DARK_MODE_CSS;
  return { html: htmlWithHandler, css: combinedCss, js: jsForVariant(props) };
}

export const switchDefinition: ComponentDefinition<ButtonProps> = {
  id: "buttons-switches",
  name: "Switch",
  tagName: "button",

  defaultProps: {
    renderAs: "button-button",
    wrappers: [],
    label: "Toggle dark mode",
    value: "",
    name: "",
    src: "",
    alt: "",
    disabled: false,
    contentType: "text",
    focusRingEnabled: false,
    switchBehaviour: "role-switch",
    switchChecked: false,
    switchPillStyling: true,
  },

  variants: variants(["button-button", "button", "input-checkbox-switch"]),

  contextWrappers: [formWrapper, linkWrapper],

  controls: [],

  domRules: [targetSizeAA, targetSizeAAA],

  rules: [
    focusableInAnchor,
    focusNotVisible,
    focusLowContrast,
    switchNoRole,
    switchWrongAttribute,
  ],
  primaryLearnTopicId: "switches",
  relatedLearnTopicIds: [
    "toggle-vs-switch",
    "toggle-buttons",
    "checkbox",
    "accessible-name",
    "native-rendering",
  ],
  relevantConcepts: ["button-element", "aria-state", "form-control", "accessible-name"],
  manualChecklist: buttonManualChecklist,
  render: renderSwitch,
  controlsComponent: defineAsyncComponent(() => import("./SwitchControls.vue")),
  // The switch demo's only effect is the dark-mode background flip in
  // the iframe — the generic "Click event fired" toast would be noise
  // on every toggle.
  suppressDemoClickToast: true,
};
