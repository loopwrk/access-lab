/**
 * Both menu rules fill gaps axe-core cannot see: a button without aria-haspopup
 * or without aria-expanded is valid markup, so axe stays silent. NEITHER
 * declares supersededByAxe (the same gap-filler contract as the switch rules).
 *
 * Unlike the disclosure pair (mutually exclusive), these OVERLAP on the "none"
 * behaviour — a menu trigger with no ARIA has BOTH problems, so both fire. That
 * is deliberate: the studio teaches the two missing attributes as distinct,
 * because aria-haspopup ("a menu will appear") and aria-expanded ("it is open
 * now") describe different things.
 *
 * Pure functions → node unit env.
 */

import { describe, expect, it } from "vitest";
import { menuNoHasPopup } from "../../app/rules/buttons/menu-triggers/menu-no-haspopup";
import { menuNoExpanded } from "../../app/rules/buttons/menu-triggers/menu-no-expanded";

describe("menuNoHasPopup — the popup the trigger never advertises", () => {
  it("fires (serious) for none and expanded-only (neither carries aria-haspopup)", () => {
    expect(menuNoHasPopup.evaluate({ menuBehaviour: "none" })?.severity).toBe("serious");
    expect(menuNoHasPopup.evaluate({ menuBehaviour: "expanded-only" })?.severity).toBe("serious");
  });

  it("stays silent when aria-haspopup is present, and when unset", () => {
    expect(menuNoHasPopup.evaluate({ menuBehaviour: "aria-expanded-haspopup" })).toBeNull();
    expect(menuNoHasPopup.evaluate({ menuBehaviour: "haspopup-only" })).toBeNull();
    expect(menuNoHasPopup.evaluate({})).toBeNull();
  });

  it("does NOT declare supersededByAxe — a button without aria-haspopup is valid, so axe is silent", () => {
    expect(menuNoHasPopup.supersededByAxe).toBeUndefined();
  });

  it("declares Level A metadata (4.1.2 Name, Role, Value)", () => {
    expect(menuNoHasPopup.id).toBe("menu-no-haspopup");
    expect(menuNoHasPopup.wcag).toContain("4.1.2");
    expect(menuNoHasPopup.tags).toContain("wcag2a");
  });
});

describe("menuNoExpanded — the open/closed state the trigger never exposes", () => {
  it("fires (serious) for none and haspopup-only (neither carries aria-expanded)", () => {
    expect(menuNoExpanded.evaluate({ menuBehaviour: "none" })?.severity).toBe("serious");
    expect(menuNoExpanded.evaluate({ menuBehaviour: "haspopup-only" })?.severity).toBe("serious");
  });

  it("stays silent when aria-expanded is present, and when unset", () => {
    expect(menuNoExpanded.evaluate({ menuBehaviour: "aria-expanded-haspopup" })).toBeNull();
    expect(menuNoExpanded.evaluate({ menuBehaviour: "expanded-only" })).toBeNull();
    expect(menuNoExpanded.evaluate({})).toBeNull();
  });

  it("does NOT declare supersededByAxe — a button without aria-expanded is valid, so axe is silent", () => {
    expect(menuNoExpanded.supersededByAxe).toBeUndefined();
  });

  it("declares Level A metadata (4.1.2 Name, Role, Value)", () => {
    expect(menuNoExpanded.id).toBe("menu-no-expanded");
    expect(menuNoExpanded.wcag).toContain("4.1.2");
    expect(menuNoExpanded.tags).toContain("wcag2a");
  });
});

describe("menu rules — coverage across the four behaviours", () => {
  const fires = (behaviour: string) => ({
    haspopup: menuNoHasPopup.evaluate({ menuBehaviour: behaviour }) !== null,
    expanded: menuNoExpanded.evaluate({ menuBehaviour: behaviour }) !== null,
  });

  it("none has BOTH problems — the only behaviour where the two rules overlap", () => {
    expect(fires("none")).toEqual({ haspopup: true, expanded: true });
  });

  it("the correct behaviour fires neither", () => {
    expect(fires("aria-expanded-haspopup")).toEqual({ haspopup: false, expanded: false });
  });

  it("each partial behaviour fires exactly the matching rule", () => {
    expect(fires("haspopup-only")).toEqual({ haspopup: false, expanded: true });
    expect(fires("expanded-only")).toEqual({ haspopup: true, expanded: false });
  });
});
