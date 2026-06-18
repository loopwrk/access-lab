import type { Rule } from "~/rules/types";

/**
 * Best-practice nudge (no specific WCAG criterion): a password field masks what
 * the user types, so their own typos are invisible. A show-password toggle lets
 * people reveal and check the value, which cuts failed sign-ins for everyone and
 * is especially helpful for people who find typing on a masked field difficult.
 *
 * No automated tool suggests this, so it is a pure gap-filler - but it is an
 * enhancement, not a failure, so it fires as a gentle, dismissible `minor`
 * warning with "consider" wording. It clears the moment a toggle is added via
 * the studio's "show-password toggle" control, giving a clear cause-and-effect
 * teaching loop. Disabled fields are skipped (nothing is being typed into them).
 */
export const passwordNoToggle: Rule = {
  id: "input-password-no-toggle",
  title: "Password field has no show-password toggle",
  wcag: "Best practice (no specific WCAG criterion)",
  tags: ["best-practice"],
  description:
    "A password field hides what is typed, so people cannot see their own typos. A show-password toggle lets them reveal the value to check it, which reduces failed sign-ins and is especially helpful for people who find typing on a masked field difficult. No automated tool requires this - it is a best-practice enhancement worth considering.",
  help: "Consider adding an accessible show-password toggle so people can check what they typed.",
  learnTopicId: "password-input",
  evaluate(props) {
    if (props.renderAs !== "password") return null;
    if (props.disabled === true) return null; // a disabled field is not being typed into
    if (props.showPasswordToggle === true) return null; // toggle present - nothing to nudge

    return {
      severity: "minor",
      message:
        "This password field has no show-password toggle. Consider adding one so people can "
        + "reveal and check what they typed - masking hides typos from the person entering them.",
    };
  },
};
