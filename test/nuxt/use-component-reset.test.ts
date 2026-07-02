import { describe, expect, it } from "vitest";
import { ref } from "vue";
import { useComponentReset } from "~/composables/useComponentReset";

const defaults = {
  renderAs: "button-button",
  wrappers: [] as string[],
  label: "Toggle",
  disabled: false,
  switchChecked: false,
  groupItems: ["A", "B"],
};

function makeModel(overrides: Record<string, unknown> = {}) {
  return ref<Record<string, unknown>>({ ...defaults, ...overrides });
}

describe("useComponentReset", () => {
  it("is clean when the model still matches its defaults", () => {
    const { dirty } = useComponentReset(makeModel(), defaults);
    expect(dirty.value).toBe(false);
  });

  it("is dirty when a content / ARIA / behaviour prop changes", () => {
    const model = makeModel();
    const { dirty } = useComponentReset(model, defaults);
    model.value.label = "Changed";
    expect(dirty.value).toBe(true);
  });

  it("is dirty when a style prop with no default is set", () => {
    const model = makeModel();
    const { dirty } = useComponentReset(model, defaults);
    model.value.width = { value: 100, unit: "px" };
    expect(dirty.value).toBe(true);
  });

  it("is dirty on an array change, clean again when it deep-matches the default", () => {
    const model = makeModel();
    const { dirty } = useComponentReset(model, defaults);
    model.value.groupItems = ["A", "B", "C"];
    expect(dirty.value).toBe(true);
    model.value.groupItems = ["A", "B"]; // fresh array, same contents
    expect(dirty.value).toBe(false);
  });

  it("does not flag dirty for renderAs or wrappers (toolbar-owned)", () => {
    const model = makeModel();
    const { dirty } = useComponentReset(model, defaults);
    model.value.renderAs = "button";
    model.value.wrappers = ["form"];
    expect(dirty.value).toBe(false);
  });

  it("reset reverts every prop to its default but preserves renderAs + wrappers", () => {
    const model = makeModel({
      renderAs: "input-checkbox-switch",
      wrappers: ["form"],
      label: "Changed",
      switchChecked: true,
      width: { value: 100, unit: "px" },
    });
    const { dirty, reset } = useComponentReset(model, defaults);
    expect(dirty.value).toBe(true);

    reset();

    expect(model.value.label).toBe("Toggle");
    expect(model.value.switchChecked).toBe(false);
    expect(model.value.width).toBeUndefined(); // no default -> dropped
    expect(model.value.renderAs).toBe("input-checkbox-switch"); // preserved
    expect(model.value.wrappers).toEqual(["form"]); // preserved
    expect(dirty.value).toBe(false);
  });
});
