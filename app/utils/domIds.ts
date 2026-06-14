import type { InspectorTab } from "~/composables/useInspectorTab";

export const INSPECTOR_PANEL_IDS: Record<InspectorTab, string> = {
  controls: "controls-panel",
  issues: "issues-panel",
  manual: "manual-panel",
  learn: "learn-panel",
};

// Dev-time guard. These ids double as teleport targets: ComponentStudio
// teleports each inspector panel into `#${id}` and AppInspector renders the
// matching element. Two panels sharing an id would make one teleport land on
// the other's node and silently render nothing - with no console error. Fail
// loudly at dev-server start instead of debugging a blank tab later. (CI also
// enforces this from the outside via test/unit/dom-ids.test.ts.)
if (import.meta.dev) {
  const ids = Object.values(INSPECTOR_PANEL_IDS);
  if (new Set(ids).size !== ids.length) {
    throw new Error(
      `Duplicate id in INSPECTOR_PANEL_IDS - inspector teleports would collide: ${ids.join(", ")}`,
    );
  }
}

/** The host-side id on the preview iframe element. */
export const PREVIEW_IFRAME_ID = "preview-iframe";
