/**
 * Nuxt tests for SelectControls: the iframe bridge (`select:change` →
 * selectedOption for the native <select>; `demo:activate` toggles the
 * div-combobox's host-owned open state; `demo:pick` commits an option and
 * closes the popup), and the Options textarea parsing.
 *
 * The headline case is the regression guard for the single-write fix: removing
 * the currently-selected option from the textarea must update the list AND
 * clear the selection. The old two-write version raced through defineModel and
 * dropped the list change (the removed option sprang back) - the exact bug we
 * fixed in RadioControls for B9.
 */

import { afterEach, describe, expect, it } from "vitest";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { defineComponent, nextTick, ref } from "vue";
import SelectControls from "~/components/inspected/select/SelectControls.vue";
import type { SelectProps } from "~/components/inspected/select/definition";

let wrapper: { unmount: () => void } | null = null;
afterEach(() => {
  wrapper?.unmount();
  wrapper = null;
});

function makeWrapper(initial: Partial<SelectProps>) {
  const model = ref<Partial<SelectProps>>({ ...initial });
  const Wrapper = defineComponent({
    components: { SelectControls },
    setup() {
      return { model };
    },
    template: `<SelectControls v-model="model" />`,
  });
  return { model, Wrapper };
}

const BASE: Partial<SelectProps> = {
  renderAs: "select-native",
  label: "Choose an ocean: ",
  name: "ocean",
  labelAssociation: "for-id",
  options: ["Antarctic", "Arctic", "Atlantic", "Indian", "Pacific"],
  selectedOption: "Arctic",
  required: false,
  disabled: false,
  hasPlaceholder: false,
};

async function flush() {
  await nextTick();
  await nextTick();
}

async function dispatch(data: Record<string, unknown>) {
  // Mirrors what preview-shell.html posts; usePreviewMessage passes the whole
  // event.data to the handler keyed by data.type.
  window.dispatchEvent(new MessageEvent("message", { data }));
  await flush();
}

// Drive the Options <textarea> the way a user typing would.
async function setTextarea(w: { find: (s: string) => { element: Element } }, value: string) {
  const el = w.find("textarea").element as HTMLTextAreaElement;
  const setter = Object.getOwnPropertyDescriptor(
    window.HTMLTextAreaElement.prototype,
    "value",
  )!.set!;
  setter.call(el, value);
  el.dispatchEvent(new Event("input", { bubbles: true }));
  await flush();
}

describe("SelectControls - iframe pick bridge maps a posted label to selectedOption", () => {
  it("sets selectedOption from a native select:change when the label is a current option", async () => {
    const { model, Wrapper } = makeWrapper({ ...BASE });
    wrapper = await mountSuspended(Wrapper);
    await dispatch({ type: "select:change", label: "Pacific" });
    expect(model.value.selectedOption).toBe("Pacific");
  });

  it("ignores a stale label that is no longer in the options (picked then removed same frame)", async () => {
    const { model, Wrapper } = makeWrapper({ ...BASE });
    wrapper = await mountSuspended(Wrapper);
    await dispatch({ type: "select:change", label: "Mediterranean" });
    expect(model.value.selectedOption).toBe("Arctic"); // unchanged
  });

  it("ignores malformed payloads (empty label, missing label)", async () => {
    const { model, Wrapper } = makeWrapper({ ...BASE });
    wrapper = await mountSuspended(Wrapper);
    await dispatch({ type: "select:change", label: "" });
    expect(model.value.selectedOption).toBe("Arctic");
    await dispatch({ type: "select:change" });
    expect(model.value.selectedOption).toBe("Arctic");
  });
});

describe("SelectControls - div-combobox open state (demo:activate) + option commit (demo:pick)", () => {
  it("toggles the host-owned comboboxOpen on each demo:activate", async () => {
    const { model, Wrapper } = makeWrapper({
      ...BASE,
      renderAs: "div-combobox",
      comboboxOpen: false,
    });
    wrapper = await mountSuspended(Wrapper);
    await dispatch({ type: "demo:activate", interaction: "toggle" });
    expect(model.value.comboboxOpen).toBe(true);
    await dispatch({ type: "demo:activate", interaction: "toggle" });
    expect(model.value.comboboxOpen).toBe(false);
  });

  it("commits a current option AND closes the popup on demo:pick (single write - both survive)", async () => {
    const { model, Wrapper } = makeWrapper({
      ...BASE,
      renderAs: "div-combobox",
      comboboxOpen: true,
    });
    wrapper = await mountSuspended(Wrapper);
    await dispatch({ type: "demo:pick", value: "Indian" });
    expect(model.value.selectedOption).toBe("Indian");
    expect(model.value.comboboxOpen).toBe(false);
  });

  it("closes the popup but keeps the selection when demo:pick carries a stale label", async () => {
    const { model, Wrapper } = makeWrapper({
      ...BASE,
      renderAs: "div-combobox",
      comboboxOpen: true,
      selectedOption: "Arctic",
    });
    wrapper = await mountSuspended(Wrapper);
    await dispatch({ type: "demo:pick", value: "Mediterranean" });
    expect(model.value.selectedOption).toBe("Arctic"); // unchanged
    expect(model.value.comboboxOpen).toBe(false); // still closes
  });
});

describe("SelectControls - Options textarea", () => {
  it("removing the SELECTED option updates the list AND clears the selection (single write, no race)", async () => {
    const { model, Wrapper } = makeWrapper({ ...BASE }); // Arctic selected
    const w = await mountSuspended(Wrapper);
    wrapper = w;
    await setTextarea(w, "Antarctic\nAtlantic\nIndian\nPacific"); // Arctic removed
    expect(model.value.options).toEqual(["Antarctic", "Atlantic", "Indian", "Pacific"]); // list change survives
    expect(model.value.selectedOption).toBe(""); // orphaned selection cleared
  });

  it("removing a NON-selected option updates the list and keeps the selection", async () => {
    const { model, Wrapper } = makeWrapper({ ...BASE }); // Arctic selected
    const w = await mountSuspended(Wrapper);
    wrapper = w;
    await setTextarea(w, "Antarctic\nArctic\nAtlantic\nIndian"); // Pacific removed
    expect(model.value.options).toEqual(["Antarctic", "Arctic", "Atlantic", "Indian"]);
    expect(model.value.selectedOption).toBe("Arctic");
  });

  it("trims and drops blank lines", async () => {
    const { model, Wrapper } = makeWrapper({ ...BASE });
    const w = await mountSuspended(Wrapper);
    wrapper = w;
    await setTextarea(w, "  Arctic  \n\n  Pacific \n");
    expect(model.value.options).toEqual(["Arctic", "Pacific"]);
  });
});
