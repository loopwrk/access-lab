/**
 * The three studio entry pages resolve a route param to a component definition:
 *   - index.vue redirects `/` to the default component;
 *   - components/[component].vue maps the slug → getDefinition, redirects the
 *     legacy `button` slug, and 404s an unknown one;
 *   - components/buttons/[pattern].vue maps the pattern → `buttons-<pattern>` and
 *     404s an unknown one.
 *
 * navigateTo is mocked to capture redirects; the real getDefinition + createError
 * run (so we exercise the actual registry + 404), and ComponentStudio is stubbed
 * (it mounts an iframe + teleports we don't need here). The route param is set
 * via mountSuspended's `route` option.
 */

import { beforeEach, describe, expect, it, vi } from "vitest";
import { mockNuxtImport, mountSuspended } from "@nuxt/test-utils/runtime";

const navigateTo = vi.hoisted(() => vi.fn());
// mountSuspended catches a setup `throw` (Suspense boundary) rather than
// rejecting, so we capture the createError call instead of the rejection.
const createError = vi.hoisted(() => vi.fn((opts) => Object.assign(new Error("nuxt-error"), opts)));
mockNuxtImport("navigateTo", () => navigateTo);
mockNuxtImport("createError", () => createError);

const IndexPage = (await import("~/pages/index.vue")).default;
const ComponentPage = (await import("~/pages/components/[component].vue")).default;
const PatternPage = (await import("~/pages/components/buttons/[pattern].vue")).default;

const STUBS = { ComponentStudio: { template: "<div class=\"studio-stub\" />" } };

beforeEach(() => {
  navigateTo.mockClear();
  createError.mockClear();
});

describe("pages/index.vue", () => {
  it("redirects to the default component", async () => {
    await mountSuspended(IndexPage);
    expect(navigateTo).toHaveBeenCalledWith("/components/buttons/action-triggers", { replace: true });
  });
});

describe("pages/components/[component].vue", () => {
  it("renders the studio for a real component slug", async () => {
    const w = await mountSuspended(ComponentPage, { route: "/components/input", global: { stubs: STUBS } });
    expect(w.find(".studio-stub").exists()).toBe(true);
  });

  it("redirects the legacy 'button' slug to action-triggers", async () => {
    await mountSuspended(ComponentPage, { route: "/components/button", global: { stubs: STUBS } });
    expect(navigateTo).toHaveBeenCalledWith("/components/buttons/action-triggers", { replace: true });
  });

  it("raises a 404 for an unknown component slug", async () => {
    await expect(
      mountSuspended(ComponentPage, { route: "/components/sparkle", global: { stubs: STUBS } }),
    ).rejects.toMatchObject({ statusCode: 404 });
  });
});

describe("pages/components/buttons/[pattern].vue", () => {
  it("renders the studio for a real button pattern", async () => {
    const w = await mountSuspended(PatternPage, {
      route: "/components/buttons/action-triggers",
      global: { stubs: STUBS },
    });
    expect(w.find(".studio-stub").exists()).toBe(true);
  });

  it("raises a 404 for an unknown button pattern", async () => {
    await expect(
      mountSuspended(PatternPage, { route: "/components/buttons/nope", global: { stubs: STUBS } }),
    ).rejects.toMatchObject({ statusCode: 404 });
  });
});
