/**
 * Fills the gap axe leaves: axe's `autocomplete-valid` flags a *wrong*
 * autocomplete but never a *missing* one, so an identifiable field with no
 * autocomplete passes every automated check while failing SC 1.3.5. The two
 * contracts worth pinning: (1) it fires only when the field reads as a known
 * personal-data purpose AND autocomplete is absent; (2) it goes silent the
 * moment autocomplete is set — even to an invalid value — because validity is
 * axe's job, not this rule's. Pure function → node unit env.
 */

import { describe, expect, it } from "vitest";
import { missingAutocomplete } from "../../app/rules/input/missing-autocomplete";

const evaluate = (props: Record<string, unknown>) => missingAutocomplete.evaluate(props);

describe("missingAutocomplete — fires on an identifiable field with no autocomplete", () => {
  it("fires (moderate) and suggests the matching token", () => {
    const result = evaluate({ renderAs: "email", label: "Email" });
    expect(result?.severity).toBe("moderate");
    expect(result?.measurement).toContain('autocomplete="email"');
  });

  it("recognises phone, postcode, card, and address fields", () => {
    expect(evaluate({ renderAs: "tel", label: "Phone" })?.measurement).toContain('"tel"');
    expect(evaluate({ renderAs: "text", label: "Postcode" })?.measurement).toContain(
      '"postal-code"',
    );
    expect(evaluate({ renderAs: "text", label: "Credit card number" })?.measurement).toContain(
      '"cc-number"',
    );
    expect(evaluate({ renderAs: "text", label: "Street address" })?.measurement).toContain(
      '"street-address"',
    );
  });

  it("reads the field name too", () => {
    expect(evaluate({ renderAs: "text", label: "", name: "userEmail" })).not.toBeNull();
  });
});

describe("missingAutocomplete — stays silent appropriately", () => {
  it("does not fire once autocomplete is set — even if it is invalid (that's axe's job)", () => {
    expect(evaluate({ renderAs: "email", label: "Email", autocomplete: "email" })).toBeNull();
    expect(evaluate({ renderAs: "email", label: "Email", autocomplete: "emial" })).toBeNull();
  });

  it("does not fire for unidentifiable fields", () => {
    expect(evaluate({ renderAs: "text", label: "Favourite colour" })).toBeNull();
    expect(evaluate({ renderAs: "text", label: "Comments" })).toBeNull();
  });

  it("does not fire for number-type fields (covered by the type-misuse rule, or a quantity)", () => {
    expect(evaluate({ renderAs: "number", label: "Credit card number" })).toBeNull();
  });

  it("avoids the 'email address' → street-address trap (email wins over address)", () => {
    expect(evaluate({ renderAs: "email", label: "Email address" })?.measurement).toContain(
      '"email"',
    );
  });
});

describe("missingAutocomplete — metadata", () => {
  it("declares best-practice metadata and does NOT defer to axe", () => {
    expect(missingAutocomplete.id).toBe("input-missing-autocomplete");
    expect(missingAutocomplete.tags).toContain("best-practice");
    // axe never flags a *missing* autocomplete, so this is the only signal.
    expect(missingAutocomplete.supersededByAxe).toBeUndefined();
  });
});
