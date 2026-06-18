import type { Rule } from "~/rules/types";

/**
 * Flags inputs that rely on `aria-label` for their accessible name
 * without rendering a visible label.
 *
 * Automated tools like axe-core don't flag this pattern: `aria-label`
 * does provide an accessible name for assistive technology, and that's
 * what their `label` rule checks for. But it's only half the story -
 * sighted users see an unlabelled field and have no way to know what
 * the input is for, whether it's required, or what submitting will do.
 *
 * Two severities depending on context:
 *
 *   - **Serious** - the default. Fires whenever the input uses
 *     `aria-label` as its only accessible name with no visible
 *     indicator of the field's purpose. Visible labels help everyone,
 *     especially users with cognitive impairments, users who zoom
 *     heavily, users returning to partially completed forms, and
 *     users with memory or attention difficulties. The lack of any
 *     visible cue is the more serious failure mode.
 *
 *   - **Moderate (warning)** - the search-icon special case. When
 *     the input is `type="search"` AND a visible magnifying-glass
 *     icon is rendered next to it, the icon itself communicates
 *     "this is a search field" to sighted users. Deque's guidance
 *     notes this is acceptable, but a visible label is still the
 *     more robust choice.
 *
 * Both severities carry the `best-practice` tag - neither is a strict
 * WCAG failure, but both are real usability problems that automated
 * audits miss.
 */
export const ariaLabelWithoutVisibleLabel: Rule = {
  id: "input-aria-label-without-visible-label",
  title: "Input has aria-label but no visible label",
  wcag: "Best practice - Labels and Instructions",
  tags: ["best-practice"],
  description:
    "Automated tools like axe-core do not flag this pattern. They check that an accessible name exists, and `aria-label` provides one - screen reader users will hear the label when they reach the input. But sighted users see only an unlabelled field. They have no way to know what information is expected, whether it's required, what type of data the field accepts (email, phone number, free text), or what will happen when the form is submitted. Visible labels help everyone: users with cognitive impairments, users with memory or attention difficulties, users who zoom the page heavily, and users returning to a partially completed form. Most form inputs should have a real `<label>` associated either via `for`/`id` or by wrapping the input.",
  help: "Add a visible <label> for the input. Reserve aria-label-only for cases where the visual context already makes the field's purpose obvious - such as a search input next to a magnifying glass icon.",
  helpUrl: "https://dequeuniversity.com/rules/axe/4.11/label?application=axeAPI",
  learnTopicId: "accessible-name",
  evaluate(props) {
    if (props.labelAssociation !== "aria-label") return null;

    // Search-icon exception: when the input is `type="search"` and a
    // visible magnifying-glass icon is rendered next to it, sighted
    // users have a visual cue for the field's purpose. Deque's
    // guidance acknowledges this as acceptable - but it's still a
    // best-practice nudge rather than the all-clear.
    const isSearchWithIcon = props.renderAs === "search" && props.showSearchIcon === true;

    if (isSearchWithIcon) {
      return {
        severity: "moderate",
        message:
          "The input uses aria-label paired with a visible magnifying-glass icon. The icon signals \"search\" to sighted users, which Deque's guidance accepts as a substitute for a visible label. It is still not best practice: users with cognitive impairments may not recognise the icon's meaning, users returning to a partial form may forget what was expected, and users with heavy zoom may cut the icon out of view. A real visible label remains the more robust choice.",
      };
    }

    return {
      severity: "serious",
      message:
        "The input uses aria-label as its only accessible name with no visible cue. Screen reader users hear the label, but sighted users see only an unlabelled field. They cannot tell what information is expected, whether the field is required, or what submitting will do.",
    };
  },
};
