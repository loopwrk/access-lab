import type { Rule } from "~/rules/types";
import { _internal } from "~/composables/useContrast";

/**
 * Catches low-contrast placeholder text — the case axe-core misses.
 *
 * axe-core's color-contrast rule only checks elements whose text is in
 * the DOM. Placeholders are HTML attributes rendered via the
 * `::placeholder` pseudo-element with no underlying text node, so axe
 * has nothing to grab. The result: placeholders styled with white or
 * near-white text on a light background ship to production without
 * triggering any automated audit.
 *
 * This rule fires when:
 *   - the input has a non-empty `placeholder` value, AND
 *   - the user has set a custom `placeholderStyle.fgText` colour, AND
 *   - the contrast ratio between that colour and the input's
 *     background drops below 4.5:1 (WCAG 1.4.3 Level AA minimum for
 *     normal text).
 *
 * Why threshold 4.5 and not 3.0: placeholders are conventionally
 * rendered at the input's font-size, well under the "large text" cut-
 * off (24px regular / 18.67px bold). A more precise rule would track
 * the resolved font-size; this version uses the more conservative
 * threshold instead, which catches the failure mode that matters most
 * (low-vision users reading hint text inside an input).
 */
export const placeholderContrast: Rule = {
  id: "input-placeholder-contrast",
  title: "Placeholder text contrast is too low",
  wcag: "SC 1.4.3 Contrast (Minimum) — Level AA",
  tags: ["wcag2aa", "wcag143"],
  description:
    "Placeholder text must reach a contrast ratio of at least 4.5:1 against the input's background. Automated tools like axe-core do not check the `::placeholder` colour — the placeholder is rendered via a CSS pseudo-element with no DOM text content, so the standard contrast pass cannot see it. The result: low-contrast placeholders typically ship unnoticed. They are unreadable for users with low vision, users in bright environments, and users with custom themes that the colour was not tested against.",
  help: "Increase the contrast between the placeholder text colour and the input background to at least 4.5:1.",
  helpUrl: "https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html",
  learnTopicId: "accessible-name",
  evaluate(props) {
    const placeholder = typeof props.placeholder === "string" ? props.placeholder : "";
    if (placeholder.length === 0) return null;

    const placeholderStyle = props.placeholderStyle as
      | { fgText?: string }
      | undefined;
    const fgText = placeholderStyle?.fgText;
    if (typeof fgText !== "string" || fgText.length === 0) return null;

    // Input background — defaults to white when the user has not set
    // a custom background colour (which matches the browser default).
    const bg = typeof props.bg === "string" && props.bg.length > 0
      ? props.bg
      : "#ffffff";

    const ratio = _internal.computeRatio(fgText, bg, {
      fontSizePx: 16,
      bold: false,
      pageBackdrop: "#ffffff",
      algorithm: "wcag2",
    });

    if (ratio >= 4.5) return null;

    return {
      severity: "serious",
      measurement:
        `Placeholder colour ${fgText} on background ${bg} measures ${ratio.toFixed(2)}:1 — fails WCAG AA minimum of 4.5:1 for normal text.`,
    };
  },
};
