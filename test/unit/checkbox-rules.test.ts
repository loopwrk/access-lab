/**
 * The three checkbox rules that catch what axe-core cannot:
 *   - group-no-fieldset: related checkboxes with no <fieldset> read as valid
 *     individual controls to axe, so it stays silent — the group relationship
 *     is simply lost.
 *   - checked-and-indeterminate: both flags true on a native checkbox makes the
 *     visible dash and the submitted value disagree; axe doesn't model the
 *     tri-state, so it can't see the conflict. Native-only — the div expresses
 *     the partial state as aria-checked="mixed", where the conflict can't occur.
 *   - parent-child-mismatch: the "select all" parent must be a derived summary
 *     of its children; this pins the full derived-state matrix.
 *
 * None defer to axe (no supersededByAxe). Pure functions → node unit env.
 */

import { describe, expect, it } from "vitest";
import { checkboxGroupNoFieldset } from "../../app/rules/checkbox/group-no-fieldset";
import { checkboxCheckedAndIndeterminate } from "../../app/rules/checkbox/checked-and-indeterminate";
import { checkboxParentChildMismatch } from "../../app/rules/checkbox/parent-child-mismatch";

describe("checkboxGroupNoFieldset", () => {
  it("fires (serious) only for the group-no-fieldset mode", () => {
    expect(checkboxGroupNoFieldset.evaluate({ groupMode: "group-no-fieldset" })?.severity).toBe(
      "serious",
    );
  });

  it("stays silent for every other group mode", () => {
    for (const mode of ["single", "group-with-fieldset", "parent-with-children"]) {
      expect(checkboxGroupNoFieldset.evaluate({ groupMode: mode })).toBeNull();
    }
    expect(checkboxGroupNoFieldset.evaluate({})).toBeNull();
  });

  it("does NOT defer to axe (bare checkboxes have valid names; the group is the gap)", () => {
    expect(checkboxGroupNoFieldset.supersededByAxe).toBeUndefined();
  });

  it("declares Level A metadata (1.3.1 Info and Relationships)", () => {
    expect(checkboxGroupNoFieldset.id).toBe("checkbox-group-no-fieldset");
    expect(checkboxGroupNoFieldset.wcag).toContain("1.3.1");
    expect(checkboxGroupNoFieldset.tags).toContain("wcag2a");
  });
});

describe("checkboxCheckedAndIndeterminate — native only", () => {
  it("fires (moderate) only when BOTH checked and indeterminate are true on a native checkbox", () => {
    expect(
      checkboxCheckedAndIndeterminate.evaluate({
        renderAs: "input-checkbox",
        checked: true,
        indeterminate: true,
      })?.severity,
    ).toBe("moderate");
  });

  it("stays silent unless both flags are set", () => {
    const base = { renderAs: "input-checkbox" };
    expect(checkboxCheckedAndIndeterminate.evaluate({ ...base, checked: true })).toBeNull();
    expect(checkboxCheckedAndIndeterminate.evaluate({ ...base, indeterminate: true })).toBeNull();
    expect(checkboxCheckedAndIndeterminate.evaluate(base)).toBeNull();
  });

  it("never fires for the div variant — it can't reach the conflicting state (mixed)", () => {
    expect(
      checkboxCheckedAndIndeterminate.evaluate({
        renderAs: "div-checkbox",
        checked: true,
        indeterminate: true,
      }),
    ).toBeNull();
  });

  it("declares the metadata + tri-state learn topic, and does not defer to axe", () => {
    expect(checkboxCheckedAndIndeterminate.id).toBe("checkbox-checked-and-indeterminate");
    expect(checkboxCheckedAndIndeterminate.learnTopicId).toBe("checkbox-indeterminate");
    expect(checkboxCheckedAndIndeterminate.supersededByAxe).toBeUndefined();
  });
});

describe("checkboxParentChildMismatch — the derived 'select all' state", () => {
  const evalParent = (childChecked: boolean[], parent: { checked?: boolean; indeterminate?: boolean }) =>
    checkboxParentChildMismatch.evaluate({
      groupMode: "parent-with-children",
      childChecked,
      ...parent,
    });

  it("only evaluates in parent-with-children mode, and only with children", () => {
    expect(checkboxParentChildMismatch.evaluate({ groupMode: "single", childChecked: [true] })).toBeNull();
    expect(checkboxParentChildMismatch.evaluate({ groupMode: "parent-with-children", childChecked: [] })).toBeNull();
  });

  it("stays silent when the parent matches the derived state", () => {
    expect(evalParent([false, false, false], { checked: false, indeterminate: false })).toBeNull(); // none → unchecked
    expect(evalParent([true, false, false], { checked: false, indeterminate: true })).toBeNull(); // some → indeterminate
    expect(evalParent([true, true, true], { checked: true, indeterminate: false })).toBeNull(); // all → checked
  });

  it("fires (moderate) when the parent disagrees, describing expected vs actual", () => {
    // some ticked → should be indeterminate, but markup says checked
    const result = evalParent([true, false, false], { checked: true, indeterminate: false });
    expect(result?.severity).toBe("moderate");
    expect(result?.measurement).toContain("1 of 3");
    expect(result?.measurement).toContain("indeterminate");
    // all ticked → should be checked, but markup says unchecked
    expect(evalParent([true, true, true], { checked: false, indeterminate: false })).not.toBeNull();
    // none ticked → should be unchecked, but markup says checked
    expect(evalParent([false, false, false], { checked: true, indeterminate: false })).not.toBeNull();
  });

  it("declares Level A metadata and does not defer to axe", () => {
    expect(checkboxParentChildMismatch.id).toBe("checkbox-parent-child-mismatch");
    expect(checkboxParentChildMismatch.wcag).toContain("4.1.2");
    expect(checkboxParentChildMismatch.supersededByAxe).toBeUndefined();
  });
});
