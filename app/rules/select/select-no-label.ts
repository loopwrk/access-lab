import type { Rule } from "~/rules/types";

export const selectNoLabel: Rule = {
  id: "select-no-label",
  title: "Select has no accessible name",
  wcag: "SC 4.1.2 Name, Role, Value — Level A",
  tags: ["wcag2a", "wcag412"],
  description:
    "The select has neither a visible `<label>` nor an `aria-label`. Screen reader users hear the role and current value but no indication of what the select is for. Sighted users can usually infer the purpose from context, but assistive technology cannot.",
  help:
    "Add a `<label>` associated to the select via `for`/`id`, wrap the select in a `<label>`, or set `aria-label` for cases where a visible label genuinely cannot be shown.",
  helpUrl: "https://www.w3.org/WAI/WCAG22/Understanding/name-role-value.html",
  learnTopicId: "select",
  // axe already reports a missing accessible name for both render paths this
  // rule covers — `select-name` for the native `<select>`, `aria-input-field-name`
  // for the `<div role="combobox">`. Defer to axe so the problem surfaces once,
  // not twice (see useAllViolations); this select-specific card only shows as a
  // fallback if axe hasn't run or errored. The sibling inputs rely on axe alone.
  supersededByAxe: ["select-name", "aria-input-field-name"],
  evaluate(props) {
    const labelText = typeof props.label === "string" ? props.label.trim() : "";
    if (props.labelAssociation === "none") {
      return {
        severity: "serious",
        measurement:
          "Label association is set to None — the select carries no accessible name for assistive technology.",
      };
    }
    if (props.labelAssociation === "aria-label" && labelText.length === 0) {
      return {
        severity: "serious",
        measurement:
          "Label association is aria-label but the label text is empty — assistive technology hears no accessible name.",
      };
    }
    return null;
  },
};
