/**
 * learn/index.vue redirects `/learn` to the first topic — but only once the
 * topic tree has loaded. The status gate (added with the fallback fix) is the
 * point: a first topic redirects to it; a tree that resolved EMPTY (or errored)
 * falls back to `/`; and while still loading it waits (no premature bounce).
 *
 * useLearnTopicTree (Nuxt Content) is mocked to drive groups + status; navigateTo
 * is mocked to capture the redirect.
 */

import { beforeEach, describe, expect, it, vi } from "vitest";
import { mockNuxtImport, mountSuspended } from "@nuxt/test-utils/runtime";
import { ref } from "vue";

interface MockGroup {
  topics: Array<{ id: string }>;
}

const navigateTo = vi.hoisted(() => vi.fn());
const tree = vi.hoisted(() => ({ groups: [] as Array<{ topics: Array<{ id: string }> }>, status: "pending" as string }));

mockNuxtImport("navigateTo", () => navigateTo);
mockNuxtImport("useLearnTopicTree", () => () => ({ groups: ref(tree.groups), status: ref(tree.status) }));

const LearnIndexPage = (await import("~/pages/learn/index.vue")).default;

beforeEach(() => {
  navigateTo.mockClear();
});

async function mountAt(groups: MockGroup[], status: string) {
  tree.groups = groups;
  tree.status = status;
  return mountSuspended(LearnIndexPage);
}

describe("pages/learn/index.vue", () => {
  it("redirects to the first topic once the tree has loaded", async () => {
    await mountAt([{ topics: [{ id: "accessible-name" }] }], "success");
    expect(navigateTo).toHaveBeenCalledWith("/learn/accessible-name", { replace: true });
  });

  it("falls back to / when the tree resolved but is empty", async () => {
    await mountAt([], "success");
    expect(navigateTo).toHaveBeenCalledWith("/", { replace: true });
  });

  it("falls back to / when the content query errored", async () => {
    await mountAt([], "error");
    expect(navigateTo).toHaveBeenCalledWith("/", { replace: true });
  });

  it("waits (no redirect) while the tree is still loading", async () => {
    await mountAt([], "pending");
    expect(navigateTo).not.toHaveBeenCalled();
  });
});
