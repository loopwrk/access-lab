/**
 * LearnPanel is the inspector's topic picker. Its own logic is the pinned
 * ordering: the active component's PRIMARY topic always takes the top spot,
 * then its curated related topics follow in declaration order, with the primary
 * deduped out of the related list and any unknown id skipped. Below the pinned
 * block it lists every category group. Clicking any topic opens it in the
 * reader (useReadMode().open).
 *
 * The topic data comes from Nuxt Content (useLearnTopics / useLearnTopicTree via
 * queryCollection), which doesn't run in happy-dom — so those are mocked with
 * controlled topics, and useReadMode().open is mocked to capture clicks. The
 * pinning inputs (primary + related ids) are real useStudioToolbar useState.
 */

import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { mockNuxtImport, mountSuspended } from "@nuxt/test-utils/runtime";
import { defineComponent, h, ref } from "vue";
import LearnPanel from "~/components/LearnPanel.vue";
import { useStudioToolbar } from "~/composables/useStudioToolbar";

interface MockTopic {
  id: string;
  title: string;
  summary: string;
}
interface MockGroup {
  category: { id: string; titleKey: string };
  topics: MockTopic[];
}

const mocks = vi.hoisted(() => ({
  topics: [] as MockTopic[],
  groups: [] as MockGroup[],
  openCalls: [] as string[],
}));

mockNuxtImport("useLearnTopics", () => () => ({ topics: ref(mocks.topics) }));
mockNuxtImport("useLearnTopicTree", () => () => ({ groups: ref(mocks.groups) }));
mockNuxtImport("useReadMode", () => () => ({
  open: (id: string) => {
    mocks.openCalls.push(id);
  },
}));

const TOPICS: MockTopic[] = [
  { id: "a", title: "Alpha", summary: "" },
  { id: "b", title: "Bravo", summary: "" },
  { id: "c", title: "Charlie", summary: "" },
  { id: "d", title: "Delta", summary: "" },
];

let toolbar: ReturnType<typeof useStudioToolbar>;
let panel: Awaited<ReturnType<typeof mountSuspended>> | null = null;

beforeAll(async () => {
  const Capture = defineComponent({
    setup() {
      toolbar = useStudioToolbar();
      return () => h("div");
    },
  });
  await mountSuspended(Capture);
}, 60000);

beforeEach(() => {
  mocks.topics = [];
  mocks.groups = [];
  mocks.openCalls = [];
  toolbar.activeComponentName.value = null;
  toolbar.activeLearnTopicId.value = null;
  toolbar.activeRelatedLearnTopicIds.value = [];
});

afterEach(() => {
  panel?.unmount();
  panel = null;
});

// Titles in document order within a given <section> (summaries are blank, so a
// topic button's text is just its title).
function titlesIn(section: { findAll: (s: string) => Array<{ text: () => string }> }) {
  return section.findAll("button").map((b) => b.text().trim());
}

describe("LearnPanel — pinned ordering", () => {
  it("puts the primary first, then related in declaration order, deduping the primary and skipping unknown ids", async () => {
    mocks.topics = TOPICS;
    toolbar.activeLearnTopicId.value = "c"; // primary
    toolbar.activeRelatedLearnTopicIds.value = ["a", "c", "b", "zzz"]; // c=primary (dedup), zzz=unknown (skip)
    const w = await mountSuspended(LearnPanel);
    panel = w;

    const sections = w.findAll("section");
    expect(sections).toHaveLength(1); // pinned only (no groups supplied)
    expect(titlesIn(sections[0]!)).toEqual(["Charlie", "Alpha", "Bravo"]);
  });

  it("renders no pinned section when the component has no primary or related topics", async () => {
    mocks.topics = TOPICS;
    mocks.groups = [{ category: { id: "forms", titleKey: "learn.categories.forms" }, topics: [TOPICS[0]!] }];
    // no primary, no related
    const w = await mountSuspended(LearnPanel);
    panel = w;

    const sections = w.findAll("section");
    expect(sections).toHaveLength(1); // the category group only — no pinned block
    expect(titlesIn(sections[0]!)).toEqual(["Alpha"]);
  });
});

describe("LearnPanel — categorised groups + open", () => {
  it("lists each category group's topics below the pinned block", async () => {
    mocks.topics = TOPICS;
    toolbar.activeLearnTopicId.value = "a"; // a pinned block exists
    mocks.groups = [
      { category: { id: "forms", titleKey: "learn.categories.forms" }, topics: [TOPICS[0]!, TOPICS[1]!] },
      { category: { id: "naming", titleKey: "learn.categories.naming" }, topics: [TOPICS[2]!] },
    ];
    const w = await mountSuspended(LearnPanel);
    panel = w;

    const sections = w.findAll("section");
    expect(sections).toHaveLength(3); // pinned + 2 groups
    expect(titlesIn(sections[1]!)).toEqual(["Alpha", "Bravo"]);
    expect(titlesIn(sections[2]!)).toEqual(["Charlie"]);
  });

  it("opens a topic in the reader when its card is clicked", async () => {
    mocks.topics = TOPICS;
    toolbar.activeLearnTopicId.value = "c";
    const w = await mountSuspended(LearnPanel);
    panel = w;

    await w.findAll("section")[0]!.findAll("button")[0]!.trigger("click");
    expect(mocks.openCalls).toEqual(["c"]); // the pinned primary
  });
});
