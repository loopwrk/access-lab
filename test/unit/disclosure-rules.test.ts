/**
 * Both disclosure rules catch problems axe-core genuinely cannot:
 *   - disclosure-no-state: a plain button that reveals a panel but exposes no
 *     aria-expanded. The markup is valid HTML (a button, optionally with
 *     aria-controls), so axe stays silent — only this rule sees the missing
 *     state.
 *   - disclosure-state-out-of-sync: aria-expanded="false" hardcoded while the
 *     panel is open. aria-expanded="false" is VALID ARIA on a button, so axe
 *     accepts it and cannot know it contradicts the visible state.
 *
 * So NEITHER declares supersededByAxe — both are pure gap-fillers (the same
 * contrast switch-rules.test.ts pins). And exactly one fires per anti-pattern
 * behaviour, none for the correct pattern — so the panel teaches "no state"
 * vs "stale state" as distinct lessons rather than stacking two on one cause.
 *
 * Pure functions → node unit env.
 */

import { describe, expect, it } from "vitest";
import { disclosureNoState } from "../../app/rules/buttons/disclosure-triggers/disclosure-no-state";
import { disclosureStateOutOfSync } from "../../app/rules/buttons/disclosure-triggers/disclosure-state-out-of-sync";

describe("disclosureNoState — the panel that toggles but exposes no state", () => {
  it("fires (serious) only for the none behaviour", () => {
    expect(disclosureNoState.evaluate({ disclosureBehaviour: "none" })?.severity).toBe("serious");
  });

  it("stays silent for the correct and out-of-sync behaviours, and when unset", () => {
    expect(disclosureNoState.evaluate({ disclosureBehaviour: "aria-expanded" })).toBeNull();
    expect(disclosureNoState.evaluate({ disclosureBehaviour: "out-of-sync" })).toBeNull();
    expect(disclosureNoState.evaluate({})).toBeNull();
  });

  it("does NOT declare supersededByAxe — a button without aria-expanded is valid, so axe is silent", () => {
    expect(disclosureNoState.supersededByAxe).toBeUndefined();
  });

  it("declares Level A metadata (4.1.2 Name, Role, Value)", () => {
    expect(disclosureNoState.id).toBe("disclosure-no-state");
    expect(disclosureNoState.wcag).toContain("4.1.2");
    expect(disclosureNoState.tags).toContain("wcag2a");
  });
});

describe("disclosureStateOutOfSync — aria-expanded stuck at false", () => {
  it("fires (serious) only for the out-of-sync behaviour", () => {
    expect(disclosureStateOutOfSync.evaluate({ disclosureBehaviour: "out-of-sync" })?.severity).toBe(
      "serious",
    );
  });

  it("stays silent for the correct and none behaviours, and when unset", () => {
    expect(disclosureStateOutOfSync.evaluate({ disclosureBehaviour: "aria-expanded" })).toBeNull();
    expect(disclosureStateOutOfSync.evaluate({ disclosureBehaviour: "none" })).toBeNull();
    expect(disclosureStateOutOfSync.evaluate({})).toBeNull();
  });

  it("does NOT declare supersededByAxe — aria-expanded=false is valid ARIA, so axe stays silent", () => {
    expect(disclosureStateOutOfSync.supersededByAxe).toBeUndefined();
  });

  it("declares Level A metadata (4.1.2 Name, Role, Value)", () => {
    expect(disclosureStateOutOfSync.id).toBe("disclosure-state-out-of-sync");
    expect(disclosureStateOutOfSync.wcag).toContain("4.1.2");
    expect(disclosureStateOutOfSync.tags).toContain("wcag2a");
  });
});

describe("the two disclosure rules are mutually exclusive", () => {
  it("never both fire for the same behaviour", () => {
    for (const behaviour of ["none", "aria-expanded", "out-of-sync"]) {
      const firing = [disclosureNoState, disclosureStateOutOfSync].filter(
        (rule) => rule.evaluate({ disclosureBehaviour: behaviour }) !== null,
      );
      expect(firing.length).toBeLessThanOrEqual(1);
    }
  });

  it("neither fires for the correct aria-expanded behaviour", () => {
    expect(disclosureNoState.evaluate({ disclosureBehaviour: "aria-expanded" })).toBeNull();
    expect(disclosureStateOutOfSync.evaluate({ disclosureBehaviour: "aria-expanded" })).toBeNull();
  });
});
