import type { Rule } from "../types";

/**
 * Detect when an element's text colour exactly matches its background.
 *
 * Why this rule exists: axe-core deliberately skips its `color-contrast`
 * check when foreground and background match exactly — the reasoning is
 * that an identical-colour pair is one of the legitimate techniques used
 * for screen-reader-only content (visually hidden labels, ARIA-described
 * context, etc.). Defensive behaviour for production audits, but it leaves
 * a gap in an exploratory tool where the user has deliberately picked both
 * colours from the same picker.
 *
 */
function normalizeColor(value: unknown): string | null {
  if (typeof value !== "string") return null;
  return value.trim().toLowerCase();
}

export const invisibleText: Rule = {
  id: "invisible-text",
  title: "Text colour matches background",
  wcag: "SC 1.4.3 Contrast (Minimum) — Level AA",
  description:
    "The foreground (text) colour is exactly the same as the background. The text is invisible to sighted users while remaining in the DOM, so screen readers will still announce it and automated audits that skip identical-colour pairs (including axe-core) will not flag it.",
  help: "Choose distinct foreground and background colours — at least 4.5:1 contrast for AA, 7:1 for AAA",
  helpUrl: "https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html",
  learnTopicId: "topic-invisible-text",
  evaluate(props) {
    const bg = normalizeColor(props.bg);
    const fg = normalizeColor(props.fgText);
    if (!bg || !fg || bg !== fg) return null;
    return {
      severity: "critical",
      measurement: `Text colour ${props.fgText} matches background ${props.bg} — content is invisible to sighted users.`,
    };
  },
};
