import type { Rule } from "../types";
import { _internal } from "~/composables/useContrast";

/**
 * Detect when an element's text colour exactly matches its background.
 *
 * Why this rule exists: axe-core deliberately skips its `color-contrast`
 * check when foreground and background resolve to the same colour - an
 * identical-colour pair is a legitimate screen-reader-only technique
 * (visually hidden labels, ARIA-described context, etc.). That leaves a gap
 * in an exploratory tool where the user has deliberately set both the same.
 *
 * Colours are compared by PARSED value, not by string, so `#fff`, `#ffffff`
 * and `rgb(255 255 255)` all count as the same colour - which is exactly the
 * set axe skips, so a string-only check would leave that same gap. Falls back
 * to a trimmed, case-insensitive string match for values the parser doesn't
 * understand (e.g. named colours).
 */
function colorsMatch(a: string, b: string): boolean {
  const pa = _internal.parseColor(a);
  const pb = _internal.parseColor(b);
  if (pa && pb) {
    return pa.r === pb.r && pa.g === pb.g && pa.b === pb.b && pa.a === pb.a;
  }
  return a.toLowerCase() === b.toLowerCase();
}

export const invisibleText: Rule = {
  id: "invisible-text",
  title: "Text colour matches background",
  wcag: "SC 1.4.3 Contrast (Minimum) - Level AA",
  tags: ["wcag2aa", "wcag143"],
  description:
    "The foreground (text) colour is exactly the same as the background. The text is invisible to sighted users while remaining in the DOM, so screen readers will still announce it and automated audits that skip identical-colour pairs (including axe-core) will not flag it.",
  help: "Choose distinct foreground and background colours - at least 4.5:1 contrast for AA, 7:1 for AAA",
  helpUrl: "https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html",
  learnTopicId: "invisible-text",
  evaluate(props) {
    const fg = typeof props.fgText === "string" ? props.fgText.trim() : "";
    const bg = typeof props.bg === "string" ? props.bg.trim() : "";
    if (!fg || !bg || !colorsMatch(fg, bg)) return null;
    return {
      severity: "critical",
      measurement: `Text colour ${props.fgText} matches background ${props.bg} - content is invisible to sighted users.`,
    };
  },
};
