/**
 * ManualReviewPanel is the presentation over useManualReview (whose merge +
 * progress maths are pinned in use-manual-review.test.ts). This file covers the
 * panel-specific wiring:
 *
 *   - conditional shell: with items it shows the title, progress badge, and
 *     Check-all/Clear-all controls; with nothing to review it shows only the
 *     empty message;
 *   - axe "incomplete" items merge in AFTER the static checklist and are titled
 *     via formatRuleId (the rule id → "Title Case"), while static items keep
 *     their authored title;
 *   - the Check-all / Clear-all buttons drive progress, and progressColor maps
 *     0% → neutral, part-done → info, 100% → success.
 *
 * The panel reads its checklist once at setup (the studio re-keys the page per
 * component, so it always remounts with a fresh list) — so each case mounts a
 * fresh panel, matching production. axe incomplete + checked state are shared
 * useState we seed.
 *
 * Nuxt env: useManualReview is useState-backed; useI18n resolves the en copy.
 */

import { afterEach, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { defineComponent, h, nextTick } from "vue";
import type { Ref } from "vue";
import { useState } from "#imports";
import ManualReviewPanel from "~/components/ManualReviewPanel.vue";
import { useAxeResults } from "~/composables/useAxeResults";
import type { ManualChecklistItem } from "~/rules/types";
import type { AxeResult, AxeState } from "~/types/axe";

const CHECKLIST: ManualChecklistItem[] = [
  { id: "m1", title: "Keyboard reachable", wcagSc: "2.1.1", description: "Tab to it", url: "https://x/1" },
  { id: "m2", title: "Focus visible", wcagSc: "2.4.7", description: "See the ring", url: "https://x/2" },
];

function incomplete(id: string): AxeResult {
  return { id, description: `${id} needs review`, help: "", helpUrl: `https://axe/${id}`, tags: [], nodes: [] };
}

let axe: Ref<AxeState>;
let checked: Ref<Record<string, boolean>>;
let panel: Awaited<ReturnType<typeof mountSuspended>> | null = null;

beforeAll(async () => {
  const Capture = defineComponent({
    setup() {
      axe = useAxeResults();
      checked = useState<Record<string, boolean>>("manual-checked", () => ({}));
      return () => h("div");
    },
  });
  await mountSuspended(Capture);
}, 60000);

beforeEach(async () => {
  axe.value.incomplete = [];
  checked.value = {};
  await nextTick();
});

afterEach(() => {
  panel?.unmount();
  panel = null;
});

async function flush() {
  await nextTick();
  await nextTick();
}

async function mountPanel(checklist?: ManualChecklistItem[]) {
  const Wrapper = defineComponent({
    components: { ManualReviewPanel },
    setup() {
      return { checklist };
    },
    template: `<ManualReviewPanel :checklist="checklist" />`,
  });
  const w = await mountSuspended(Wrapper);
  panel = w;
  await flush();
  return w;
}

function buttonByText(w: { findAll: (s: string) => Array<{ text: () => string; trigger: (e: string) => Promise<void> }> }, label: string) {
  return w.findAll("button").find((b) => b.text().trim() === label);
}

describe("ManualReviewPanel — shell", () => {
  it("shows only the empty message and no controls when there is nothing to review", async () => {
    const w = await mountPanel([]);
    expect(w.text()).toContain("No manual review items");
    expect(w.text()).not.toContain("Manual Review"); // title hidden (v-if totalCount)
    expect(buttonByText(w, "Check all")).toBeUndefined();
    expect(buttonByText(w, "Clear all")).toBeUndefined();
  });

  it("renders the title, a progress badge, action buttons, and an item per check", async () => {
    const w = await mountPanel(CHECKLIST);
    expect(w.text()).toContain("Manual Review");
    expect(w.text()).toContain("0 of 2 reviewed");
    expect(buttonByText(w, "Check all")).toBeDefined();
    expect(buttonByText(w, "Clear all")).toBeDefined();
    expect(w.text()).toContain("Keyboard reachable");
    expect(w.text()).toContain("Focus visible");
    expect(w.text()).toContain("WCAG 2.1.1");
  });
});

describe("ManualReviewPanel — axe merge + progress", () => {
  it("merges axe incomplete items after the static checklist, titled via formatRuleId", async () => {
    axe.value.incomplete = [incomplete("color-contrast")];
    await nextTick();
    const w = await mountPanel(CHECKLIST);
    expect(w.text()).toContain("Color Contrast"); // axe rule id → Title Case
    expect(w.text()).toContain("Keyboard reachable"); // static title kept verbatim
    expect(w.text()).toContain("0 of 3 reviewed"); // 2 static + 1 axe
  });

  it("Check all and Clear all drive the progress badge", async () => {
    const w = await mountPanel(CHECKLIST);
    expect(w.text()).toContain("0 of 2 reviewed");

    await buttonByText(w, "Check all")!.trigger("click");
    await flush();
    expect(w.text()).toContain("2 of 2 reviewed");

    await buttonByText(w, "Clear all")!.trigger("click");
    await flush();
    expect(w.text()).toContain("0 of 2 reviewed");
  });

  it("maps progress to the badge colour: neutral at 0, info part-done, success at 100", async () => {
    const w = await mountPanel(CHECKLIST);
    const badgeColor = () => w.findComponent({ name: "UBadge" }).props("color");

    expect(badgeColor()).toBe("neutral"); // 0%

    checked.value = { m1: true };
    await flush();
    expect(badgeColor()).toBe("info"); // part-done
    expect(w.text()).toContain("1 of 2 reviewed");

    checked.value = { m1: true, m2: true };
    await flush();
    expect(badgeColor()).toBe("success"); // 100%
  });
});
