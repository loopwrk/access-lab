export function focusPreviewContent(
  iframe: HTMLIFrameElement | null | undefined,
): void {
  if (!iframe) return;

  const doc = iframe.contentDocument;
  if (!doc) {
    iframe.focus();
    return;
  }

  const mount = doc.getElementById("mount");
  // Standard focusable selector — covers buttons, links with href, form
  // fields, and anything with explicit positive tabindex.
  const firstFocusable = mount?.querySelector<HTMLElement>(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
  );
  if (firstFocusable) {
    firstFocusable.focus();
    return;
  }

  if (mount) {
    if (!mount.hasAttribute("tabindex")) {
      mount.setAttribute("tabindex", "-1");
    }
    mount.focus();
    return;
  }

  iframe.focus();
}
