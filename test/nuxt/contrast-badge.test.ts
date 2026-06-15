/**
 * Component test for ContrastBadge — the studio's visible contrast verdict.
 *
 * Two contracts matter here. (1) The ratio is shown to two decimal places,
 * pairing with the 2-dp value the verdict is computed from (see the
 * round-then-compare fix in use-contrast). (2) Each verdict maps to a distinct
 * TEXT label. The badge's icon is `aria-hidden="true"` — decorative — so the
 * label is the app's non-colour-only accessibility cue and the thing worth
 * pinning; it must be correct for every verdict, including the "passes only for
 * large text" warning state.
 *
 * Nuxt env: the badge uses useI18n + Nuxt UI (UBadge/UIcon), so it needs a real
 * mount.
 */

import { describe, expect, it } from "vitest";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import ContrastBadge from "~/components/ContrastBadge.vue";
import type { ContrastVerdict } from "~/composables/useContrast";

const mountBadge = (ratio: number, verdict: ContrastVerdict) =>
  mountSuspended(ContrastBadge, { props: { ratio, verdict } });

describe("ContrastBadge", () => {
  it("displays the ratio to two decimal places", async () => {
    expect((await mountBadge(4.5, "AA")).text()).toContain("4.50:1");
    expect((await mountBadge(21, "AAA")).text()).toContain("21.00:1");
  });

  it.each([
    ["AAA", "AAA"],
    ["AA", "AA"],
    ["AALarge", "AA (large text only)"],
    ["Fail", "Fails"],
  ] as const)("maps the %s verdict to its text label", async (verdict, label) => {
    expect((await mountBadge(4.5, verdict)).text()).toContain(label);
  });
});
