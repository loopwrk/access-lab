/**
 * useOnboarding is the shared first-run-tour state: an isOpen flag, the active
 * step index, and a persisted "seen" flag (useLocalStorage) that gates auto-open.
 * The contract worth pinning:
 *
 *   - open() shows the modal AND resets to step 0 (so replaying always restarts);
 *   - close() hides the modal AND marks it seen, persisting to localStorage (every
 *     dismiss path — skip, get-started, Escape, scrim — funnels through close);
 *   - next()/prev()/goTo() clamp to [0, stepCount-1] so the footer/stepper can never
 *     walk off the ends.
 *
 * Nuxt env: useState + useLocalStorage need a Nuxt instance, so we capture the
 * composable from a mounted harness and reset the shared state per test.
 */

import { beforeAll, beforeEach, describe, expect, it } from "vitest";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { defineComponent, h, nextTick } from "vue";
import { useOnboarding } from "~/composables/useOnboarding";

let api: ReturnType<typeof useOnboarding>;

beforeAll(async () => {
  const Harness = defineComponent({
    setup() {
      api = useOnboarding();
      return () => h("div");
    },
  });
  await mountSuspended(Harness);
}, 60000);

beforeEach(() => {
  localStorage.clear();
  api.isOpen.value = false;
  api.step.value = 0;
  api.hasSeen.value = false;
});

describe("useOnboarding", () => {
  it("exposes a step count of 4", () => {
    expect(api.stepCount).toBe(4);
  });

  it("open() shows the modal and resets to the first step", () => {
    api.step.value = 2;
    api.open();
    expect(api.isOpen.value).toBe(true);
    expect(api.step.value).toBe(0);
  });

  it("close() hides the modal and persists the seen flag", async () => {
    api.open();
    api.close();
    await nextTick(); // useLocalStorage writes on a flushed watcher
    expect(api.isOpen.value).toBe(false);
    expect(api.hasSeen.value).toBe(true);
    expect(localStorage.getItem("al-onboarding-seen")).toBe("true");
  });

  it("next() advances but clamps at the last step", () => {
    api.next();
    expect(api.step.value).toBe(1);
    api.goTo(api.stepCount - 1);
    api.next();
    expect(api.step.value).toBe(api.stepCount - 1);
  });

  it("prev() retreats but clamps at the first step", () => {
    api.goTo(2);
    api.prev();
    expect(api.step.value).toBe(1);
    api.prev();
    api.prev();
    expect(api.step.value).toBe(0);
  });

  it("goTo() clamps out-of-range targets", () => {
    api.goTo(99);
    expect(api.step.value).toBe(api.stepCount - 1);
    api.goTo(-5);
    expect(api.step.value).toBe(0);
  });
});
