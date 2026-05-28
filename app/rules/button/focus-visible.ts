import type { Rule } from "../types";
import { _internal } from "~/composables/useContrast";

// Axe-core has no general "focus not visible" check — the rule depends
// on CSS values that aren't computable without painting. AccessLab can
// run the check because the override values are in our prop bag.

export const focusNotVisible: Rule = {
  id: "focus-not-visible",
  title: "Focus indicator removed",
  wcag: "SC 2.4.7 Focus Visible — Level AA",
  tags: ["wcag2aa", "wcag247"],
  description:
    "The focus ring override is enabled with a width of 0, leaving the button with no visible focus indicator. Sighted keyboard users can no longer tell which element is focused as they tab through the page. In production code this typically happens when `outline: none` is added (often in a CSS reset) and not replaced.",
  help: "Restore a visible focus indicator — either remove the override to bring back the browser default, or set a width and colour that meet contrast and thickness requirements.",
  helpUrl: "https://www.w3.org/WAI/WCAG22/Understanding/focus-visible.html",
  evaluate(props) {
    if (!props.focusRingEnabled) return null;
    const width = Number(props.focusRingWidth ?? 0);
    if (width > 0) return null;
    return {
      severity: "serious",
      measurement:
        "Focus ring width is 0 — keyboard users have no visible cue as they tab onto this button.",
    };
  },
};

const PAGE_BACKDROP = "#ffffff";
const MIN_NON_TEXT_CONTRAST = 3;

export const focusLowContrast: Rule = {
  id: "focus-low-contrast",
  title: "Focus indicator below 3:1 contrast",
  wcag: "SC 1.4.11 Non-text Contrast — Level AA",
  tags: ["wcag2aa", "wcag1411"],
  description:
    "The focus indicator's colour has less than 3:1 contrast against the surrounding page background. Sighted keyboard users with low vision or in poor lighting cannot reliably see where focus is. The 3:1 ratio is the WCAG 1.4.11 floor for all non-text UI components, including focus indicators.",
  help: "Pick a focus-ring colour with at least 3:1 contrast against the colour immediately around the button. A dark ring on a light page or a light ring on a dark page is the safest pairing.",
  helpUrl: "https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html",
  evaluate(props) {
    if (!props.focusRingEnabled) return null;
    const color = props.focusRingColor as string | undefined;
    if (!color) return null;
    // Avoid double-flagging when the ring is zero-width — focusNotVisible
    // covers that case at higher severity.
    const width = Number(props.focusRingWidth ?? 0);
    if (width === 0) return null;

    const ratio = _internal.computeRatio(color, PAGE_BACKDROP, {
      fontSizePx: 16,
      bold: false,
      pageBackdrop: PAGE_BACKDROP,
      algorithm: "wcag2",
    });

    if (ratio >= MIN_NON_TEXT_CONTRAST) return null;
    return {
      severity: "serious",
      measurement: `Focus ring contrast vs. page background: ${ratio.toFixed(2)}:1 (needs ≥ 3:1).`,
    };
  },
};
