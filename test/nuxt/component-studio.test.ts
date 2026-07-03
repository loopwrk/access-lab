/**
 * ComponentStudio is the studio shell. It's a heavy mount (a preview iframe plus
 * six teleports into layout-owned ids and a toast service), so the children are
 * stubbed, the teleport targets are created by hand, and useToast is mocked —
 * which isolates the shell's OWN logic, the part worth pinning here:
 *
 *   - teleport resolution: each panel lands in its inspector target;
 *   - toast selection: the generic demo:click toast is suppressed when the
 *     definition opts in (suppressDemoClickToast), and a form:submitted toast
 *     picks the RIGHT follow-up link — the implicit-submit lesson for a type-less
 *     <button>, the coordinates lesson for an <input type=image>, and NO link for
 *     an explicit submit (mutually exclusive by construction);
 *   - the wrapper-availability watcher clears a selected context wrapper that the
 *     newly-chosen variant no longer allows, and keeps one that still applies.
 *
 * The render WIRING is also pinned here (see "render wiring" below): mounting
 * the studio must deliver the definition's markup to PreviewIframe.render
 * through the previewRef template binding. The live iframe render, real toast
 * rendering, and real teleported panels are integration concerns left to Part D.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { mockNuxtImport, mountSuspended } from "@nuxt/test-utils/runtime";
import { defineComponent, h, nextTick } from "vue";
import type { Ref } from "vue";
import { useState } from "#imports";
import ComponentStudio from "~/components/ComponentStudio.vue";
import type { ComponentDefinition } from "~/types/component";

const toastAdd = vi.hoisted(() => vi.fn());
mockNuxtImport("useToast", () => () => ({ add: toastAdd }));

const renderSpy = vi.hoisted(() => vi.fn());
const PreviewIframeStub = defineComponent({
  name: "PreviewIframe",
  setup(_, { expose }) {
    expose({ render: renderSpy }); // useInspectedComponent calls previewRef.value?.render
    return () => h("div", { class: "preview-iframe-stub" });
  },
});
const ControlsStub = defineComponent({
  props: ["modelValue"],
  emits: ["update:modelValue"],
  render: () => h("div", { class: "controls-stub" }),
});

const STUBS = {
  PreviewIframe: PreviewIframeStub,
  VariantPicker: true,
  WrapperToggles: true,
  IssuesPanel: true,
  ManualReviewPanel: true,
  LearnPanel: true,
};

const TARGET_IDS = [
  "preview-toolbar-variant",
  "preview-toolbar-wrappers",
  "controls-panel",
  "controls-utility-reset",
  "issues-panel",
  "manual-panel",
  "learn-panel",
];

function makeDef(over: Partial<ComponentDefinition> = {}): ComponentDefinition {
  return {
    id: "select", // any valid ComponentId; only used as the state key
    name: "Test Component",
    tagName: "button",
    defaultProps: { renderAs: "a", wrappers: [] },
    rules: [],
    manualChecklist: [],
    render: () => ({ html: "<button>x</button>" }),
    controlsComponent: ControlsStub,
    variants: [
      { key: "a", label: "A" },
      { key: "button-button", label: "BB" },
    ],
    contextWrappers: [
      { key: "form", label: "<form>", wrap: (html) => html }, // available everywhere
      { key: "button", label: "<button>", wrap: (html) => html, availableFor: (r) => r !== "button-button" },
    ],
    suppressDemoClickToast: false,
    primaryLearnTopicId: "select",
    relatedLearnTopicIds: [],
    relevantConcepts: [],
    ...over,
  };
}

let panel: Awaited<ReturnType<typeof mountSuspended>> | null = null;
let cp: Ref<Partial<Record<string, unknown>>>;

beforeEach(() => {
  for (const id of TARGET_IDS) {
    const el = document.createElement("div");
    el.id = id;
    document.body.appendChild(el);
  }
  toastAdd.mockClear();
  renderSpy.mockClear();
});

afterEach(() => {
  panel?.unmount();
  panel = null;
  for (const id of TARGET_IDS) document.getElementById(id)?.remove();
});

async function flush() {
  await nextTick();
  await nextTick();
}

async function mountStudio(def: ComponentDefinition) {
  const Harness = defineComponent({
    components: { ComponentStudio },
    setup() {
      cp = useState<Partial<Record<string, unknown>>>(
        `inspected-component-props:${def.id}`,
        () => ({ ...def.defaultProps }),
      );
      return () => h(ComponentStudio, { definition: def });
    },
  });
  const w = await mountSuspended(Harness, { global: { stubs: STUBS } });
  panel = w;
  await flush();
  // Clean per-test start (the state key persists across mounts in-file).
  cp.value = { ...def.defaultProps };
  await flush();
  return w;
}

function dispatch(data: Record<string, unknown>) {
  window.dispatchEvent(new MessageEvent("message", { data }));
}

const childCount = (id: string) => document.getElementById(id)?.children.length ?? 0;

describe("ComponentStudio — teleport resolution", () => {
  it("teleports every panel and toolbar control into its target", async () => {
    await mountStudio(makeDef());
    expect(childCount("issues-panel")).toBeGreaterThan(0);
    expect(childCount("manual-panel")).toBeGreaterThan(0);
    expect(childCount("learn-panel")).toBeGreaterThan(0);
    expect(childCount("controls-panel")).toBeGreaterThan(0);
    expect(childCount("controls-utility-reset")).toBeGreaterThan(0); // reset teleported into the row
    expect(childCount("preview-toolbar-variant")).toBeGreaterThan(0); // variants present
    expect(childCount("preview-toolbar-wrappers")).toBeGreaterThan(0); // wrappers available
  });
});

describe("ComponentStudio — render wiring (previewRef seam)", () => {
  // Guards the July 2026 regression class: `<PreviewIframe ref="previewRef">`
  // lost its setup binding, useInspectedComponent rendered into a ref that
  // stayed null, and every suite stayed green while the iframe showed nothing.
  // The unit suites cover the queue and the teleports; THIS is the plug
  // between them.
  it("delivers the rendered markup to the preview on mount", async () => {
    await mountStudio(makeDef());
    await vi.waitFor(() => expect(renderSpy).toHaveBeenCalled());
    expect(renderSpy.mock.lastCall?.[0]).toContain("<button>x</button>");
  });

  it("re-renders into the preview when the prop bag changes", async () => {
    await mountStudio(
      makeDef({ render: (p) => ({ html: `<button>${String(p.label ?? "x")}</button>` }) }),
    );
    await vi.waitFor(() => expect(renderSpy).toHaveBeenCalled());
    renderSpy.mockClear();

    cp.value = { ...cp.value, label: "Changed" };
    await vi.waitFor(() => expect(renderSpy).toHaveBeenCalled());
    expect(renderSpy.mock.lastCall?.[0]).toContain("<button>Changed</button>");
  });
});

describe("ComponentStudio — demo:click toast suppression", () => {
  it("fires the generic toast when the definition does not opt out", async () => {
    await mountStudio(makeDef({ suppressDemoClickToast: false }));
    dispatch({ type: "demo:click" });
    await flush();
    expect(toastAdd).toHaveBeenCalledTimes(1);
    expect(toastAdd.mock.lastCall?.[0].title).toBe("Click event fired");
  });

  it("suppresses the generic toast when the definition opts out", async () => {
    await mountStudio(makeDef({ suppressDemoClickToast: true }));
    dispatch({ type: "demo:click" });
    await flush();
    expect(toastAdd).not.toHaveBeenCalled();
  });
});

describe("ComponentStudio — form:submitted follow-up link selection", () => {
  it("links to the implicit-submit lesson for a type-less button, and lists the payload", async () => {
    await mountStudio(makeDef());
    dispatch({
      type: "form:submitted",
      entries: [{ name: "a", value: "1" }],
      wasImplicitSubmit: true,
      wasImageSubmit: false,
    });
    await flush();
    const arg = toastAdd.mock.lastCall?.[0];
    expect(arg.title).toBe("Form submission sent");
    expect(arg.description).toBe("a=1");
    expect(arg.actions?.[0]?.label).toBe("Why did the button send a form submission?");
  });

  it("links to the coordinates lesson for an image submit, and shows the no-payload label", async () => {
    await mountStudio(makeDef());
    dispatch({
      type: "form:submitted",
      entries: [],
      wasImplicitSubmit: false,
      wasImageSubmit: true,
    });
    await flush();
    const arg = toastAdd.mock.lastCall?.[0];
    expect(arg.description).toBe("(no payload)");
    expect(arg.actions?.[0]?.label).toBe("Why is the button attempting to submit coordinates?");
  });

  it("shows no follow-up link for an explicit submit", async () => {
    await mountStudio(makeDef());
    dispatch({
      type: "form:submitted",
      entries: [{ name: "x", value: "y" }],
      wasImplicitSubmit: false,
      wasImageSubmit: false,
    });
    await flush();
    expect(toastAdd.mock.lastCall?.[0].actions).toBeUndefined();
  });
});

describe("ComponentStudio — wrapper-availability watcher", () => {
  it("clears a selected wrapper that the newly-chosen variant no longer allows", async () => {
    await mountStudio(makeDef());
    cp.value = { ...cp.value, renderAs: "a", wrappers: ["button"] }; // button wrapper allowed for "a"
    await flush();
    expect(cp.value.wrappers).toEqual(["button"]);

    cp.value = { ...cp.value, renderAs: "button-button" }; // not allowed here
    await flush();
    expect(cp.value.wrappers).toEqual([]); // watcher cleared it
  });

  it("keeps a wrapper that stays available across a variant change", async () => {
    await mountStudio(makeDef());
    cp.value = { ...cp.value, renderAs: "a", wrappers: ["form"] }; // form is always available
    await flush();

    cp.value = { ...cp.value, renderAs: "button-button" };
    await flush();
    expect(cp.value.wrappers).toEqual(["form"]); // unchanged
  });
});
