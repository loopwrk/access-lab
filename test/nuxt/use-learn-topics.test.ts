/**
 * useLearnTopics / useLearnTopicTree are thin wrappers over Nuxt Content. Their
 * testable logic is the shaping: topics map raw docs into LearnTopic (id from
 * topicId, related/concepts defaulted to []); the tree groups topics by category
 * in LEARN_CATEGORIES order, sorts each group by `order`, and drops empty
 * categories; and `status` is forwarded from useAsyncData by both.
 *
 * queryCollection can't run in happy-dom, so useAsyncData is mocked to drive
 * data + status directly (the handler is never invoked).
 */

import { afterEach, describe, expect, it, vi } from "vitest";
import { mockNuxtImport, mountSuspended } from "@nuxt/test-utils/runtime";
import { defineComponent, h, ref } from "vue";
import { useLearnTopics, useLearnTopicTree } from "~/composables/useLearnTopics";

interface RawDoc {
  topicId: string;
  title: string;
  summary: string;
  category?: string;
  order?: number;
  related?: string[];
  concepts?: string[];
}

const asyncState = vi.hoisted(() => ({ data: null as RawDoc[] | null, status: "success" as string }));
mockNuxtImport("useAsyncData", () => () => ({ data: ref(asyncState.data), status: ref(asyncState.status) }));

let captured: { lt: ReturnType<typeof useLearnTopics>; tree: ReturnType<typeof useLearnTopicTree> };
let wrapper: { unmount: () => void } | null = null;

afterEach(() => {
  wrapper?.unmount();
  wrapper = null;
});

async function mountWith(docs: RawDoc[] | null, status = "success") {
  asyncState.data = docs;
  asyncState.status = status;
  const Harness = defineComponent({
    setup() {
      captured = { lt: useLearnTopics(), tree: useLearnTopicTree() };
      return () => h("div");
    },
  });
  wrapper = await mountSuspended(Harness);
}

describe("useLearnTopics", () => {
  it("maps raw docs to LearnTopic, defaulting related/concepts to []", async () => {
    await mountWith([
      { topicId: "checkbox", title: "Checkbox", summary: "S", category: "form-inputs", order: 3 },
    ]);
    expect(captured.lt.topics.value).toEqual([
      { id: "checkbox", title: "Checkbox", summary: "S", category: "form-inputs", order: 3, related: [], concepts: [] },
    ]);
  });

  it("returns an empty topics list when data is null", async () => {
    await mountWith(null, "pending");
    expect(captured.lt.topics.value).toEqual([]);
  });
});

describe("useLearnTopicTree", () => {
  it("groups by category (in LEARN_CATEGORIES order), sorts by order, drops empty categories", async () => {
    await mountWith([
      { topicId: "a", title: "A", summary: "", category: "foundations", order: 2 },
      { topicId: "b", title: "B", summary: "", category: "foundations", order: 1 },
      { topicId: "c", title: "C", summary: "", category: "forms", order: 1 },
    ]);
    const groups = captured.tree.groups.value;
    expect(groups.map((g) => g.category.id)).toEqual(["foundations", "forms"]); // accessible-names (empty) dropped
    expect(groups[0]!.topics.map((t) => t.id)).toEqual(["b", "a"]); // sorted by order
    expect(groups[1]!.topics.map((t) => t.id)).toEqual(["c"]);
  });

  it("forwards the useAsyncData status from both composables", async () => {
    await mountWith([], "pending");
    expect(captured.lt.status.value).toBe("pending");
    expect(captured.tree.status.value).toBe("pending");
  });
});
