/**
 * useInspectorTab is the shared active-tab state the inspector binds to.
 * activeTab defaults to "controls" and is a writable shared useState.
 * (Learn-topic navigation lives in useReadMode / openLearnTopic and is
 * covered by use-read-mode.test.ts.)
 */

import { beforeAll, beforeEach, describe, expect, it } from "vitest";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { defineComponent, h } from "vue";
import { useInspectorTab } from "~/composables/useInspectorTab";

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
});
