/**
 * useAxeAudit is the iframe→host bridge for axe results. Its contract:
 *   - it ONLY trusts messages whose event.source is the iframe's contentWindow
 *     (the reason it uses useEventListener directly, not usePreviewMessage);
 *   - preview:ready flips isReady; axe:result fills violations/passes/incomplete
 *     (defensively coercing non-arrays to []); axe:error captures a string
 *     message (else null); dom:measurement stores the DOM measurement;
 *   - resetState on mount clears the shared audit state.
 *
 * Nuxt env: it's useState-backed (useAxeResults + dom-measurement) and attaches
 * a window message listener. We drive it with synthetic MessageEvents whose
 * `source` we force to match (or not match) the fake iframe contentWindow.
 */

import { afterEach, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { defineComponent, h, nextTick } from "vue";
import type { Ref } from "vue";
import { useState } from "#imports";
import { useAxeAudit } from "~/composables/useAxeAudit";
import { useAxeResults } from "~/composables/useAxeResults";
import type { AxeState } from "~/types/axe";
import type { DomMeasurement } from "~/rules/types";

// Stand-in for iframe.contentWindow; the handler compares event.source to it.
const fakeWindow = {} as Window;
const iframeRef = { value: { contentWindow: fakeWindow } as unknown as HTMLIFrameElement };

let state: Ref<AxeState>;
let measurement: Ref<DomMeasurement | null>;

beforeAll(async () => {
  const Harness = defineComponent({
    setup() {
      useAxeAudit(iframeRef);
      state = useAxeResults();
      measurement = useState<DomMeasurement | null>("dom-measurement", () => null);
      return () => h("div");
    },
  });
  await mountSuspended(Harness);
}, 60000);

beforeEach(() => {
  state.value.isReady = false;
  state.value.violations = [];
  state.value.passes = [];
  state.value.incomplete = [];
  state.value.errorMessage = null;
  measurement.value = null;
});

afterEach(() => {
  // nothing per-test to unmount; the harness lives for the file
});

async function post(data: unknown, source: unknown = fakeWindow) {
  const event = new MessageEvent("message", { data });
  Object.defineProperty(event, "source", { value: source, configurable: true });
  window.dispatchEvent(event);
  await nextTick();
}

describe("useAxeAudit — message handling", () => {
  it("flips isReady on preview:ready", async () => {
    await post({ type: "preview:ready" });
    expect(state.value.isReady).toBe(true);
  });

  it("stores violations / passes / incomplete from axe:result", async () => {
    await post({
      type: "axe:result",
      violations: [{ id: "v1" }],
      passes: [{ id: "p1" }, { id: "p2" }],
      incomplete: [{ id: "i1" }],
    });
    expect(state.value.violations.map((r) => r.id)).toEqual(["v1"]);
    expect(state.value.passes.map((r) => r.id)).toEqual(["p1", "p2"]);
    expect(state.value.incomplete.map((r) => r.id)).toEqual(["i1"]);
    expect(state.value.errorMessage).toBe(null);
  });

  it("coerces non-array axe:result payloads to empty arrays (defensive)", async () => {
    await post({ type: "axe:result", violations: "nope", passes: null, incomplete: undefined });
    expect(state.value.violations).toEqual([]);
    expect(state.value.passes).toEqual([]);
    expect(state.value.incomplete).toEqual([]);
  });

  it("captures a string axe:error message, and null for a non-string", async () => {
    await post({ type: "axe:error", message: "boom" });
    expect(state.value.errorMessage).toBe("boom");
    await post({ type: "axe:error", message: 123 });
    expect(state.value.errorMessage).toBe(null);
  });

  it("stores the DOM measurement from dom:measurement", async () => {
    const m: DomMeasurement = {
      tagName: "button",
      scrollWidth: 200,
      clientWidth: 100,
      scrollHeight: 40,
      clientHeight: 40,
      targetWidth: 100,
      targetHeight: 40,
    };
    await post({ type: "dom:measurement", measurement: m });
    expect(measurement.value).toEqual(m);
  });

  it("ignores messages whose source is not the iframe contentWindow", async () => {
    await post({ type: "preview:ready" }, { notTheIframe: true });
    expect(state.value.isReady).toBe(false);
  });

  it("ignores malformed messages with no string type", async () => {
    state.value.isReady = true;
    await post({ violations: [{ id: "x" }] }); // no `type`
    expect(state.value.violations).toEqual([]); // untouched
  });
});

describe("useAxeAudit — resetState on mount", () => {
  it("clears the shared audit state when a fresh consumer mounts", async () => {
    // Dirty the shared state, then mount a new useAxeAudit consumer.
    state.value.isReady = true;
    state.value.violations = [{ id: "stale" }] as AxeState["violations"];
    measurement.value = { tagName: "div" } as DomMeasurement;

    const Fresh = defineComponent({
      setup() {
        useAxeAudit(iframeRef);
        return () => h("div");
      },
    });
    const w = await mountSuspended(Fresh);

    expect(state.value.isReady).toBe(false);
    expect(state.value.violations).toEqual([]);
    expect(measurement.value).toBe(null);
    w.unmount();
  });
});
