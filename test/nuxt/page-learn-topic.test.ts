/**
 * learn/[topicId].vue renders one of three states off the useAsyncData result:
 * a loading spinner while pending, a "not available" message when the topic
 * resolves to nothing, and the article (frontmatter title as <h1> + the markdown
 * body) when it resolves.
 *
 * useAsyncData (Nuxt Content) is mocked to drive data + status; ContentRenderer
 * is stubbed (it needs the Content runtime). The topicId comes from the route.
 */

import { describe, expect, it, vi } from "vitest";
import { mockNuxtImport, mountSuspended } from "@nuxt/test-utils/runtime";
import { ref } from "vue";

interface MockDoc {
  title?: string;
  body?: unknown;
}

const asyncData = vi.hoisted(() => ({ data: null as MockDoc | null, status: "pending" as string }));

mockNuxtImport("useAsyncData", () => () => ({ data: ref(asyncData.data), status: ref(asyncData.status) }));

const TopicPage = (await import("~/pages/learn/[topicId].vue")).default;

const STUBS = { ContentRenderer: { template: "<div class=\"content-stub\" />" } };

async function mountTopic(data: MockDoc | null, status: string, route = "/learn/checkbox") {
  asyncData.data = data;
  asyncData.status = status;
  return mountSuspended(TopicPage, { route, global: { stubs: STUBS } });
}

describe("pages/learn/[topicId].vue", () => {
  it("shows the loading state while pending", async () => {
    const w = await mountTopic(null, "pending");
    expect(w.text()).toContain("Loading content");
    expect(w.find("article").exists()).toBe(false);
  });

  it("shows the not-found state when the topic resolves to nothing", async () => {
    const w = await mountTopic(null, "success");
    expect(w.text()).toContain("not available in reader view");
    expect(w.find("article").exists()).toBe(false);
  });

  it("renders the article with the frontmatter title when the topic resolves", async () => {
    const w = await mountTopic({ title: "Checkbox", body: {} }, "success");
    expect(w.find("article").exists()).toBe(true);
    expect(w.find("h1").text()).toBe("Checkbox");
    expect(w.find(".content-stub").exists()).toBe(true);
  });
});
