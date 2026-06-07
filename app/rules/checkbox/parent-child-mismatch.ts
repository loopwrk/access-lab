import type { Rule } from "~/rules/types";

/**
 * Fires when the `parent-with-children` group mode has a parent
 * whose `checked` / `indeterminate` state does not match what the
 * children's selection actually implies.
 *
 * The canonical "select all" pattern is a derived value: the parent's
 * state is a function of how many children are ticked.
 *
 *   - 0 children ticked  → parent unchecked
 *   - all children ticked → parent checked
 *   - some ticked         → parent indeterminate (and not checked)
 *
 * Any other combination means the markup is telling sighted users
 * one story (the parent's visual) and the form / assistive
 * technology another (the children's actual values). That mismatch
 * is the anti-pattern this rule catches.
 *
 * Only evaluates in `parent-with-children` mode — the other group
 * modes have no implicit parent-child relationship.
 *
 * Severity is `moderate` — the page still functions, but the parent
 * and children disagree, which is the SC 4.1.2 family of problem:
 * the state communicated to AT does not match the data that will be
 * submitted.
 */
export const checkboxParentChildMismatch: Rule = {
  id: "checkbox-parent-child-mismatch",
  title: "Parent checkbox state does not match its children",
  wcag: "SC 4.1.2 Name, Role, Value — Level A",
  tags: ["wcag2a", "wcag412", "best-practice"],
  description:
    "In the \"select all\" pattern the parent checkbox is a summary of its children. If none are ticked, the parent is unchecked. If all are ticked, the parent is checked. If some are ticked, the parent is indeterminate (and `checked` is false). Right now the parent's markup disagrees with the children's actual selection, so a sighted user, a screen-reader user, and the form server will each be told different things about the same state.",
  help: "Recompute the parent's state from the children whenever a child changes. The rule of thumb: `indeterminate` is only ever true when `checked` is false and at least one — but not every — child is ticked.",
  helpUrl: "https://www.w3.org/WAI/WCAG22/Understanding/name-role-value.html",
  learnTopicId: "checkbox-indeterminate",
  evaluate(props) {
    if (props.groupMode !== "parent-with-children") return null;

    const children = Array.isArray(props.childChecked)
      ? (props.childChecked as unknown[]).map((v) => v === true)
      : [];
    if (children.length === 0) return null;

    const total = children.length;
    const ticked = children.filter(Boolean).length;
    const parentChecked = props.checked === true;
    const parentIndeterminate = props.indeterminate === true;

    let expectedChecked = false;
    let expectedIndeterminate = false;
    if (ticked === total) {
      expectedChecked = true;
    } else if (ticked > 0) {
      expectedIndeterminate = true;
    }

    const matches
      = parentChecked === expectedChecked
        && parentIndeterminate === expectedIndeterminate;
    if (matches) return null;

    const describe = (checked: boolean, indeterminate: boolean) =>
      indeterminate ? "indeterminate" : checked ? "checked" : "unchecked";

    return {
      severity: "moderate",
      measurement:
        `${ticked} of ${total} children ticked — the parent should be `
        + `${describe(expectedChecked, expectedIndeterminate)}, but its `
        + `markup says ${describe(parentChecked, parentIndeterminate)}.`,
    };
  },
};
