/**
 * Pure-function unit tests for the `checkbox-aria-checked-redundant`
 * custom rule.
 *
 * The rule is the "what" that the variant-sync watcher in
 * `CheckboxControls.vue` was tuned to keep aligned with the "how". The
 * watcher decides when `ariaChecked` is true; this rule decides whether
 * that state is a violation. Together they're a pair — the studio
 * shouldn't be silently firing a redundant-aria-checked warning on the
 * native variant because of state leaked from a previous div visit.
 *
 * No Nuxt context required: the rule is a pure function of its props
 * argument, so it lives in `test/unit/` with a relative import.
 */

import { describe, expect, it } from "vitest";
import { checkboxAriaCheckedRedundant } from "../../app/rules/checkbox/aria-checked-redundant";

describe("checkboxAriaCheckedRedundant rule", () => {
  it("fires for the native variant when aria-checked is enabled", () => {
    // The canonical violation: a native <input type="checkbox"> with
    // aria-checked explicitly on. The browser already exposes checked
    // state via the built-in role; aria-checked is redundant and can
    // drift out of sync. First Rule of ARIA.
    const result = checkboxAriaCheckedRedundant.evaluate({
      renderAs: "input-checkbox",
      ariaChecked: true,
    });
    expect(result).not.toBeNull();
    expect(result?.severity).toBe("minor");
    expect(result?.message).toMatch(/aria-checked/);
  });

  it("does not fire for the native variant when aria-checked is false", () => {
    // No aria-checked → no redundancy → no violation. This is the
    // expected steady state for a native checkbox.
    const result = checkboxAriaCheckedRedundant.evaluate({
      renderAs: "input-checkbox",
      ariaChecked: false,
    });
    expect(result).toBeNull();
  });

  it("does not fire for the div variant even when aria-checked is true", () => {
    // role="checkbox" on a <div> REQUIRES aria-checked — it's the only
    // mechanism that exposes state to AT, so it isn't redundant here.
    // The rule's early-return on renderAs is what makes this distinction
    // and what the reverse watcher in CheckboxControls protects.
    const result = checkboxAriaCheckedRedundant.evaluate({
      renderAs: "div-checkbox",
      ariaChecked: true,
    });
    expect(result).toBeNull();
  });

  it("does not fire when aria-checked is missing from the props bag entirely", () => {
    // A prop-bag without the `ariaChecked` key shouldn't trip the
    // `!== true` check the rule uses. Defensive against partial models.
    const result = checkboxAriaCheckedRedundant.evaluate({
      renderAs: "input-checkbox",
    });
    expect(result).toBeNull();
  });

  it("does not fire when renderAs is unset", () => {
    // No variant → no decision to make. The studio's default seeds
    // renderAs immediately, so this is a paranoid guard rather than a
    // real-world path; still worth pinning because the rule has to
    // tolerate any `Record<string, unknown>` shape it's handed.
    const result = checkboxAriaCheckedRedundant.evaluate({
      ariaChecked: true,
    });
    expect(result).toBeNull();
  });

  it("does not fire when ariaChecked is a non-true truthy value", () => {
    // The rule's evaluator uses a strict `!== true` check, so any
    // value other than the boolean `true` should be treated as "off".
    // Guards against the rule misfiring if a future code path
    // accidentally coerces the prop to a string or a number.
    const result = checkboxAriaCheckedRedundant.evaluate({
      renderAs: "input-checkbox",
      ariaChecked: "true" as unknown as boolean,
    });
    expect(result).toBeNull();
  });

  it("declares the right rule metadata", () => {
    // The Issues panel reads these fields directly; if any of them
    // drift (e.g. a copy edit changes the id), other places that
    // reference the rule by id stop working silently.
    expect(checkboxAriaCheckedRedundant.id).toBe("checkbox-aria-checked-redundant");
    expect(checkboxAriaCheckedRedundant.tags).toContain("best-practice");
    expect(checkboxAriaCheckedRedundant.learnTopicId).toBe("checkbox");
  });
});
