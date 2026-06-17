/**
 * OnboardingModal is the first-run tour shell over useOnboarding. The logic worth
 * pinning (the visual fidelity is covered by manual/axe passes, not here):
 *
 *   - auto-open: on mount it opens ONLY when unseen AND on desktop — a seen flag or
 *     a below-desktop viewport suppresses it (the studio is MobileBlocker-covered
 *     below lg, so the tour must not fire there);
 *   - the per-step lead renders as the heading (step-title bar currently hidden);
 *   - the footer counter reads "Step n of 4"; Back is hidden on the first step;
 *   - Next advances the step; the last step swaps Next for "Get started", which
 *     closes the modal and marks it seen (persisted to localStorage).
 *   - the modal's accessible name is the onboarding title.
 *
 * State note: the component calls useOnboarding() itself, so its persisted `hasSeen`
 * ref is a SEPARATE useLocalStorage instance from the test harness's (same key, but
 * VueUse doesn't sync them in-document). `isOpen`/`step` ARE shared (useState), so we
 * drive/observe those via the harness and treat localStorage as the source of truth
 * for the seen flag. Auto-open is gated by `hasSeen` (set via localStorage before
 * mount) and `isBelowDesktop` (mocked) — the persistence test suppresses auto-open
 * with the viewport guard so it can observe the false→true transition cleanly.
 *
 * UModal/UButton/UIcon are stubbed: UModal renders its #content slot
 * unconditionally and exposes the title prop as an aria-label so we can read the
 * content + accessible name without the Reka Dialog portal.
 */

import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { mockNuxtImport, mountSuspended } from "@nuxt/test-utils/runtime";
import { defineComponent, h, nextTick } from "vue";
import OnboardingModal from "~/components/OnboardingModal.vue";
import { useOnboarding } from "~/composables/useOnboarding";

const belowDesktop = vi.hoisted(() => ({ value: false }));
mockNuxtImport("useIsBelowDesktop", () => () => belowDesktop);
mockNuxtImport("usePreferredReducedMotion", () => () => ({ value: "no-preference" }));

const SEEN_KEY = "al-onboarding-seen";

const stubs = {
  UModal: {
    props: ["open", "title", "description", "transition", "close", "ui"],
    template: `<div data-testid="modal" :data-open="String(open)" :aria-label="title"><slot name="content" /></div>`,
  },
  UButton: {
    props: ["icon", "trailingIcon", "color", "variant", "size", "ariaLabel"],
    emits: ["click"],
    template: `<button :data-icon="icon || trailingIcon" :aria-label="ariaLabel" @click="$emit('click')"><slot /></button>`,
  },
  UIcon: { props: ["name"], template: `<i :data-icon="name" />` },
  // The feature-row visuals (Minis) use UBadge; stub it as a slot passthrough.
  UBadge: { props: ["color", "variant", "size", "icon", "ui"], template: `<span><slot /></span>` },
};

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
  belowDesktop.value = false;
});

function mount() {
  return mountSuspended(OnboardingModal, { global: { stubs } });
}

function markSeen() {
  localStorage.setItem(SEEN_KEY, "true");
}

function findButtonByText(wrapper: Awaited<ReturnType<typeof mount>>, text: string) {
  return wrapper.findAll("button").find((b) => b.text() === text);
}

describe("OnboardingModal", () => {
  it("auto-opens on mount when unseen and on desktop", async () => {
    belowDesktop.value = false;
    await mount();
    expect(api.isOpen.value).toBe(true);
  });

  it("does not auto-open when already seen", async () => {
    markSeen();
    await mount();
    expect(api.isOpen.value).toBe(false);
  });

  it("does not auto-open below the desktop breakpoint", async () => {
    belowDesktop.value = true;
    await mount();
    expect(api.isOpen.value).toBe(false);
  });

  it("renders the step's lead as the heading (step-title bar hidden)", async () => {
    markSeen();
    api.step.value = 1; // pick step
    const wrapper = await mount();
    // The lead is promoted to an h3 heading; the step-title bar is hidden, so no h2.
    expect(wrapper.get("h3").text().length).toBeGreaterThan(0);
    expect(wrapper.findAll("h2")).toHaveLength(0);
  });

  it("exposes the onboarding title as the modal's accessible name", async () => {
    markSeen();
    const wrapper = await mount();
    expect(wrapper.get("[data-testid='modal']").attributes("aria-label")).toBe(
      "Getting started with AccessLab",
    );
  });

  it("shows the step counter and hides Back on the first step", async () => {
    markSeen();
    api.step.value = 0;
    const wrapper = await mount();
    expect(wrapper.text()).toContain("Step 1 of 4");
    expect(findButtonByText(wrapper, "Back")).toBeUndefined();
  });

  it("Next advances the step", async () => {
    markSeen();
    api.step.value = 0;
    const wrapper = await mount();
    await findButtonByText(wrapper, "Next")!.trigger("click");
    expect(api.step.value).toBe(1);
    expect(wrapper.text()).toContain("Step 2 of 4");
    expect(findButtonByText(wrapper, "Back")).toBeDefined();
  });

  it("wires a decorative visual onto each feature row on the pick step", async () => {
    markSeen();
    api.step.value = 1; // pick step — two features, each with a Mini visual
    const wrapper = await mount();
    // FeatureRow wraps each visual in an aria-hidden container.
    expect(wrapper.findAll('div[aria-hidden="true"]')).toHaveLength(2);
    // The visuals reuse the real surfaces' labels.
    expect(wrapper.text()).toContain("Action buttons"); // MiniSidebar
    expect(wrapper.text()).toContain("Recommended"); // MiniVariantPicker
  });

  it("the last step swaps Next for Get started, which closes and marks seen", async () => {
    // Suppress auto-open via the viewport guard (not the seen flag), so localStorage
    // starts unseen and we can observe close() flipping it to seen.
    belowDesktop.value = true;
    api.step.value = api.stepCount - 1;
    const wrapper = await mount();
    expect(findButtonByText(wrapper, "Next")).toBeUndefined();
    await findButtonByText(wrapper, "Get started")!.trigger("click");
    await nextTick();
    expect(api.isOpen.value).toBe(false);
    expect(localStorage.getItem(SEEN_KEY)).toBe("true");
  });
});
