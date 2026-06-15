/**
 * useReadMode is the studio↔reader bridge. The load-bearing logic is the
 * return-path stash: opening a topic FROM the studio remembers where you were,
 * but only once — a topic-to-topic open inside the reader must not overwrite it
 * — and close() restores that path and clears the stash (falling back to "/"
 * when nothing was stashed). isOpen / activeTopicId derive from the route.
 *
 * useInspectorTab.focusLearnTopic is the single entry point the rest of the
 * studio calls (control labels, issues panel, toolbar); it forwards to open(),
 * so it must stash + navigate the same way.
 *
 * Driven through the real Nuxt router so the route-derived computeds are
 * exercised honestly. The composable's open/switchTopic/close fire navigation
 * without returning the promise, so we poll for the route to settle; the
 * returnPath stash itself is written synchronously inside open(), before the
 * push, so it can be asserted immediately.
 */

import { beforeAll, beforeEach, describe, expect, it } from "vitest";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { flushPromises } from "@vue/test-utils";
import { defineComponent, h } from "vue";
import { useRoute, useRouter, useState } from "#imports";
import { useReadMode } from "~/composables/useReadMode";
import { useInspectorTab } from "~/composables/useInspectorTab";

let api: {
  route: ReturnType<typeof useRoute>;
  router: ReturnType<typeof useRouter>;
  returnPath: { value: string | null };
  readMode: ReturnType<typeof useReadMode>;
  inspector: ReturnType<typeof useInspectorTab>;
};

beforeAll(async () => {
  const Harness = defineComponent({
    setup() {
      api = {
        route: useRoute(),
        router: useRouter(),
        returnPath: useState<string | null>("studio-return-path", () => null),
        readMode: useReadMode(),
        inspector: useInspectorTab(),
      };
      return () => h("div");
    },
  });
  await mountSuspended(Harness);
}, 60000);

const STUDIO_PATH = "/components/select";

// open/switchTopic/close don't return their router promise, so wait for the
// navigation (and its page lazy-load) to settle by polling the live route.
async function waitForPath(expected: string) {
  for (let i = 0; i < 50 && api.route.path !== expected; i++) {
    await new Promise((resolve) => setTimeout(resolve, 10));
  }
}

beforeEach(async () => {
  await api.router.push(STUDIO_PATH);
  await flushPromises();
  api.returnPath.value = null;
});

describe("useReadMode", () => {
  it("is closed in the studio and open in the reader, exposing the active topic id", async () => {
    expect(api.readMode.isOpen.value).toBe(false);
    expect(api.readMode.activeTopicId.value).toBe(null);

    await api.router.push("/learn/checkbox");
    await flushPromises();
    expect(api.readMode.isOpen.value).toBe(true);
    expect(api.readMode.activeTopicId.value).toBe("checkbox");
  });

  it("open() from the studio stashes the return path (synchronously), then navigates", async () => {
    api.readMode.open("radio");
    expect(api.returnPath.value).toBe(STUDIO_PATH); // written before the push
    await waitForPath("/learn/radio");
    expect(api.route.path).toBe("/learn/radio");
  });

  it("a second open() inside the reader does NOT overwrite the stashed return path", async () => {
    api.readMode.open("radio"); // from studio → stash STUDIO_PATH
    await waitForPath("/learn/radio");
    api.readMode.open("select"); // already in reader → must not re-stash
    await waitForPath("/learn/select");
    expect(api.route.path).toBe("/learn/select");
    expect(api.returnPath.value).toBe(STUDIO_PATH); // unchanged
  });

  it("switchTopic() replaces the topic without touching the stash", async () => {
    api.readMode.open("radio");
    await waitForPath("/learn/radio");
    const stashed = api.returnPath.value;
    api.readMode.switchTopic("checkbox");
    await waitForPath("/learn/checkbox");
    expect(api.route.path).toBe("/learn/checkbox");
    expect(api.returnPath.value).toBe(stashed);
  });

  it("close() restores the stashed studio path and clears the stash", async () => {
    api.readMode.open("radio");
    await waitForPath("/learn/radio");
    api.readMode.close();
    await waitForPath(STUDIO_PATH);
    expect(api.route.path).toBe(STUDIO_PATH);
    expect(api.returnPath.value).toBe(null);
  });

  it("close() with no stash falls back to the studio root", async () => {
    await api.router.push("/learn/checkbox"); // arrive without using open()
    await flushPromises();
    api.returnPath.value = null;
    api.readMode.close();
    await waitForPath("/");
    expect(api.route.path).toBe("/");
  });
});

describe("useInspectorTab.focusLearnTopic", () => {
  it("forwards to the reader: stashes the studio path and opens the topic", async () => {
    api.inspector.focusLearnTopic("vague-label");
    expect(api.returnPath.value).toBe(STUDIO_PATH);
    await waitForPath("/learn/vague-label");
    expect(api.route.path).toBe("/learn/vague-label");
  });
});
