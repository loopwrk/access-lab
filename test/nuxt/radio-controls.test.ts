/**
 * Nuxt tests for RadioControls: the `demo:click-child → selectedItem` mapping
 * (picking a radio in the preview updates the model so the next host re-render
 * keeps the choice), and the group-items textarea parsing.
 *
 * The headline case is the regression guard for the single-write fix: removing
 * the currently-selected item from the textarea must update the list AND clear
 * the selection. The old two-write version raced through defineModel and
 * dropped the list change (the removed item sprang back).
 */

import { afterEach, describe, expect, it } from "vitest";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { defineComponent, nextTick, ref } from "vue";
import RadioControls from "~/components/inspected/radio/RadioControls.vue";
import type { RadioProps } from "~/components/inspected/radio/definition";

let wrapper: { unmount: () => void } | null = null;
afterEach(() => {
  wrapper?.unmount();
  wrapper = null;
});

function makeWrapper(initial: Partial<RadioProps>) {
  const model = ref<Partial<RadioProps>>({ ...initial });
  const Wrapper = defineComponent({
    components: { RadioControls },
    setup() {
      return { model };
    },
    template: `<RadioControls v-model="model" />`,
  });
  return { model, Wrapper };
}

const BASE: Partial<RadioProps> = {
  label: "Pick one",
  name: "g",
  labelAssociation: "for-id",
  groupMode: "group-with-fieldset",
  groupItems: ["Forest", "Wetland", "Grassland"],
  selectedItem: "Forest",
  required: false,
  disabled: false,
};

async function flush() {
  await nextTick();
  await nextTick();
}

async function dispatch(data: Record<string, unknown>) {
  window.dispatchEvent(new MessageEvent("message", { data }));
  await flush();
}

// Drive the group-items <textarea> the way a user typing would.
async function setTextarea(w: { find: (s: string) => { element: Element } }, value: string) {
  const el = w.find("textarea").element as HTMLTextAreaElement;
  const setter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, "value")!.set!;
  setter.call(el, value);
  el.dispatchEvent(new Event("input", { bubbles: true }));
  await flush();
}

describe("RadioControls — demo:click-child maps the picked option to selectedItem", () => {
  it("sets selectedItem to the label at the clicked index", async () => {
    const { model, Wrapper } = makeWrapper({ ...BASE });
    const w = await mountSuspended(Wrapper);
    wrapper = w;
    await dispatch({ type: "demo:click-child", index: 2 });
    expect(model.value.selectedItem).toBe("Grassland");
  });

  it("ignores an out-of-range index", async () => {
    const { model, Wrapper } = makeWrapper({ ...BASE, groupItems: ["Forest", "Wetland"] });
    const w = await mountSuspended(Wrapper);
    wrapper = w;
    await dispatch({ type: "demo:click-child", index: 5 });
    expect(model.value.selectedItem).toBe("Forest");
  });
});

describe("RadioControls — group-items textarea", () => {
  it("removing the SELECTED item updates the list AND clears the selection (single write, no race)", async () => {
    const { model, Wrapper } = makeWrapper({ ...BASE }); // Forest selected
    const w = await mountSuspended(Wrapper);
    wrapper = w;
    await setTextarea(w, "Wetland\nGrassland"); // Forest removed
    expect(model.value.groupItems).toEqual(["Wetland", "Grassland"]); // list change survives
    expect(model.value.selectedItem).toBe(""); // orphaned selection cleared
  });

  it("removing a NON-selected item updates the list and keeps the selection", async () => {
    const { model, Wrapper } = makeWrapper({ ...BASE }); // Forest selected
    const w = await mountSuspended(Wrapper);
    wrapper = w;
    await setTextarea(w, "Forest\nWetland"); // Grassland removed
    expect(model.value.groupItems).toEqual(["Forest", "Wetland"]);
    expect(model.value.selectedItem).toBe("Forest");
  });

  it("trims and drops blank lines", async () => {
    const { model, Wrapper } = makeWrapper({ ...BASE });
    const w = await mountSuspended(Wrapper);
    wrapper = w;
    await setTextarea(w, "  Forest  \n\n  Wetland \n");
    expect(model.value.groupItems).toEqual(["Forest", "Wetland"]);
  });
});
