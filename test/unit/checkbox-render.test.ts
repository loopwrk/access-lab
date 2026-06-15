/**
 * Deepens the checkbox render coverage beyond the single baseline cases in
 * form-input-renderers.test.ts — the group-no-fieldset anti-pattern, the div
 * variant's name-from-content / none / mixed states, and the fixed "Options"
 * group legend. The markup is load-bearing (axe audits it, the rules reason
 * about it, the code drawer shows it), so this pins it.
 *
 * Pure function → node unit env.
 */

import { describe, expect, it } from "vitest";
import { renderCheckbox } from "../../app/components/inspected/checkbox/render";

describe("renderCheckbox — group-no-fieldset (the anti-pattern)", () => {
  it("renders a plain <p> heading and bare rows, with NO surrounding fieldset", () => {
    const { html } = renderCheckbox({
      label: "Notifications",
      groupMode: "group-no-fieldset",
      groupItems: ["Updates", "Promotions"],
    });
    expect(html).not.toContain("<fieldset");
    expect(html.startsWith('<p style="font-weight: 600; margin: 0 0 0.4em;">Notifications</p>')).toBe(
      true,
    );
    // each option still renders as an inspected child row
    expect(html).toContain('id="al-checkbox-0"');
    expect(html).toContain('data-al-child-index="1"');
    expect(html).toContain('<label for="al-checkbox-1">Promotions</label>');
  });

  it("contrasts with group-with-fieldset, which DOES wrap in a fieldset + legend", () => {
    const { html } = renderCheckbox({
      label: "Notifications",
      groupMode: "group-with-fieldset",
      groupItems: ["Updates"],
    });
    expect(html.startsWith("<fieldset><legend>Notifications</legend>")).toBe(true);
  });
});

describe("renderCheckbox — div variant naming modes", () => {
  it("name-from-content (wrapping): the label is the div's text content", () => {
    const { html } = renderCheckbox({
      label: "Subscribe",
      renderAs: "div-checkbox",
      labelAssociation: "wrapping",
    });
    expect(html).toBe(
      '<div class="al-div-checkbox al-inspected-element" role="checkbox" tabindex="0"' +
        ' aria-checked="false">Subscribe</div>',
    );
  });

  it("none: a div with role=checkbox and no accessible name at all (anti-pattern)", () => {
    const { html } = renderCheckbox({
      label: "Subscribe",
      renderAs: "div-checkbox",
      labelAssociation: "none",
    });
    expect(html).toBe(
      '<div class="al-div-checkbox al-inspected-element" role="checkbox" tabindex="0"' +
        ' aria-checked="false"></div>',
    );
  });

  it("expresses the partial state as aria-checked=\"mixed\" (not a checked+indeterminate clash)", () => {
    const { html } = renderCheckbox({
      label: "Subscribe",
      renderAs: "div-checkbox",
      indeterminate: true,
    });
    expect(html).toContain('aria-checked="mixed"');
  });
});

describe("renderCheckbox — parent-with-children legend", () => {
  it("uses a fixed \"Options\" legend, independent of the value attribute", () => {
    const { html } = renderCheckbox({
      label: "Select all",
      groupMode: "parent-with-children",
      groupItems: ["A", "B"],
      value: "subscribe", // must NOT leak into the group legend
    });
    expect(html).toContain("<fieldset><legend>Options</legend>");
    expect(html).not.toContain("<legend>subscribe</legend>");
  });
});
