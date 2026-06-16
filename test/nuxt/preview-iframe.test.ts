/**
 * PreviewIframe owns the render queue and the audit-error surface:
 *   - render() before the shell is ready is QUEUED (only the latest is kept) and
 *     flushed once isReady flips; render() while ready posts immediately;
 *   - an axe errorMessage raises a toast and (in dev) a console.error, and the
 *     watch dedupes repeated identical errors (it fires only on change).
 *
 * Nuxt env: isReady / errorMessage are the shared useAxeResults state, which we
 * drive directly; useToast is mocked to capture toasts; the iframe's
 * contentWindow is replaced with a spy so the posted render payload is visible.
 */

import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { mockNuxtImport, mountSuspended } from "@nuxt/test-utils/runtime";
import { defineComponent, h, nextTick } from "vue";
import type { Ref } from "vue";
import PreviewIframe from "~/components/PreviewIframe.vue";
import { useAxeResults } from "~/composables/useAxeResults";
import type { AxeState } from "~/types/axe";

const toastAdd = vi.hoisted(() => vi.fn());
mockNuxtImport("useToast", () => () => ({ add: toastAdd }));

let state: Ref<AxeState>;
let wrapper: Awaited<ReturnType<typeof mountSuspended>> | null = null;
let errorSpy: ReturnType<typeof vi.spyOn>;

beforeAll(async () => {
  const Harness = defineComponent({
    setup() {
      state = useAxeResults();
      return () => h("div");
    },
  });
  await mountSuspended(Harness);
}, 60000);

beforeEach(() => {
  toastAdd.mockClear();
  errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  wrapper?.unmount();
  wrapper = null;
  errorSpy.mockRestore();
});

type Exposed = { render: (html: string, css?: string, rootFontSize?: number) => void };

async function mountPreview() {
  const w = await mountSuspended(PreviewIframe);
  wrapper = w;
  // useAxeAudit's onMounted(resetState) has run, so isReady is false here.
  const iframe = w.find("iframe").element as HTMLIFrameElement;
  const postMessage = vi.fn();
  Object.defineProperty(iframe, "contentWindow", { value: { postMessage }, configurable: true });
  return { w, postMessage, render: (w.vm as unknown as Exposed).render };
}

describe("PreviewIframe — render queue", () => {
  it("queues a render until the shell is ready, then flushes it", async () => {
    const { postMessage, render } = await mountPreview();

    render("<b>hi</b>");
    expect(postMessage).not.toHaveBeenCalled(); // not ready → queued

    state.value.isReady = true;
    await nextTick();
    await nextTick();
    expect(postMessage).toHaveBeenCalledWith(
      expect.objectContaining({ type: "preview:render", html: "<b>hi</b>", css: "" }),
      window.location.origin,
    );
  });

  it("posts immediately when the shell is already ready", async () => {
    const { postMessage, render } = await mountPreview();
    state.value.isReady = true;
    await nextTick();

    render("<i>now</i>", ".x{}", 18);
    expect(postMessage).toHaveBeenCalledWith(
      expect.objectContaining({ type: "preview:render", html: "<i>now</i>", css: ".x{}", rootFontSize: 18 }),
      window.location.origin,
    );
  });
});

describe("PreviewIframe — audit error surface", () => {
  it("raises a toast (and a dev console.error) when an axe error message arrives", async () => {
    await mountPreview();

    state.value.errorMessage = "kaboom";
    await nextTick();

    expect(toastAdd).toHaveBeenCalledTimes(1);
    expect(toastAdd.mock.lastCall?.[0]).toMatchObject({
      title: "Accessibility audit failed",
      description: "kaboom",
      color: "error",
    });
    if (import.meta.dev) expect(errorSpy).toHaveBeenCalled();
  });

  it("does not re-toast the same error message (dedupe via the watch)", async () => {
    await mountPreview();

    state.value.errorMessage = "again";
    await nextTick();
    state.value.errorMessage = "again"; // unchanged → watch does not fire
    await nextTick();
    expect(toastAdd).toHaveBeenCalledTimes(1);
  });

  it("does not toast when the error clears", async () => {
    await mountPreview();

    state.value.errorMessage = "first";
    await nextTick();
    toastAdd.mockClear();

    state.value.errorMessage = null; // cleared → no toast
    await nextTick();
    expect(toastAdd).not.toHaveBeenCalled();
  });
});
