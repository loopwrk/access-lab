/**
 * The inspector panel ids are a contract shared with the DOM: AppInspector
 * renders teleport-target elements carrying these ids, and ComponentStudio
 * teleports its controls / issues / manual / learn panels into `#${id}`. If an
 * id drifts, or two panels collide on the same id, the teleport silently fails
 * and an inspector tab renders empty — with no error in the console. These
 * tests pin the strings and guard the uniqueness + selector-safety the
 * teleports rely on.
 */

import { describe, expect, it } from "vitest";
import { INSPECTOR_PANEL_IDS, PREVIEW_IFRAME_ID, UTILITY_RESET_CELL_ID } from "../../app/utils/domIds";

describe("INSPECTOR_PANEL_IDS", () => {
  it("maps each inspector tab to its expected id", () => {
    expect(INSPECTOR_PANEL_IDS).toEqual({
      controls: "controls-panel",
      issues: "issues-panel",
      manual: "manual-panel",
      learn: "learn-panel",
    });
  });

  it("has a unique id per panel (a collision would break a teleport)", () => {
    const ids = Object.values(INSPECTOR_PANEL_IDS);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("uses ids that are safe to drop straight into an id selector", () => {
    const all = [...Object.values(INSPECTOR_PANEL_IDS), PREVIEW_IFRAME_ID, UTILITY_RESET_CELL_ID];
    for (const id of all) {
      expect(id).toMatch(/^[a-z][a-z0-9-]*$/);
    }
  });
});

describe("PREVIEW_IFRAME_ID", () => {
  it("is the host-side preview iframe id", () => {
    expect(PREVIEW_IFRAME_ID).toBe("preview-iframe");
  });
});

describe("UTILITY_RESET_CELL_ID", () => {
  it("is the reset control's teleport target in the utility row", () => {
    expect(UTILITY_RESET_CELL_ID).toBe("controls-utility-reset");
  });
});
