/**
 * Tests for the three-engine audit aggregation: prop-based custom rules and
 * DOM-measurement rules are translated into the shared AxeResult shape, merged
 * with axe's own results, and bucketed into the critical / warning / passing
 * counts the toolbar shows.
 *
 * Key contracts: counts bucket serious+critical → critical and moderate+minor →
 * warning across ALL sources; passing is axe-only (custom/DOM rules don't
 * enumerate passes); custom rules REPLACE (not append) on re-evaluate; DOM rules
 * re-run on measurement change and clear when it goes null.
 *
 * Nuxt env: every composable here is backed by useState.
 */

import { beforeAll, beforeEach, describe, expect, it } from "vitest";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { defineComponent, h, nextTick } from "vue";
import type { ComputedRef, Ref } from "vue";
import { useCustomRules } from "~/composables/useCustomRules";
import { useDomRules } from "~/composables/useDomRules";
import {
  useAllViolations,
  useAxeCounts,
  useAxeResults,
  useDomMeasurement,
} from "~/composables/useAxeResults";
import type { DomMeasurement, DomRule, Rule } from "~/rules/types";
import type { AxeResult, AxeState, ImpactValue } from "~/types/axe";

const ruleSerious: Rule = {
  id: "custom-serious",
  title: "",
  wcag: "",
  description: "serious desc",
  help: "serious help",
  helpUrl: "https://s",
  tags: ["best-practice"],
  learnTopicId: "topic",
  evaluate: (p) => (p.fireSerious ? { severity: "serious", message: "serious msg" } : null),
};
const ruleModerate: Rule = {
  id: "custom-moderate",
  title: "",
  wcag: "",
  description: "",
  help: "",
  tags: [],
  evaluate: (p) => (p.fireModerate ? { severity: "moderate", message: "mod msg" } : null),
};
const ruleNever: Rule = {
  id: "custom-never",
  title: "",
  wcag: "",
  description: "",
  help: "",
  tags: [],
  evaluate: () => null,
};
const ruleSupersedable: Rule = {
  id: "custom-dup",
  title: "",
  wcag: "",
  description: "",
  help: "",
  tags: [],
  supersededByAxe: ["axe-dup"],
  evaluate: (p) => (p.fireDup ? { severity: "serious", message: "dup msg" } : null),
};
const domRuleCritical: DomRule = {
  id: "dom-crit",
  title: "",
  wcag: "",
  description: "",
  help: "",
  tags: [],
  evaluate: (m) => (m.scrollWidth > m.clientWidth ? { severity: "critical", message: "overflow" } : null),
};

const axeRes = (id: string, impact?: ImpactValue): AxeResult => ({
  id,
  description: "",
  help: "",
  helpUrl: "",
  impact,
  tags: [],
  nodes: [],
});

interface Api {
  custom: ReturnType<typeof useCustomRules>;
  axe: Ref<AxeState>;
  measurement: Ref<DomMeasurement | null>;
  allViolations: ComputedRef<AxeResult[]>;
  criticalCount: ComputedRef<number>;
  warningCount: ComputedRef<number>;
  passingCount: ComputedRef<number>;
}

let api: Api;

beforeAll(async () => {
  const Wrapper = defineComponent({
    setup() {
      const custom = useCustomRules([ruleSerious, ruleModerate, ruleNever, ruleSupersedable], "button");
      useDomRules([domRuleCritical]);
      const axe = useAxeResults();
      const measurement = useDomMeasurement();
      const { allViolations } = useAllViolations();
      const counts = useAxeCounts();
      api = { custom, axe, measurement, allViolations, ...counts };
      return () => h("div");
    },
  });
  await mountSuspended(Wrapper);
}, 60000);

beforeEach(async () => {
  api.axe.value.violations = [];
  api.axe.value.passes = [];
  api.custom.customViolations.value = [];
  api.measurement.value = null;
  await nextTick();
});

describe("useCustomRules", () => {
  it("translates only the firing rules into the shared AxeResult shape", () => {
    api.custom.evaluate({ fireSerious: true, fireModerate: true });
    expect(api.custom.customViolations.value.map((v) => v.id)).toEqual([
      "custom-serious",
      "custom-moderate",
    ]); // ruleNever produced nothing
    const serious = api.custom.customViolations.value.find((v) => v.id === "custom-serious")!;
    expect(serious.impact).toBe("serious");
    expect(serious.help).toBe("serious help");
    expect(serious.nodes[0]!.html).toBe("<button>"); // carries the real tag name
    expect(serious.nodes[0]!.target).toEqual(["button"]);
    expect(serious.nodes[0]!.none[0]!.message).toBe("serious msg");
  });

  it("replaces (does not append) previous violations on re-evaluate", () => {
    api.custom.evaluate({ fireSerious: true });
    expect(api.custom.customViolations.value.map((v) => v.id)).toEqual(["custom-serious"]);
    api.custom.evaluate({ fireModerate: true });
    expect(api.custom.customViolations.value.map((v) => v.id)).toEqual(["custom-moderate"]);
  });
});

describe("useAxeCounts", () => {
  it("buckets serious+critical as critical, moderate+minor as warning, across all sources", () => {
    api.axe.value.violations = [
      axeRes("a-crit", "critical"),
      axeRes("a-mod", "moderate"),
      axeRes("a-min", "minor"),
    ];
    api.axe.value.passes = [axeRes("p1"), axeRes("p2")];
    api.custom.evaluate({ fireSerious: true, fireModerate: true });
    expect(api.criticalCount.value).toBe(2); // axe critical + custom serious
    expect(api.warningCount.value).toBe(3); // axe moderate + axe minor + custom moderate
    expect(api.passingCount.value).toBe(2); // passes are axe-only
  });

  it("does not count null-impact violations as critical or warning", () => {
    api.axe.value.violations = [axeRes("no-impact", null)];
    expect(api.criticalCount.value).toBe(0);
    expect(api.warningCount.value).toBe(0);
  });
});

describe("useAllViolations + useDomRules", () => {
  it("merges axe, then custom, then dom violations in order", async () => {
    api.axe.value.violations = [axeRes("axe-1", "critical")];
    api.custom.evaluate({ fireSerious: true });
    api.measurement.value = { tagName: "div", scrollWidth: 200, clientWidth: 100, scrollHeight: 40, clientHeight: 40, targetWidth: 100, targetHeight: 40 };
    await nextTick();
    expect(api.allViolations.value.map((v) => v.id)).toEqual(["axe-1", "custom-serious", "dom-crit"]);
  });

  it("dom rules re-evaluate on measurement change and clear when it goes null", async () => {
    api.measurement.value = { tagName: "div", scrollWidth: 200, clientWidth: 100, scrollHeight: 40, clientHeight: 40, targetWidth: 100, targetHeight: 40 };
    await nextTick();
    expect(api.allViolations.value.some((v) => v.id === "dom-crit")).toBe(true);
    expect(api.criticalCount.value).toBe(1);
    api.measurement.value = null;
    await nextTick();
    expect(api.allViolations.value.some((v) => v.id === "dom-crit")).toBe(false);
    expect(api.criticalCount.value).toBe(0);
  });
});

describe("axe-wins suppression (supersededByAxe)", () => {
  it("drops a custom violation and stops counting it when its superseding axe rule is present", async () => {
    api.axe.value.violations = [axeRes("axe-dup", "critical")];
    api.custom.evaluate({ fireDup: true });
    await nextTick();
    // custom-dup declares supersededByAxe: ["axe-dup"]; axe reported axe-dup,
    // so axe wins — the custom duplicate is neither listed nor counted, so one
    // mistake is one critical, not two.
    expect(api.allViolations.value.map((v) => v.id)).toEqual(["axe-dup"]);
    expect(api.criticalCount.value).toBe(1);
  });

  it("keeps the custom violation when axe has not reported the superseding rule (graceful fallback)", async () => {
    api.axe.value.violations = [];
    api.custom.evaluate({ fireDup: true });
    await nextTick();
    // axe is silent here (e.g. it errored or hasn't run), so the custom rule
    // still provides coverage rather than the issue going unreported.
    expect(api.allViolations.value.map((v) => v.id)).toEqual(["custom-dup"]);
    expect(api.criticalCount.value).toBe(1);
  });
});
