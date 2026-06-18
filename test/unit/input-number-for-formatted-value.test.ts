/**
 * type="number" is for quantities you do maths on. This rule fills a gap axe
 * cannot see: axe has no way to know a type="number" field is *meant* for a
 * card number / phone / postcode — that intent lives in the label, not the
 * markup — so the field passes every automated check while stripping leading
 * zeros and corrupting values via the spinner/scroll controls.
 *
 * The two contracts worth pinning: (1) it only fires when the type is number
 * AND the label/name reads like one of the three digit-string categories, so a
 * genuine quantity ("age", "number of guests") and a correctly-typed text field
 * both stay silent; (2) detection is whole-word, so "automobile" never trips
 * "mobile". Pure function → node unit env.
 */

import { describe, expect, it } from "vitest";
import { numberInputForFormattedValue } from "../../app/rules/input/number-for-formatted-value";

const evaluate = (props: Record<string, unknown>) => numberInputForFormattedValue.evaluate(props);

describe("numberInputForFormattedValue — fires on intent, only for type=number", () => {
  it("fires (moderate) for a card number and recommends cc-number", () => {
    const result = evaluate({ renderAs: "number", label: "Credit card number" });
    expect(result?.severity).toBe("moderate");
    expect(result?.message).toContain("a card number");
    expect(result?.message).toContain('autocomplete="cc-number"');
  });

  it("fires for a phone number (incl. the bare 'tel' term) and recommends type=tel", () => {
    const result = evaluate({ renderAs: "number", label: "Phone" });
    expect(result?.message).toContain("a phone number");
    expect(result?.message).toContain('type="tel"');
    expect(evaluate({ renderAs: "number", label: "Tel" })).not.toBeNull();
    expect(evaluate({ renderAs: "number", label: "", name: "tel" })).not.toBeNull();
  });

  it("fires for a postal code and recommends postal-code", () => {
    const result = evaluate({ renderAs: "number", label: "Postcode" });
    expect(result?.message).toContain("a postal code");
    expect(result?.message).toContain('autocomplete="postal-code"');
    expect(evaluate({ renderAs: "number", label: "ZIP code" })).not.toBeNull();
  });

  it("reads the field name too, normalising camelCase / snake / kebab", () => {
    expect(evaluate({ renderAs: "number", label: "", name: "cardNumber" })).not.toBeNull();
    expect(evaluate({ renderAs: "number", label: "", name: "zip_code" })).not.toBeNull();
    expect(evaluate({ renderAs: "number", label: "", name: "telephone-number" })).not.toBeNull();
  });
});

describe("numberInputForFormattedValue — stays silent where type=number is fine", () => {
  it("does not fire for genuine quantities", () => {
    expect(evaluate({ renderAs: "number", label: "Age" })).toBeNull();
    expect(evaluate({ renderAs: "number", label: "Number of guests" })).toBeNull();
    expect(evaluate({ renderAs: "number", label: "Quantity in stock" })).toBeNull();
  });

  it("does not fire when the type is not number (a text field for a card number is correct)", () => {
    expect(evaluate({ renderAs: "text", label: "Credit card number" })).toBeNull();
    expect(evaluate({ renderAs: "tel", label: "Phone" })).toBeNull();
  });

  it("matches whole words only — 'automobile' ≠ 'mobile', 'hotel' ≠ 'tel'", () => {
    expect(evaluate({ renderAs: "number", label: "Automobile mileage" })).toBeNull();
    expect(evaluate({ renderAs: "number", label: "Hotel" })).toBeNull();
  });

  it("does not fire with no label or name", () => {
    expect(evaluate({ renderAs: "number" })).toBeNull();
    expect(evaluate({ renderAs: "number", label: "", name: "" })).toBeNull();
  });
});

describe("numberInputForFormattedValue — metadata", () => {
  it("declares best-practice metadata and a moderate severity", () => {
    expect(numberInputForFormattedValue.id).toBe("input-number-for-formatted-value");
    expect(numberInputForFormattedValue.tags).toContain("best-practice");
  });

  // It fills a gap axe is silent on (intent isn't in the markup), so it must
  // NOT defer to axe — there is no axe rule that catches this.
  it("does NOT declare supersededByAxe — it is the only signal for this misuse", () => {
    expect(numberInputForFormattedValue.supersededByAxe).toBeUndefined();
  });
});
