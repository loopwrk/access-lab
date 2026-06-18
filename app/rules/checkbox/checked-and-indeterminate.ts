import type { Rule } from "~/rules/types";

/**
 * Fires when a checkbox has both `checked` and `indeterminate` set to
 * true at the same time.
 *
 * At the HTML level the two flags are orthogonal - `indeterminate` is
 * a JS-only IDL property that changes the rendered appearance but does
 * not touch `checked`. The result is that the visual state (the dash)
 * and the submitted form value disagree: the dash says "partial", but
 * the form posts the box as ticked. Screen-reader announcements depend
 * on browser + AT pairing and are not consistent across combinations.
 *
 * The WAI-ARIA model is the cleaner mental picture: a checkbox has a
 * single tri-state value (`true | false | mixed`). The states are
 * mutually exclusive by design. Production component libraries follow
 * that model - `checked` and `indeterminate` are not two independent
 * flags but two faces of the same setting.
 *
 * Severity is `moderate` - the page still works, but two sources of
 * truth disagreeing is exactly the SC 4.1.2 (Name, Role, Value) class
 * of problem: the state communicated to AT does not match the value
 * that will be submitted. axe-core does not flag this combination, so
 * the custom rule is what catches it.
 *
 * Not flagged for the `div-checkbox` variant - that markup does not
 * use the native `indeterminate` IDL property at all, so the
 * combination cannot occur there.
 */
export const checkboxCheckedAndIndeterminate: Rule = {
  id: "checkbox-checked-and-indeterminate",
  title: "Checkbox has both `checked` and `indeterminate` set",
  wcag: "SC 4.1.2 Name, Role, Value - Level A",
  tags: ["wcag2a", "wcag412", "best-practice"],
  description:
    "A checkbox is conceptually a tri-state value: unchecked, checked, or mixed. Setting `checked` and `indeterminate` together makes the visual state (a dash) disagree with the submitted form value (still ticked) - and the announcement screen readers make depends on the browser and assistive technology pairing. Pick one state and let the markup say what the form actually means.",
  help: "Treat the three states as mutually exclusive. If the box represents a partial selection, set `indeterminate` and leave `checked` false. If the box is a real selected value, set `checked` and leave `indeterminate` false. Reset `indeterminate` to false whenever the user explicitly ticks or unticks the box.",
  helpUrl: "https://www.w3.org/TR/wai-aria-1.2/#aria-checked",
  learnTopicId: "checkbox-indeterminate",
  evaluate(props) {
    if (props.renderAs !== "input-checkbox") return null;
    if (props.checked !== true) return null;
    if (props.indeterminate !== true) return null;
    return {
      severity: "moderate",
      message:
        "`checked` and `indeterminate` are both true - the visible dash and the submitted value disagree.",
    };
  },
};
