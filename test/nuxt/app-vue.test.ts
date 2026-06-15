/**
 * app.vue has no logic beyond declaring the document head — but that head is
 * worth one guard: the SEO meta must resolve to TRANSLATED values, not raw i18n
 * keys or (the real regression that shipped once) the literal string
 * `t("app.title")`. We mock useHead / useSeoMeta to capture exactly what the
 * component hands them, and assert lang=en plus translated title/description.
 */

import { describe, expect, it, vi } from "vitest";
import { mockNuxtImport, mountSuspended } from "@nuxt/test-utils/runtime";

interface HeadInput {
  htmlAttrs?: { lang?: string };
}
interface SeoInput {
  title?: string;
  description?: string;
  ogTitle?: string;
  ogDescription?: string;
  twitterCard?: string;
}

const headCalls = vi.hoisted(() => [] as HeadInput[]);
const seoCalls = vi.hoisted(() => [] as SeoInput[]);

mockNuxtImport("useHead", () => (arg: HeadInput) => {
  headCalls.push(arg);
});
mockNuxtImport("useSeoMeta", () => (arg: SeoInput) => {
  seoCalls.push(arg);
});

// Imported after the mocks are registered.
const AppRoot = (await import("~/app.vue")).default;

const STUBS = {
  UApp: { template: "<div><slot /></div>" },
  NuxtLayout: { template: "<div><slot /></div>" },
  NuxtPage: true,
};

describe("app.vue — document head", () => {
  it("sets lang=en and translated SEO meta (guards the t(...)-as-literal regression)", async () => {
    await mountSuspended(AppRoot, { global: { stubs: STUBS } });

    const head = headCalls.find((h) => h.htmlAttrs?.lang);
    expect(head?.htmlAttrs?.lang).toBe("en");

    const seo = seoCalls.find((s) => s.title);
    expect(seo?.title).toBe("AccessLab");
    // The regression: ogTitle must be the translated value, not the raw key
    // and not the literal "t(\"app.title\")" string.
    expect(seo?.ogTitle).toBe("AccessLab");
    expect(seo?.ogTitle).not.toContain("app.title");
    expect(seo?.description).toContain("accessibility laboratory");
    expect(seo?.ogDescription).toBe(seo?.description);
    expect(seo?.twitterCard).toBe("summary_large_image");
  });
});
