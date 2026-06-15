/**
 * WrapperToggles is the toolbar's container chip — single-select over the
 * context wrappers. Worth pinning:
 *   - selecting a wrapper emits [key] (replace, not append); selecting None
 *     emits [] — the single-select semantics;
 *   - the trigger shows the selected wrapper's label, or "None" when empty, and
 *     the active option carries aria-current;
 *   - the learn link renders only when the selected wrapper declares a topic.
 *
 * Same approach as VariantPicker: UPopover stubbed to expose the trigger +
 * #content slots, mounted standalone with props/emits.
 */

import { afterEach, describe, expect, it } from "vitest";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import WrapperToggles from "~/components/WrapperToggles.vue";
import type { ContextWrapper } from "~/types/component";

const STUBS = {
  UPopover: { template: "<div><slot /><slot name=\"content\" /></div>" },
};

type Wrapper = Awaited<ReturnType<typeof mountSuspended>>;
type ElWrapper = ReturnType<Wrapper["findAll"]>[number];

let w: Wrapper | null = null;
afterEach(() => {
  w?.unmount();
  w = null;
});

async function mount(props: { modelValue: string[]; options: ContextWrapper[] }) {
  w?.unmount();
  const wrapper = await mountSuspended(WrapperToggles, { props, global: { stubs: STUBS } });
  w = wrapper;
  return wrapper;
}

function optionButton(wrapper: Wrapper, label: string) {
  return wrapper
    .findAll("button")
    .find((b: ElWrapper) => b.find("code").exists() && b.find("code").text().trim() === label);
}
function triggerButton(wrapper: Wrapper) {
  return wrapper.findAll("button").find((b: ElWrapper) => !b.find("code").exists());
}

const FORM: ContextWrapper = { key: "form", label: "<form>", wrap: (h) => h, learnTopicId: "form-wrapping" };
const ANCHOR: ContextWrapper = { key: "anchor", label: "<a href>", wrap: (h) => h }; // no learnTopicId

describe("WrapperToggles — single-select", () => {
  it("emits [key] when a wrapper is chosen (replace semantics)", async () => {
    const wrapper = await mount({ modelValue: [], options: [FORM, ANCHOR] });
    await optionButton(wrapper, "<form>")!.trigger("click");
    expect(wrapper.emitted("update:modelValue")?.[0]).toEqual([["form"]]);
  });

  it("emits [] when None is chosen", async () => {
    const wrapper = await mount({ modelValue: ["form"], options: [FORM, ANCHOR] });
    await optionButton(wrapper, "None")!.trigger("click");
    expect(wrapper.emitted("update:modelValue")?.[0]).toEqual([[]]);
  });
});

describe("WrapperToggles — trigger + current marking", () => {
  it("shows the selected wrapper's label on the trigger", async () => {
    const wrapper = await mount({ modelValue: ["form"], options: [FORM, ANCHOR] });
    expect(triggerButton(wrapper)?.text()).toContain("<form>");
  });

  it("shows None on the trigger when nothing is selected", async () => {
    const wrapper = await mount({ modelValue: [], options: [FORM, ANCHOR] });
    expect(triggerButton(wrapper)?.text()).toContain("None");
  });

  it("marks the active option with aria-current", async () => {
    const wrapper = await mount({ modelValue: ["form"], options: [FORM, ANCHOR] });
    expect(optionButton(wrapper, "<form>")!.attributes("aria-current")).toBe("true");
    expect(optionButton(wrapper, "None")!.attributes("aria-current")).toBeUndefined();
  });

  it("marks None as current when nothing is selected", async () => {
    const wrapper = await mount({ modelValue: [], options: [FORM, ANCHOR] });
    expect(optionButton(wrapper, "None")!.attributes("aria-current")).toBe("true");
  });
});

describe("WrapperToggles — learn link", () => {
  it("shows the learn link only when the selected wrapper declares a topic", async () => {
    const withTopic = await mount({ modelValue: ["form"], options: [FORM, ANCHOR] });
    expect(withTopic.find("a[href=\"#topic-form-wrapping\"]").exists()).toBe(true);

    const noTopic = await mount({ modelValue: ["anchor"], options: [FORM, ANCHOR] });
    expect(noTopic.find("a").exists()).toBe(false);

    const none = await mount({ modelValue: [], options: [FORM, ANCHOR] });
    expect(none.find("a").exists()).toBe(false);
  });
});
