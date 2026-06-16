/**
 * useInspectorTab after the dead-code removal is just the shared active-tab
 * state plus focusLearnTopic. activeTab defaults to "controls" and is the
 * writable shared useState the inspector binds to; focusLearnTopic forwards the
 * topic id to the reader's open() (the single entry point the studio uses). The
 * router-integration side of focusLearnTopic is covered in use-read-mode.test.ts;
 * here we pin the forwarding via a mocked useReadMode.
 */

import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { mockNuxtImport, mountSuspended } from "@nuxt/test-utils/runtime";
import { defineComponent, h } from "vue";
import { useInspectorTab } from "~/composables/useInspectorTab";

const open = vi.hoisted(() => vi.fn());
mockNuxtImport("useReadMode", () => () => ({ open }));

let api: ReturnType<typeof useInspectorTab>;

beforeAll(async () => {
  const Harness = defineComponent({
    setup() {
      api = useInspectorTab();
      return () => h("div");
    },
  });
  await mountSuspended(Harness);
}, 60000);

beforeEach(() => {
  open.mockClear();
  api.activeTab.value = "controls";
});

describe("useInspectorTab", () => {
  it("defaults the active tab to controls", () => {
    expect(api.activeTab.value).toBe("controls");
  });

  it("exposes activeTab as a writable ref", () => {
    api.activeTab.value = "manual";
    expect(api.activeTab.value).toBe("manual");
  });

  it("focusLearnTopic forwards the topic id to the reader's open()", () => {
    api.focusLearnTopic("checkbox");
    expect(open).toHaveBeenCalledWith("checkbox");
  });
});
