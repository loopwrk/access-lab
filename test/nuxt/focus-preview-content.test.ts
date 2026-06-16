/**
 * focusPreviewContent moves focus into the preview iframe: the first focusable
 * element inside #mount, else the #mount itself (made programmatically focusable),
 * else the iframe element; and it focuses the iframe outright when there's no
 * contentDocument, and no-ops on a null iframe.
 *
 * The headline case is the fix: a DISABLED inspected element must be skipped (it
 * can't take focus) so focus falls through to #mount rather than no-op'ing.
 *
 * Pure DOM util — driven against the happy-dom document with a fake iframe whose
 * contentDocument points at it.
 */

import { beforeEach, describe, expect, it, vi } from "vitest";
import { focusPreviewContent } from "~/utils/focusPreviewContent";

function fakeIframe(contentDocument: Document | null = document) {
  const focus = vi.fn();
  return { iframe: { contentDocument, focus } as unknown as HTMLIFrameElement, focus };
}

beforeEach(() => {
  document.body.innerHTML = "";
  (document.activeElement as HTMLElement | null)?.blur?.();
});

describe("focusPreviewContent", () => {
  it("does nothing for a null/undefined iframe", () => {
    expect(() => focusPreviewContent(null)).not.toThrow();
    expect(() => focusPreviewContent(undefined)).not.toThrow();
  });

  it("focuses the iframe element when there is no contentDocument", () => {
    const { iframe, focus } = fakeIframe(null);
    focusPreviewContent(iframe);
    expect(focus).toHaveBeenCalled();
  });

  it("focuses the first focusable element inside #mount", () => {
    document.body.innerHTML = `<div id="mount"><button id="go">Go</button></div>`;
    focusPreviewContent(fakeIframe().iframe);
    expect(document.activeElement?.id).toBe("go");
  });

  it("skips a disabled control and falls through to focus #mount (the fix)", () => {
    document.body.innerHTML = `<div id="mount"><button disabled>X</button></div>`;
    focusPreviewContent(fakeIframe().iframe);
    const mount = document.getElementById("mount");
    expect(document.activeElement).toBe(mount);
    expect(mount?.getAttribute("tabindex")).toBe("-1");
  });

  it("makes an empty #mount programmatically focusable and focuses it", () => {
    document.body.innerHTML = `<div id="mount"><span>nothing focusable</span></div>`;
    focusPreviewContent(fakeIframe().iframe);
    const mount = document.getElementById("mount");
    expect(mount?.getAttribute("tabindex")).toBe("-1");
    expect(document.activeElement).toBe(mount);
  });

  it("focuses the iframe element when there is no #mount", () => {
    document.body.innerHTML = `<div>no mount here</div>`;
    const { iframe, focus } = fakeIframe();
    focusPreviewContent(iframe);
    expect(focus).toHaveBeenCalled();
  });
});
