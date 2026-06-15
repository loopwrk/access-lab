/**
 * The three select rules are worth testing for their DIVISION OF LABOUR with
 * axe-core — the whole reason custom rules exist. Each sits in a different
 * relationship to axe:
 *
 *   - select-no-label DUPLICATES axe. A select with no accessible name is
 *     already reported by axe — `select-name` for the native `<select>`,
 *     `aria-input-field-name` for the `<div role="combobox">`. So this is the
 *     one select rule that defers: it declares supersededByAxe and only shows
 *     as a fallback when axe is unavailable (suppression itself is exercised in
 *     audit-pipeline.test.ts). The sibling inputs rely on axe alone.
 *   - select-options-empty FILLS A GAP. An empty `<select>` is valid HTML, so
 *     axe has nothing to flag — it must NOT defer, or the "dropdown with nothing
 *     to pick" warning would vanish.
 *   - select-not-keyboard FILLS A GAP axe structurally cannot see: missing
 *     arrow-key / type-ahead / Escape handling on the div-combobox. axe runs no
 *     keyboard interaction, so it must NOT defer either.
 *
 * Pinning which one defers — and that the other two deliberately do not — is the
 * point of this file. Pure functions → node unit env.
 */

import { describe, expect, it } from "vitest";
import { selectNoLabel } from "../../app/rules/select/select-no-label";
import { selectOptionsEmpty } from "../../app/rules/select/select-options-empty";
import { selectNotKeyboard } from "../../app/rules/select/select-not-keyboard";

describe("selectNoLabel — the missing accessible name axe also reports", () => {
  it("fires (serious) when label association is None", () => {
    expect(selectNoLabel.evaluate({ labelAssociation: "none" })?.severity).toBe("serious");
  });

  it("fires (serious) for aria-label mode with empty or whitespace-only label text", () => {
    expect(selectNoLabel.evaluate({ labelAssociation: "aria-label", label: "" })?.severity).toBe(
      "serious",
    );
    expect(selectNoLabel.evaluate({ labelAssociation: "aria-label", label: "   " })?.severity).toBe(
      "serious",
    );
    expect(selectNoLabel.evaluate({ labelAssociation: "aria-label" })?.severity).toBe("serious");
  });

  it("stays silent when a name is provided (aria-label with text, for-id, wrapping, unset)", () => {
    expect(selectNoLabel.evaluate({ labelAssociation: "aria-label", label: "Ocean" })).toBeNull();
    expect(selectNoLabel.evaluate({ labelAssociation: "for-id", label: "Ocean" })).toBeNull();
    expect(selectNoLabel.evaluate({ labelAssociation: "wrapping", label: "Ocean" })).toBeNull();
    expect(selectNoLabel.evaluate({})).toBeNull();
  });

  // The deferral contract: both render paths the rule fires on have a real
  // missing-name failure axe already reports, so it declares the two axe ids
  // that supersede it. It still fires (covering the case where axe is
  // unavailable) but the merge layer drops the duplicate when axe has run.
  it("declares supersededByAxe for both render paths (defers rather than double-reporting)", () => {
    expect(selectNoLabel.supersededByAxe).toEqual(["select-name", "aria-input-field-name"]);
  });

  it("declares Level A metadata (4.1.2 Name, Role, Value)", () => {
    expect(selectNoLabel.wcag).toContain("4.1.2");
    expect(selectNoLabel.tags).toContain("wcag2a");
  });
});

describe("selectOptionsEmpty — the empty-but-valid dropdown axe can't flag", () => {
  it("fires (moderate) when there are no options (empty, missing, or non-array)", () => {
    expect(selectOptionsEmpty.evaluate({ options: [] })?.severity).toBe("moderate");
    expect(selectOptionsEmpty.evaluate({})?.severity).toBe("moderate");
    expect(selectOptionsEmpty.evaluate({ options: "nope" })?.severity).toBe("moderate");
  });

  it("stays silent as soon as one option exists", () => {
    expect(selectOptionsEmpty.evaluate({ options: ["Pacific"] })).toBeNull();
  });

  // An empty <select> is valid markup, so axe has no rule to report it — this is
  // a pure gap-filler and must not defer, or the warning would disappear.
  it("does NOT declare supersededByAxe — it is the only signal for an empty select", () => {
    expect(selectOptionsEmpty.supersededByAxe).toBeUndefined();
  });

  it("is a best-practice warning, not a WCAG-A failure", () => {
    expect(selectOptionsEmpty.tags).toEqual(["best-practice"]);
  });
});

describe("selectNotKeyboard — the missing keyboard contract axe can't execute", () => {
  it("fires (serious) only for the div-combobox render", () => {
    expect(selectNotKeyboard.evaluate({ renderAs: "div-combobox" })?.severity).toBe("serious");
  });

  it("stays silent for the native renders and when unset", () => {
    expect(selectNotKeyboard.evaluate({ renderAs: "select-native" })).toBeNull();
    expect(selectNotKeyboard.evaluate({ renderAs: "select-multiple" })).toBeNull();
    expect(selectNotKeyboard.evaluate({})).toBeNull();
  });

  // axe runs no keyboard interaction, so a div-combobox with no arrow-key /
  // type-ahead / Escape handling looks fine to it — another pure gap-filler that
  // must not defer.
  it("does NOT declare supersededByAxe — axe cannot test keyboard operation", () => {
    expect(selectNotKeyboard.supersededByAxe).toBeUndefined();
  });

  it("declares Level A metadata (2.1.1 Keyboard)", () => {
    expect(selectNotKeyboard.wcag).toContain("2.1.1");
    expect(selectNotKeyboard.tags).toContain("wcag2a");
  });
});
