import type { InspectorTab } from "~/composables/useInspectorTab";

export const INSPECTOR_PANEL_IDS: Record<InspectorTab, string> = {
  controls: "controls-panel",
  issues: "issues-panel",
  manual: "manual-panel",
  learn: "learn-panel",
};

/** The host-side id on the preview iframe element. */
export const PREVIEW_IFRAME_ID = "preview-iframe";
