/**
 * Focused regression test, not the full button-render characterisation — that
 * is batch B1 in UNITTESTS.md.
 */

import { describe, expect, it } from "vitest";
import { renderButton } from "../../app/components/inspected/buttons/shared/render";

describe("renderButton border-color", () => {
  it("emits border-color with no border-width override (recolours the UA border)", () => {
    const { html } = renderButton({ borderColor: "#ff0000" });
    expect(html).toContain("border-color: #ff0000");
  });

  it("still emits border-color when a width override is set", () => {
    const { html } = renderButton({
      borderColor: "#ff0000",
      borderWidth: { value: 2, unit: "px" },
    });
    expect(html).toContain("border-width: 2px");
    expect(html).toContain("border-color: #ff0000");
  });

  it("omits border-color when none is set", () => {
    const { html } = renderButton({ borderWidth: { value: 2, unit: "px" } });
    expect(html).not.toContain("border-color");
  });
});
