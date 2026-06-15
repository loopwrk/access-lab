/**
 * Tests for the manual-review model: merges axe "incomplete" (needs-human-review)
 * results with the component's static checklist, tracks per-item checked state,
 * and reports progress. Manual progress sits in the same visual register as the
 * automated counts, so the maths matters.
 *
 * Nuxt env: uses useState (checked state) + useAxeResults.
 */

import { beforeAll, describe, expect, it } from "vitest";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { defineComponent, h } from "vue";
import type { Ref } from "vue";
import { useManualReview } from "~/composables/useManualReview";
import { useAxeResults } from "~/composables/useAxeResults";
import type { AxeResult, AxeState } from "~/types/axe";

interface StaticItem {
  id: string;
  title: string;
  wcagSc: string;
  description: string;
  url: string;
}

const STATIC: StaticItem[] = [
  { id: "s1", title: "First check", wcagSc: "1.1.1", description: "Do the first thing", url: "https://x/1" },
  { id: "s2", title: "Second check", wcagSc: "2.4.6", description: "Do the second thing", url: "https://x/2" },
];

function incomplete(id: string, opts: { message?: string; failureSummary?: string } = {}): AxeResult {
  return {
    id,
    description: `axe description ${id}`,
    help: "",
    helpUrl: `https://axe/${id}`,
    tags: [],
    nodes: [
      {
        html: "<x>",
        target: ["x"],
        any: [],
        all: [],
        none: opts.message ? [{ id, message: opts.message, data: null }] : [],
        failureSummary: opts.failureSummary,
      },
    ],
  };
}

async function setup(staticItems: StaticItem[]) {
  let exposed!: { axe: Ref<AxeState>; review: ReturnType<typeof useManualReview> };
  const Wrapper = defineComponent({
    setup() {
      const axe = useAxeResults();
      const review = useManualReview(staticItems);
      exposed = { axe, review };
      return () => h("div");
    },
  });
  await mountSuspended(Wrapper);
  // Clean slate (state is shared within the file).
  exposed.axe.value.incomplete = [];
  exposed.review.uncheckAll();
  return exposed;
}

beforeAll(async () => {
  // Warm the Nuxt env once so the first real mount doesn't hit the cold-start timeout.
  await mountSuspended(defineComponent({ setup: () => () => h("div") }));
}, 60000);

describe("useManualReview", () => {
  it("lists static items first, then axe incomplete items", async () => {
    const { axe, review } = await setup(STATIC);
    axe.value.incomplete = [incomplete("a1", { message: "needs human review" })];
    const items = review.items.value;
    expect(items.map((i) => i.id)).toEqual(["s1", "s2", "a1"]);
    expect(items.map((i) => i.source)).toEqual(["static", "static", "axe"]);
    expect(items[2]!.message).toBe("needs human review");
    expect(items[2]!.title).toBe("a1"); // axe items are titled by id
    expect(items[0]!.title).toBe("First check"); // static items keep their title
  });

  it("derives the axe message: none-message → failureSummary → description", async () => {
    const { axe, review } = await setup([]);
    axe.value.incomplete = [
      incomplete("with-summary", { failureSummary: "Fix the thing" }),
      incomplete("bare"),
    ];
    const byId = Object.fromEntries(review.items.value.map((i) => [i.id, i.message]));
    expect(byId["with-summary"]).toBe("Fix the thing");
    expect(byId["bare"]).toBe("axe description bare");
  });

  it("setChecked toggles an item and updates the progress maths", async () => {
    const { review } = await setup(STATIC);
    expect(review.totalCount.value).toBe(2);
    review.setChecked("s1", true);
    expect(review.checkedCount.value).toBe(1);
    expect(review.progressPercent.value).toBe(50);
    expect(review.items.value.find((i) => i.id === "s1")!.checked).toBe(true);
  });

  it("checkAll / uncheckAll move progress to 100 and back to 0", async () => {
    const { review } = await setup(STATIC);
    review.checkAll();
    expect(review.checkedCount.value).toBe(2);
    expect(review.progressPercent.value).toBe(100);
    review.uncheckAll();
    expect(review.checkedCount.value).toBe(0);
    expect(review.progressPercent.value).toBe(0);
  });

  it("reports 100% progress when there are no items", async () => {
    const { review } = await setup([]);
    expect(review.totalCount.value).toBe(0);
    expect(review.progressPercent.value).toBe(100);
  });
});
