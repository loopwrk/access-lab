/**
 * VariantPicker is the toolbar's variant chip. Worth pinning:
 *   - a single variant renders a plain label (no popover); several render the
 *     popover with the selected variant's label on the trigger;
 *   - clicking an option emits update:modelValue with that variant's key, and
 *     the selected option carries aria-current;
 *   - the `sections` computed groups CONSECUTIVE same-section variants (so a
 *     section that reappears later starts a fresh group), which drives the
 *     separators between groups.
 *
 * UPopover renders its content behind an open-state/portal, so it's stubbed to a
 * plain element exposing both the trigger (default) and #content slots; the
 * component takes props/emits directly (not defineModel), so it mounts standalone
 * and we assert the emitted events. USeparator is stubbed to a marker so the
 * grouping count is deterministic.
 */

import { afterEach, describe, expect, it } from "vitest";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import VariantPicker from "~/components/VariantPicker.vue";
import type { ComponentVariant } from "~/types/component";

const STUBS = {
  UPopover: { template: "<div><slot /><slot name=\"content\" /></div>" },
  USeparator: { template: "<hr data-sep />" },
};

type Wrapper = Awaited<ReturnType<typeof mountSuspended>>;
type ElWrapper = ReturnType<Wrapper["findAll"]>[number];

let w: Wrapper | null = null;
afterEach(() => {
  w?.unmount();
  w = null;
});

async function mount(props: { modelValue: string; variants: ComponentVariant[] }) {
  w?.unmount();
  const wrapper = await mountSuspended(VariantPicker, { props, global: { stubs: STUBS } });
  w = wrapper;
  return wrapper;
}

// Option buttons carry a <code> with the variant label; the trigger button does
// not — so the presence of <code> disambiguates them.
function optionButton(wrapper: Wrapper, label: string) {
  return wrapper
    .findAll("button")
    .find((b: ElWrapper) => b.find("code").exists() && b.find("code").text().trim() === label);
}
function triggerButton(wrapper: Wrapper) {
  return wrapper.findAll("button").find((b: ElWrapper) => !b.find("code").exists());
}

const VARIANTS: ComponentVariant[] = [
  { key: "native", label: "<select>", status: "recommended", section: "Elements" },
  { key: "multiple", label: "<select multiple>", status: "info", section: "Elements" },
  { key: "div", label: "<div combobox>", status: "avoid", statusNote: "Avoid this", section: "Custom" },
];

describe("VariantPicker — rendering modes", () => {
  it("renders a plain label (no popover trigger) for a single variant", async () => {
    const wrapper = await mount({ modelValue: "only", variants: [{ key: "only", label: "<input>" }] });
    expect(wrapper.text()).toContain("<input>");
    expect(wrapper.findAll("button")).toHaveLength(0);
  });

  it("shows the selected variant's label on the popover trigger when there are several", async () => {
    const wrapper = await mount({ modelValue: "multiple", variants: VARIANTS });
    expect(triggerButton(wrapper)?.text()).toContain("<select multiple>");
  });
});

describe("VariantPicker — selection", () => {
  it("emits update:modelValue with the picked variant's key", async () => {
    const wrapper = await mount({ modelValue: "native", variants: VARIANTS });
    await optionButton(wrapper, "<div combobox>")!.trigger("click");
    expect(wrapper.emitted("update:modelValue")?.[0]).toEqual(["div"]);
  });

  it("marks the selected option with aria-current", async () => {
    const wrapper = await mount({ modelValue: "multiple", variants: VARIANTS });
    expect(optionButton(wrapper, "<select multiple>")!.attributes("aria-current")).toBe("true");
    expect(optionButton(wrapper, "<select>")!.attributes("aria-current")).toBeUndefined();
  });

  it("renders the Recommended badge on a recommended variant", async () => {
    const wrapper = await mount({ modelValue: "native", variants: VARIANTS });
    expect(optionButton(wrapper, "<select>")!.text()).toContain("Recommended");
  });
});

describe("VariantPicker — section grouping (consecutive)", () => {
  it("inserts one separator between two contiguous-section groups", async () => {
    const wrapper = await mount({ modelValue: "native", variants: VARIANTS }); // Elements ×2, Custom ×1
    expect(wrapper.findAll("[data-sep]")).toHaveLength(1);
  });

  it("starts a fresh group when a section reappears non-contiguously", async () => {
    const interleaved: ComponentVariant[] = [
      { key: "a", label: "A", section: "S1" },
      { key: "b", label: "B", section: "S2" },
      { key: "c", label: "C", section: "S1" },
    ];
    const wrapper = await mount({ modelValue: "a", variants: interleaved }); // 3 consecutive groups
    expect(wrapper.findAll("[data-sep]")).toHaveLength(2);
  });
});
