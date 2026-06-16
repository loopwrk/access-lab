/**
 * A best-practice nudge axe never makes: a password field with no show-password
 * toggle. The contracts worth pinning: (1) it fires only for a password field
 * that has no toggle, as a gentle `minor` warning; (2) it clears the moment a
 * toggle is added (the cause-and-effect teaching loop) and never fires for other
 * input types; (3) a disabled field is skipped (nothing is being typed into it);
 * (4) it is a pure gap-filler (no supersededByAxe) and links to the Learn topic.
 * Pure function -> node unit env.
 */

import { describe, expect, it } from "vitest";
import { passwordNoToggle } from "../../app/rules/input/password-no-toggle";

const evaluate = (props: Record<string, unknown>) => passwordNoToggle.evaluate(props);

describe("passwordNoToggle - nudges a password field with no toggle", () => {
  it("fires as a minor warning and suggests adding a toggle", () => {
    const result = evaluate({ renderAs: "password" });
    expect(result?.severity).toBe("minor");
    expect(result?.measurement).toMatch(/show-password toggle/i);
  });

  it("clears once a toggle is added", () => {
    expect(evaluate({ renderAs: "password", showPasswordToggle: true })).toBeNull();
  });

  it("does not fire for other input types", () => {
    expect(evaluate({ renderAs: "text" })).toBeNull();
    expect(evaluate({ renderAs: "email" })).toBeNull();
  });

  it("skips a disabled password field (it is not being typed into)", () => {
    expect(evaluate({ renderAs: "password", disabled: true })).toBeNull();
  });
});

describe("passwordNoToggle - metadata", () => {
  it("is a best-practice gap-filler that links to the password Learn topic", () => {
    expect(passwordNoToggle.id).toBe("input-password-no-toggle");
    expect(passwordNoToggle.tags).toContain("best-practice");
    expect(passwordNoToggle.learnTopicId).toBe("password-input");
    // axe never suggests a show-password toggle, so this is the only signal.
    expect(passwordNoToggle.supersededByAxe).toBeUndefined();
  });
});
