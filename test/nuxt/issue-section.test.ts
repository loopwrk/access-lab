/**
 * IssueSection's open-state contract is the whole point of this file. It is a
 * CONTROLLED collapsible (`:open` + `@update:open`, not v-model / default-open)
 * because axe results arrive after mount — `default-open` only fires at mount
 * and would miss them. Two behaviours have to hold together:
 *
 *   - auto-expand the first time a violation arrives (the immediate watch), so
 *     the user sees what failed without clicking;
 *   - but once the user has toggled the section, their choice wins forever —
 *     a manual collapse must STAY collapsed even as new violations land.
 *
 * The passing section opts out of auto-expand entirely (isPass), staying closed
 * so the panel keeps attention on what needs fixing.
 *
 * Nuxt env: IssueSection uses useI18n + useInspectorTab and mounts a Reka
 * collapsible, so only a live mount exercises the open-state honestly.
 */

import { afterEach, describe, expect, it } from "vitest";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { defineComponent, nextTick, ref } from "vue";
import IssueSection from "~/components/IssueSection.vue";
import type { AxeResult, ImpactValue } from "~/types/axe";

let wrapper: { unmount: () => void } | null = null;
afterEach(() => {
  wrapper?.unmount();
  wrapper = null;
});

function violation(id: string, impact: ImpactValue = "critical"): AxeResult {
  return {
    id,
    description: `${id} description`,
    help: `${id} help`,
    helpUrl: "https://example.com",
    impact,
    tags: ["wcag2a"],
    nodes: [],
  };
}

function makeWrapper(opts: { violations: AxeResult[]; isPass?: boolean }) {
  const violations = ref<AxeResult[]>(opts.violations);
  const isPass = opts.isPass ?? false;
  const Wrapper = defineComponent({
    components: { IssueSection },
    setup() {
      return { violations, isPass };
    },
    template: `<IssueSection
      color="error"
      label="Critical"
      empty-message="Nothing here"
      :violations="violations"
      :is-pass="isPass"
    />`,
  });
  return { violations, Wrapper };
}

async function flush() {
  await nextTick();
  await nextTick();
}

// The section's own trigger is the first button; Reka stamps its open state on
// `aria-expanded`. Content (the issue cards) is only mounted while open, so its
// presence is a second, independent signal.
function sectionExpanded(w: { findAll: (s: string) => Array<{ attributes: (a: string) => string | undefined }> }) {
  return w.findAll("button")[0]?.attributes("aria-expanded");
}

describe("IssueSection — auto-expand and manual-collapse", () => {
  it("starts closed and reveals no cards when there are no violations", async () => {
    const { Wrapper } = makeWrapper({ violations: [] });
    const w = await mountSuspended(Wrapper);
    wrapper = w;
    await flush();
    expect(sectionExpanded(w)).toBe("false");
    expect(w.find(".issue-card").exists()).toBe(false);
  });

  it("auto-expands on mount when a violation is already present (immediate watch)", async () => {
    const { Wrapper } = makeWrapper({ violations: [violation("target-size")] });
    const w = await mountSuspended(Wrapper);
    wrapper = w;
    await flush();
    expect(sectionExpanded(w)).toBe("true");
    expect(w.find(".issue-card").exists()).toBe(true);
  });

  it("auto-expands when the first violation arrives after mount", async () => {
    const { violations, Wrapper } = makeWrapper({ violations: [] });
    const w = await mountSuspended(Wrapper);
    wrapper = w;
    await flush();
    expect(sectionExpanded(w)).toBe("false");

    violations.value = [violation("target-size")];
    await flush();
    expect(sectionExpanded(w)).toBe("true");
  });

  it("keeps a manually-collapsed section closed when new violations arrive", async () => {
    const { violations, Wrapper } = makeWrapper({ violations: [violation("v1")] });
    const w = await mountSuspended(Wrapper);
    wrapper = w;
    await flush();
    expect(sectionExpanded(w)).toBe("true"); // auto-opened on the first violation

    await w.findAll("button")[0]!.trigger("click"); // user collapses it
    await flush();
    expect(sectionExpanded(w)).toBe("false");

    violations.value = [violation("v1"), violation("v2")]; // a new violation lands
    await flush();
    expect(sectionExpanded(w)).toBe("false"); // the manual choice still wins
  });

  it("does not auto-expand the passing section even when it has entries", async () => {
    const { Wrapper } = makeWrapper({ violations: [violation("p1")], isPass: true });
    const w = await mountSuspended(Wrapper);
    wrapper = w;
    await flush();
    expect(sectionExpanded(w)).toBe("false");
    expect(w.find(".issue-card").exists()).toBe(false);
  });
});

// A single axe violation carries one node per failing element. The "how to fix"
// guidance is identical across them, so it must render ONCE (not once per node),
// with the breadth surfaced as an affected-element count instead. Regression
// guard for the "HOW TO FIX renders three times" bug.
describe("IssueSection — multi-node violations", () => {
  function labelViolation(nodeCount: number): AxeResult {
    const failureSummary = "Fix any of the following:\n  Element does not have a label";
    return {
      id: "label",
      description: "Ensure every form element has a label",
      help: "Form elements must have labels",
      helpUrl: "https://example.com",
      impact: "critical",
      tags: ["wcag2a"],
      nodes: Array.from({ length: nodeCount }, (_, i) => ({
        html: `<input id="f${i}">`,
        target: [`#f${i}`],
        any: [],
        all: [],
        none: [],
        failureSummary,
      })),
    };
  }

  it("reports the affected-element count in the card body", async () => {
    const { Wrapper } = makeWrapper({ violations: [labelViolation(3)] });
    const w = await mountSuspended(Wrapper);
    wrapper = w;
    await flush();
    expect(w.text()).toContain("3 elements affected");
  });

  it("renders the shared fix guidance once, not once per node", async () => {
    const { Wrapper } = makeWrapper({ violations: [labelViolation(3)] });
    const w = await mountSuspended(Wrapper);
    wrapper = w;
    await flush();

    const fixIt = w.findAll("button").find((b) => b.text().includes("how to fix"));
    expect(fixIt).toBeTruthy();
    await fixIt!.trigger("click");
    await flush();

    const occurrences = w.text().split("Element does not have a label").length - 1;
    expect(occurrences).toBe(1);
  });
});
