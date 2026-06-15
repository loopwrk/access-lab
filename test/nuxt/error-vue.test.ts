/**
 * error.vue's logic is the component-slug detection: it surfaces a "Component
 * \"x\" is not in the registry" line ONLY for a 404 under /components/, using the
 * last path segment, and shows the generic title for any non-404. The action
 * button clears the error and redirects to the default component.
 *
 * useError is mocked to set the status; the path is supplied to the mount via
 * mountSuspended's `route` option so error.vue's real useRoute reads it (each
 * mount starts its own route, so navigating a shared router beforehand wouldn't
 * reach it).
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { mockNuxtImport, mountSuspended } from "@nuxt/test-utils/runtime";
import { ref } from "vue";

const state = vi.hoisted(() => ({ error: null as { status: number } | null }));
const clearErrorSpy = vi.hoisted(() => vi.fn());

mockNuxtImport("useError", () => () => ref(state.error));
mockNuxtImport("clearError", () => clearErrorSpy);

const ErrorPage = (await import("~/error.vue")).default;

const STUBS = {
  NuxtLayout: { template: "<div><slot /></div>" },
  NuxtImg: true,
};

let page: Awaited<ReturnType<typeof mountSuspended>> | null = null;

beforeEach(() => {
  state.error = null;
  clearErrorSpy.mockClear();
});

afterEach(() => {
  page?.unmount();
  page = null;
});

async function mountAt(error: { status: number }, path: string) {
  state.error = error;
  const w = await mountSuspended(ErrorPage, { route: path, global: { stubs: STUBS } });
  page = w;
  return w;
}

describe("error.vue — component-slug detection", () => {
  it("shows the 404 title and the missing-component line for an unknown component", async () => {
    const w = await mountAt({ status: 404 }, "/components/sparkle");
    expect(w.text()).toContain("404: page not found");
    expect(w.text()).toContain("Component \"sparkle\" is not in the registry.");
  });

  it("uses the last path segment for a nested component route", async () => {
    const w = await mountAt({ status: 404 }, "/components/buttons/action-triggers");
    expect(w.text()).toContain("Component \"action-triggers\" is not in the registry.");
  });

  it("shows the 404 title but no missing-component line outside /components", async () => {
    const w = await mountAt({ status: 404 }, "/learn/something");
    expect(w.text()).toContain("404: page not found");
    expect(w.text()).not.toContain("is not in the registry");
  });

  it("shows the generic title and no missing-component line for a non-404 error", async () => {
    const w = await mountAt({ status: 500 }, "/components/sparkle");
    expect(w.text()).toContain("Something went wrong");
    expect(w.text()).not.toContain("is not in the registry");
  });

  it("clears the error and redirects to the default component on the action button", async () => {
    const w = await mountAt({ status: 404 }, "/components/sparkle");
    await w.find("button").trigger("click");
    expect(clearErrorSpy).toHaveBeenCalledWith({ redirect: "/components/buttons/action-triggers" });
  });
});
