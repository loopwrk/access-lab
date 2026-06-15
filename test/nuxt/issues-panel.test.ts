/**
 * IssuesPanel is thin by design — it composes three IssueSections and buckets
 * the merged violations into them. What's worth pinning is the bucketing
 * contract, which must agree with the toolbar counts (useAxeCounts):
 *
 *   - critical section  ← impact critical + serious
 *   - warnings section  ← impact moderate + minor
 *   - passing section   ← axe passes only, and flagged is-pass
 *
 * It reads the merged violations from useAllViolations (so axe-wins suppression
 * already applied) and passes from useAxeResults. We seed the shared axe state
 * and assert each child IssueSection receives the right slice.
 *
 * Nuxt env: everything here is useState-backed.
 */

import { beforeAll, beforeEach, describe, expect, it } from "vitest";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { defineComponent, h, nextTick } from "vue";
import type { Ref } from "vue";
import IssuesPanel from "~/components/IssuesPanel.vue";
import IssueSection from "~/components/IssueSection.vue";
import { useAxeResults } from "~/composables/useAxeResults";
import type { AxeResult, AxeState, ImpactValue } from "~/types/axe";

const res = (id: string, impact?: ImpactValue): AxeResult => ({
  id,
  description: "",
  help: "",
  helpUrl: "",
  impact,
  tags: [],
  nodes: [],
});

let axe: Ref<AxeState>;
let panel: Awaited<ReturnType<typeof mountSuspended>>;

beforeAll(async () => {
  // One persistent mount: a harness that both captures the shared axe state and
  // renders IssuesPanel, so reactive seeds flow straight into the child props.
  const Harness = defineComponent({
    setup() {
      axe = useAxeResults();
      return () => h(IssuesPanel);
    },
  });
  panel = await mountSuspended(Harness);
}, 60000);

beforeEach(async () => {
  axe.value.violations = [];
  axe.value.passes = [];
  await nextTick();
});

function sectionViolationIds() {
  return panel.findAllComponents(IssueSection).map((section: { props: (name: string) => unknown }) => {
    const violations = section.props("violations") as AxeResult[];
    return violations.map((v) => v.id);
  });
}

describe("IssuesPanel — composition + bucketing", () => {
  it("always renders exactly three sections, passing flagged is-pass", () => {
    const sections = panel.findAllComponents(IssueSection);
    expect(sections).toHaveLength(3);
    expect(sections[0]!.props("isPass")).toBeFalsy(); // critical
    expect(sections[1]!.props("isPass")).toBeFalsy(); // warnings
    expect(sections[2]!.props("isPass")).toBe(true); // passing
  });

  it("buckets critical+serious into critical, moderate+minor into warnings, passes into passing", async () => {
    axe.value.violations = [
      res("crit", "critical"),
      res("ser", "serious"),
      res("mod", "moderate"),
      res("min", "minor"),
    ];
    axe.value.passes = [res("p1"), res("p2")];
    await nextTick();

    expect(sectionViolationIds()).toEqual([
      ["crit", "ser"], // critical section
      ["mod", "min"], // warnings section
      ["p1", "p2"], // passing section
    ]);
  });

  it("leaves every section empty when there are no results", () => {
    expect(sectionViolationIds()).toEqual([[], [], []]);
  });
});
