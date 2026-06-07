import type { Rule } from "~/rules/types";

/**
 * Fires when a native `<input type="checkbox">` has `aria-checked` set.
 *
 * The browser already exposes the checked state through the native
 * checkbox role and the `checked` DOM property — `aria-checked` adds
 * nothing assistive technology doesn't already get. It also introduces
 * two sources of truth that need to be kept in sync; production code
 * that updates one but not the other ends up with the visible state
 * and the announced state disagreeing.
 *
 * Not flagged for the `div-checkbox` variant — there, `aria-checked`
 * is the only mechanism for exposing state, so it's required, not
 * redundant.
 *
 * Severity is `minor` — it isn't broken, just unnecessary and harder
 * to read. Shown as a warning rather than a critical violation.
 */
export const checkboxAriaCheckedRedundant: Rule = {
  id: "checkbox-aria-checked-redundant",
  title: "aria-checked is redundant on a native checkbox",
  wcag: "Best practice — First Rule of ARIA",
  tags: ["best-practice"],
  description:
    "A native `<input type=\"checkbox\">` already exposes its checked state to assistive technology through the browser's built-in checkbox role and the `checked` DOM property. Adding `aria-checked` does not break anything, but it duplicates a state the browser already manages — and the two can drift out of sync if your JavaScript only updates one of them. The W3C calls this the First Rule of ARIA: do not use ARIA when a native HTML element already provides the role, state, or property.",
  help: "Remove `aria-checked` from the native checkbox. The browser's built-in checked state already conveys this to assistive technology.",
  helpUrl: "https://www.w3.org/TR/using-aria/#firstrule",
  learnTopicId: "checkbox",
  evaluate(props) {
    if (props.renderAs !== "input-checkbox") return null;
    if (props.ariaChecked !== true) return null;
    return {
      severity: "minor",
      measurement:
        "aria-checked is set on a native <input type=\"checkbox\"> — the browser already tracks the checked state via the built-in checkbox role.",
    };
  },
};
