import { describe, expect, it } from "vitest";
import { controlPanelValuesEqual } from "../../app/utils/controlPanelValuesEqual";

describe("controlPanelValuesEqual", () => {
  it("compares primitives", () => {
    expect(controlPanelValuesEqual(1, 1)).toBe(true);
    expect(controlPanelValuesEqual("a", "a")).toBe(true);
    expect(controlPanelValuesEqual(true, false)).toBe(false);
    expect(controlPanelValuesEqual(1, 2)).toBe(false);
  });

  it("treats two undefined as equal, undefined vs a value as not", () => {
    expect(controlPanelValuesEqual(undefined, undefined)).toBe(true);
    expect(controlPanelValuesEqual(undefined, { value: 1, unit: "px" })).toBe(false);
    expect(controlPanelValuesEqual(null, undefined)).toBe(false);
  });

  it("compares CssLength objects structurally", () => {
    expect(controlPanelValuesEqual({ value: 16, unit: "px" }, { value: 16, unit: "px" })).toBe(true);
    expect(controlPanelValuesEqual({ value: 16, unit: "px" }, { value: 16, unit: "rem" })).toBe(
      false,
    );
    expect(controlPanelValuesEqual({ value: 16, unit: "px" }, { value: 18, unit: "px" })).toBe(
      false,
    );
  });

  it("compares arrays by order and contents", () => {
    expect(controlPanelValuesEqual(["a", "b"], ["a", "b"])).toBe(true);
    expect(controlPanelValuesEqual(["a", "b"], ["b", "a"])).toBe(false);
    expect(controlPanelValuesEqual([true, false], [true, false, true])).toBe(false);
  });

  it("distinguishes objects with different keys", () => {
    expect(controlPanelValuesEqual({ a: 1 }, { a: 1, b: 2 })).toBe(false);
    expect(controlPanelValuesEqual({ a: 1 }, { b: 1 })).toBe(false);
  });
});
