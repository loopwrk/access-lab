import type { Rule } from "~/rules/types";

/**
 * Flags a <button> that has an accessible name (via aria-label) but no visible
 * content — no text and no icon.
 *
 * This is deliberately NOT a WCAG failure. The button has a valid accessible
 * name, so it passes axe-core's button-name check and every name-related
 * Success Criterion. WCAG 2.x simply has no criterion that requires a *visible*
 * label on a named control — it is built around parity for assistive-technology
 * users and is silent on this case. AccessLab flags it anyway, as a best
 * practice, because a sighted user sees an empty control and has no way to tell
 * what it does.
 *
 * An icon button — aria-label paired with a visible icon — is the accepted
 * pattern and is not flagged. Mirrors the input rule
 * `input-aria-label-without-visible-label`.
 */
export const ariaLabelWithoutVisibleContent: Rule = {
  id: "button-aria-label-without-visible-content",
  title: "Button has an accessible name but no visible content",
  wcag: "Best practice (not a WCAG success criterion)",
  tags: ["best-practice"],
  description:
    "This is not a WCAG failure. The button has a valid accessible name from its aria-label, so it passes automated name checks (axe-core sees the name) and screen reader users hear it. WCAG 2.x has no Success Criterion that requires a visible label on an already-named control, so nothing formally flags it. AccessLab flags it because a sighted user sees an empty control - no text, no icon - and has no way to tell what it does. An icon button (aria-label plus a visible icon) is the accepted pattern; a button with nothing visible is not.",
  help: "Give the button visible content alongside its accessible name: add visible text, or — for an icon button — switch Button Content to Icon so a recognisable glyph is shown.",
  helpUrl: "https://www.w3.org/WAI/ARIA/apg/patterns/button/",
  learnTopicId: "accessible-name",
  evaluate(props) {
    const ariaName = typeof props.ariaLabel === "string" ? props.ariaLabel.trim() : "";
    // No aria-label → either it has visible text (named that way) or it is
    // genuinely nameless, which axe-core's button-name reports. Don't double-flag.
    if (!ariaName) return null;

    const hasVisibleText = typeof props.label === "string" && props.label.trim().length > 0;
    if (hasVisibleText) return null;
    // An icon conveys the button's purpose to sighted users — the accepted
    // icon-button pattern, not an empty control.
    if (props.contentType === "icon") return null;

    // Only <button>-tag variants can be visually empty. An <input type="submit">
    // with an empty value shows the browser's default text, and an
    // <input type="image"> shows its image — neither is empty.
    const renderAs = typeof props.renderAs === "string" ? props.renderAs : "";
    if (renderAs.startsWith("input-")) return null;

    // Switch variants render a visible sibling label, so they aren't empty.
    if (props.switchBehaviour != null && props.switchBehaviour !== "none") return null;

    return {
      severity: "serious",
      measurement: `Not a WCAG failure — the button has a valid accessible name ("${props.ariaLabel}"). AccessLab flags it because the button shows no visible text or icon, so sighted users see an empty control with no way to tell what it does.`,
    };
  },
};
