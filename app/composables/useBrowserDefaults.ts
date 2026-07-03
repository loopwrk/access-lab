/**
 * Probe the browser's user-agent styling for a bare element, resolved in the
 * light color scheme to match the always-light preview iframe. One of three
 * sizing composables: useButtonStudioDefaults layers hardcoded fallbacks over
 * this probe, and useNaturalSize measures rendered intrinsic size through it.
 */
export function useBrowserDefaults(tagName: string) {
  const probedKey = `browser-defaults-${tagName}`;
  const defaults = useState<Record<string, string>>(probedKey, () => ({}));

  if (import.meta.client && Object.keys(defaults.value).length === 0) {
    const el = document.createElement(tagName);
    el.style.position = "absolute";
    el.style.visibility = "hidden";
    el.style.all = "revert";
    // Resolve UA system colours (e.g. a button's ButtonFace background) in the
    // light color-scheme, matching the always-light preview iframe. The probe
    // is appended to the host <body>, so without this it inherits the studio's
    // dark color-scheme in dark mode and reports a dark default (#6b6b6b) that
    // the rendered element never actually uses — only the host theme is dark,
    // the iframe is not.
    el.style.colorScheme = "light";
    el.textContent = "x";
    document.body.appendChild(el);

    const computed = window.getComputedStyle(el);

    // Explicitly pull ONLY the properties your control panel cares about
    const targetedProperties = [
      "padding-top",
      "padding-right",
      "padding-bottom",
      "padding-left",
      "font-size",
      "background-color",
      "color",
      "border-top-width",
      "border-top-style",
      "border-top-color",
      "width",
      "height",
    ];

    const probed: Record<string, string> = {};

    targetedProperties.forEach((prop) => {
      const value = computed.getPropertyValue(prop);
      // Convert kebab-case (padding-top) to camelCase (paddingTop) to match state keys
      const camelKey = prop.replace(/-([a-z])/g, (g) => g[1]!.toUpperCase());
      probed[camelKey] = value;
    });

    document.body.removeChild(el);
    defaults.value = probed;
  }

  /**
   * Measure the intrinsic (shrink-to-fit) width and height of the tag with the
   * given content and optional inline styles applied. Renders an off-screen
   * probe with `all: revert` so the host page's CSS doesn't pollute the result,
   * then layers the supplied cssText on top.
   *
   * Use this when you need the natural rendered size — e.g. when toggling a
   * width/height override on, you want the slider to start at whatever the
   * browser would have rendered before the override.
   */
  function measureIntrinsicSize(
    content: string,
    cssText: string = "",
    asHtml: boolean = false,
  ): { width: number; height: number } {
    if (!import.meta.client) return { width: 0, height: 0 };

    const el = document.createElement(tagName);
    el.style.cssText
      = `all: revert; color-scheme: light; position: absolute; visibility: hidden; left: -9999px; top: -9999px;`
        + (cssText ? ` ${cssText}` : "");

    if (asHtml) el.innerHTML = content;
    else el.textContent = content;

    document.body.appendChild(el);
    const rect = el.getBoundingClientRect();
    document.body.removeChild(el);

    return { width: Math.round(rect.width), height: Math.round(rect.height) };
  }

  return { defaults, measureIntrinsicSize };
}
