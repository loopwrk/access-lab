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
  // fields, and anything with explicit positive tabindex. Excludes disabled
  // controls and hidden inputs, which match the tag selectors but can't take
  // focus — so a disabled inspected element falls through to the mount below
  // rather than no-op'ing focus() and leaving the user where they were.
  const firstFocusable = mount?.querySelector<HTMLElement>(
    "button:not([disabled]), [href], input:not([disabled]):not([type=\"hidden\"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex=\"-1\"])",
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
