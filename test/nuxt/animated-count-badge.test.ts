/**
 * AnimatedCountBadge has two pieces of JS-driven behaviour worth pinning; the
 * motion itself is CSS (a keyframe glow + a Vue <Transition>), neutralised by
 * the component's `@media (prefers-reduced-motion: reduce)` block — there is no
 * JS reduced-motion branch, so these tests cover the class-toggling and display
 * logic that CSS hooks onto, not the animation.
 *
 *   - Tally display: the FIRST count change snaps silently (so the opening digit
 *     is correct without animating up from 0); every later change is debounced
 *     by TALLY_SETTLE_MS before the shown number updates, so a flurry of audit
 *     re-runs settles to one tick rather than spinning.
 *   - Glow: a badge pulses the `count-badge--glow` class only when a NEW
 *     violation id appears — never on the initial population (the first ids
 *     change is swallowed), never for the success colour, and never when ids
 *     change without adding one (e.g. a removal). The class clears itself after
 *     GLOW_DURATION_MS.
 *
 * Nuxt env: the component uses useTimeoutFn + watch; only a live mount exercises
 * the timing honestly. Real timers (the delays are short).
 */

import { afterEach, describe, expect, it } from "vitest";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { defineComponent, nextTick, ref } from "vue";
import AnimatedCountBadge from "~/components/AnimatedCountBadge.vue";

let wrapper: { unmount: () => void } | null = null;
afterEach(() => {
  wrapper?.unmount();
  wrapper = null;
});

function makeWrapper(opts: { color: "error" | "warning" | "success"; count: number; violationIds?: string[] }) {
  const count = ref(opts.count);
  const violationIds = ref<string[]>(opts.violationIds ?? []);
  const Wrapper = defineComponent({
    components: { AnimatedCountBadge },
    setup() {
      return { count, violationIds, color: opts.color };
    },
    template: `<AnimatedCountBadge
      :color="color"
      :count="count"
      noun="things"
      :violation-ids="violationIds"
    />`,
  });
  return { count, violationIds, Wrapper };
}

async function flush() {
  await nextTick();
  await nextTick();
}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const GLOW_CLASS = "count-badge--glow";
function isGlowing(w: { find: (s: string) => { classes: () => string[] } }) {
  return w.find(".count-badge").classes().includes(GLOW_CLASS);
}

describe("AnimatedCountBadge — display", () => {
  it("renders the count and the pre-translated noun", async () => {
    const { Wrapper } = makeWrapper({ color: "error", count: 4 });
    const w = await mountSuspended(Wrapper);
    wrapper = w;
    await flush();
    expect(w.text()).toContain("4");
    expect(w.text()).toContain("things");
  });

  it("snaps to the first count change, then debounces later changes by the settle window", async () => {
    const { count, Wrapper } = makeWrapper({ color: "error", count: 0 });
    const w = await mountSuspended(Wrapper);
    wrapper = w;
    await flush();

    // First change snaps immediately — no waiting.
    count.value = 3;
    await flush();
    expect(w.find(".count-num").text()).toBe("3");

    // A subsequent change is held until the settle timer fires.
    count.value = 5;
    await flush();
    expect(w.text()).toContain("3"); // still the old number — debounced
    expect(w.text()).not.toContain("5");

    await wait(260);
    await flush();
    expect(w.text()).toContain("5"); // settled to the new number
  });
});

describe("AnimatedCountBadge — glow", () => {
  it("pulses the glow class for a new violation id, then clears it after the glow duration", async () => {
    const { violationIds, Wrapper } = makeWrapper({ color: "error", count: 1, violationIds: ["a"] });
    const w = await mountSuspended(Wrapper);
    wrapper = w;
    await flush();

    // First ids change is swallowed (initial population must not glow).
    violationIds.value = ["a", "b"];
    await flush();
    expect(isGlowing(w)).toBe(false);

    // A genuinely new id pulses the glow.
    violationIds.value = ["a", "b", "c"];
    await flush();
    expect(isGlowing(w)).toBe(true);

    // It clears itself after GLOW_DURATION_MS (720ms).
    await wait(760);
    await flush();
    expect(isGlowing(w)).toBe(false);
  });

  it("never glows for the success colour, even when a new id appears", async () => {
    const { violationIds, Wrapper } = makeWrapper({ color: "success", count: 6, violationIds: ["a"] });
    const w = await mountSuspended(Wrapper);
    wrapper = w;
    await flush();

    violationIds.value = ["a", "b"]; // first change (swallowed)
    await flush();
    violationIds.value = ["a", "b", "c"]; // a new id — but success opts out
    await flush();
    expect(isGlowing(w)).toBe(false);
  });

  it("does not glow when ids change without introducing a new one (e.g. a removal)", async () => {
    const { violationIds, Wrapper } = makeWrapper({ color: "warning", count: 2, violationIds: ["a"] });
    const w = await mountSuspended(Wrapper);
    wrapper = w;
    await flush();

    violationIds.value = ["a", "b"]; // first change (swallowed)
    await flush();
    violationIds.value = ["b"]; // "a" removed, "b" already seen — no new id
    await flush();
    expect(isGlowing(w)).toBe(false);
  });
});
