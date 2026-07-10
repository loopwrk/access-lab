import type { SpacingSides } from "~/composables/useButtonStudioDefaults";

function trimmed(px: number): number {
  return Number(px.toFixed(2));
}

/** Readout style with a space, matching the value inputs: `"124 px"`. */
export function formatPxReadout(px: number): string {
  return `${trimmed(px)} px`;
}

/** CSS serialisation of one side for four-value fact lines: `"6px"`. */
export function formatSideCss(px: number): string {
  return `${trimmed(px)}px`;
}

/** All four sides in CSS top/right/bottom/left order: `"1px 6px 1px 6px"`. */
export function formatSidesCssText(sides: SpacingSides): string {
  return [sides.top, sides.right, sides.bottom, sides.left].map(formatSideCss).join(" ");
}

export function sidesUniform(sides: SpacingSides): boolean {
  return (
    sides.top === sides.right && sides.top === sides.bottom && sides.top === sides.left
  );
}
