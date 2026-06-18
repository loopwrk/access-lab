/**
 * Fills the gap between `input-missing-autocomplete` (no token) and axe's
 * `autocomplete-valid` (invalid token / wrong control group): a token that is
 * perfectly valid but names the WRONG purpose for the field. axe accepts `tel`
 * on a `type="email"` field because both are text-entry controls, so nothing
 * automated fires - yet autofill would drop a phone number into an email field.
 *
 * The contracts worth pinning: (1) it judges only the three types that pin a
 * single purpose (email/tel/url) and flags a known token of a different purpose
 * as `serious`; (2) it respects the per-type allowlist (e.g. `username` on a
 * login email field, the `tel-*` parts on a phone field); (3) it defers cleanly
 * - missing token to the missing-autocomplete rule, unknown/typo token to axe,
 * permissive `type="text"` to nobody. Pure function -> node unit env.
 */

import { describe, expect, it } from "vitest";
import { autocompleteMismatch } from "../../app/rules/input/autocomplete-mismatch";

const evaluate = (props: Record<string, unknown>) => autocompleteMismatch.evaluate(props);

describe("autocompleteMismatch - fires on a valid token of the wrong purpose", () => {
  it("flags tel on an email field (serious) and recommends the matching token", () => {
    const result = evaluate({ renderAs: "email", autocomplete: "tel" });
    expect(result?.severity).toBe("serious");
    expect(result?.message).toContain('autocomplete="tel"');
    expect(result?.message).toContain('autocomplete="email"'); // the recommendation
  });

  it("flags email on a tel field, recommending tel", () => {
    expect(evaluate({ renderAs: "tel", autocomplete: "email" })?.message).toContain(
      'autocomplete="tel"',
    );
  });

  it("flags tel on a url field, recommending url", () => {
    expect(evaluate({ renderAs: "url", autocomplete: "tel" })?.message).toContain(
      'autocomplete="url"',
    );
  });

  it("flags other clearly-wrong purposes (cc-number, postal-code) on an email field", () => {
    expect(evaluate({ renderAs: "email", autocomplete: "cc-number" })).not.toBeNull();
    expect(evaluate({ renderAs: "email", autocomplete: "postal-code" })).not.toBeNull();
  });

  it("reads the field-name token from a multi-token value (mobile tel -> tel)", () => {
    expect(evaluate({ renderAs: "email", autocomplete: "mobile tel" })).not.toBeNull();
  });
});

describe("autocompleteMismatch - respects each type's allowlist (no false positives)", () => {
  it("accepts the matching token", () => {
    expect(evaluate({ renderAs: "email", autocomplete: "email" })).toBeNull();
    expect(evaluate({ renderAs: "tel", autocomplete: "tel" })).toBeNull();
    expect(evaluate({ renderAs: "url", autocomplete: "url" })).toBeNull();
  });

  it("accepts username on email/tel login fields", () => {
    expect(evaluate({ renderAs: "email", autocomplete: "username" })).toBeNull();
    expect(evaluate({ renderAs: "tel", autocomplete: "username" })).toBeNull();
  });

  it("accepts the tel-* parts on a phone field", () => {
    expect(evaluate({ renderAs: "tel", autocomplete: "tel-country-code" })).toBeNull();
    expect(evaluate({ renderAs: "tel", autocomplete: "tel-extension" })).toBeNull();
  });

  it("accepts a grouping prefix before the right token (shipping tel)", () => {
    expect(evaluate({ renderAs: "tel", autocomplete: "shipping tel" })).toBeNull();
  });

  it("never flags the generic on/off values", () => {
    expect(evaluate({ renderAs: "email", autocomplete: "off" })).toBeNull();
    expect(evaluate({ renderAs: "email", autocomplete: "on" })).toBeNull();
  });
});

describe("autocompleteMismatch - defers cleanly to the other engines", () => {
  it("stays silent when the token is missing (input-missing-autocomplete's job)", () => {
    expect(evaluate({ renderAs: "email", autocomplete: "" })).toBeNull();
    expect(evaluate({ renderAs: "email" })).toBeNull();
  });

  it("stays silent on an unknown/typo token (axe's autocomplete-valid's job)", () => {
    expect(evaluate({ renderAs: "email", autocomplete: "emial" })).toBeNull();
    expect(evaluate({ renderAs: "email", autocomplete: "telephone" })).toBeNull();
  });

  it("does not judge permissive or non-pinned types (text, password, search, number)", () => {
    expect(evaluate({ renderAs: "text", autocomplete: "tel" })).toBeNull();
    expect(evaluate({ renderAs: "password", autocomplete: "tel" })).toBeNull();
    expect(evaluate({ renderAs: "search", autocomplete: "tel" })).toBeNull();
    expect(evaluate({ renderAs: "number", autocomplete: "tel" })).toBeNull();
  });
});

describe("autocompleteMismatch - metadata", () => {
  it("declares a real AA failure and does NOT defer to axe (axe is silent on this)", () => {
    expect(autocompleteMismatch.id).toBe("input-autocomplete-mismatch");
    expect(autocompleteMismatch.tags).toContain("wcag2aa");
    expect(autocompleteMismatch.supersededByAxe).toBeUndefined();
  });
});
