/**
 * Why byte-exact assertions rather than "contains": the string this renderer
 * returns is the artefact the whole app is built around. It is injected
 * verbatim into the preview iframe (so axe-core audits exactly these bytes),
 * shown verbatim in the code drawer (so the student copies exactly these
 * bytes), and fed to the prop-based rules. A refactor that changes a single
 * character changes what is taught and what is audited — so these pin output.
 *
 * The teaching spine of the action-trigger component is the `<button>` vs
 * `<button type="button">` distinction, so that is pinned first and hardest.
 *
 * Pure function → node unit env (matches button-render-escaping.test.ts).
 * Label escaping has its own focused file (button-render-escaping.test.ts);
 * it is only touched lightly here.
 */

import { describe, expect, it } from "vitest";
import { renderButton } from "../../app/components/inspected/buttons/shared/render";

describe("renderButton — element + type selection (the action-trigger lesson)", () => {
  it("omits the type attribute for the bare `button` variant (defaults to submit — the 'avoid' case)", () => {
    // The lone space after `button` is the empty attribute slot; the teaching
    // point is the ABSENCE of a type attribute. A type-less <button> defaults
    // to type="submit", which is the accidental-submit risk this variant
    // exists to demonstrate (see the button-types Learn topic).
    expect(renderButton({ renderAs: "button", label: "Go" }).html).toBe("<button >Go</button>");
  });

  it('emits type="button" for the recommended `button-button` variant', () => {
    expect(renderButton({ renderAs: "button-button", label: "Go" }).html).toBe(
      '<button type="button">Go</button>',
    );
  });

  it("returns a clean bare <button> with the default label when called with no props", () => {
    // The undefined-props guard returns a tidier string than renderButton({})
    // would (no empty attribute slot). Pin it so the guard isn't removed as
    // "redundant" — the studio renders this on first paint before any model.
    expect(renderButton().html).toBe("<button>Button Label</button>");
  });
});

describe("renderButton — where the accessible name comes from", () => {
  it("routes the visible label through HTML escaping (it is text content shown literally)", () => {
    expect(renderButton({ renderAs: "button-button", label: "<b>Go</b>" }).html).toContain(
      "&lt;b&gt;Go&lt;/b&gt;",
    );
  });

  it("renders a decorative (aria-hidden) icon instead of text for icon content", () => {
    // The glyph is aria-hidden, so it contributes no accessible name — an icon
    // button MUST be named by aria-label. That dependency is exactly what the
    // button-aria-label-without-visible-content rule polices, so the markup
    // and the rule have to agree on what "icon content" looks like.
    expect(
      renderButton({ renderAs: "button-button", contentType: "icon", ariaLabel: "Search" }).html,
    ).toBe(
      '<button type="button" aria-label="Search"><span aria-hidden="true">&#128269;</span></button>',
    );
  });

  it("emits aria-label only when set, and escapes its quotes (attribute context)", () => {
    expect(
      renderButton({ renderAs: "button-button", label: "Go", ariaLabel: 'Find "x"' }).html,
    ).toBe('<button type="button" aria-label="Find &quot;x&quot;">Go</button>');
  });
});

describe("renderButton — form-data + state attributes", () => {
  it("emits name and value when set (the multi-submit pattern)", () => {
    expect(
      renderButton({ renderAs: "button-button", label: "Save", name: "action", value: "draft" })
        .html,
    ).toBe('<button type="button" name="action" value="draft">Save</button>');
  });

  it("emits a bare disabled attribute (no value)", () => {
    expect(renderButton({ renderAs: "button-button", label: "Go", disabled: true }).html).toBe(
      '<button type="button" disabled>Go</button>',
    );
  });
});

describe("renderButton — clean semantic markup by default (no studio scaffolding leaks)", () => {
  it("adds no class, handler, or <style> to a plain action trigger", () => {
    // AGENTS.md: inspected components emit pure semantic markup with no inline
    // handlers. The al-inspected-element marker (which gates the iframe
    // click-bridge and studio CSS) must appear ONLY when a feature needs it,
    // never by default — otherwise the student copies studio-internal noise
    // out of the code drawer and learns the wrong baseline.
    const fragment = renderButton({ renderAs: "button-button", label: "Go" });
    expect(fragment.html).toBe('<button type="button">Go</button>');
    expect(fragment.html).not.toContain("al-inspected-element");
    expect(fragment.html).not.toContain("onclick");
    expect(fragment.css).toBeUndefined();
  });
});

describe("renderButton — the focus-ring override (the lesson the focus rules grade)", () => {
  it("injects a :focus-visible rule and tags the element so the iframe can target it", () => {
    const { html, css } = renderButton({
      renderAs: "button-button",
      label: "Go",
      focusRingEnabled: true,
      focusRingWidth: { value: 2, unit: "px" },
      focusRingColor: "#1d4ed8",
      focusRingOffset: { value: 2, unit: "px" },
    });
    // The override is expressed as real CSS in a separate pane, and the element
    // gains the inspected class purely so the rule's `:focus-visible` selector
    // has something to bind to. Both halves are pinned because the focus rules
    // (focus-not-visible / focus-low-contrast) teach against this same state.
    expect(html).toBe('<button class="al-inspected-element" type="button">Go</button>');
    expect(css).toBe(
      ".al-inspected-element:focus-visible{outline:2px solid #1d4ed8;outline-offset:2px;}",
    );
  });

  it("renders outline:0px when the ring width is 0 — the exact state focus-not-visible flags", () => {
    const { css } = renderButton({
      renderAs: "button-button",
      label: "Go",
      focusRingEnabled: true,
      focusRingWidth: { value: 0, unit: "px" },
      focusRingColor: "#1d4ed8",
    });
    // A 0px outline is invisible. The rendered CSS says so, and the
    // focus-not-visible rule fires on the same inputs — render and rule agree
    // about what "no focus indicator" means.
    expect(css).toContain("outline:0px solid #1d4ed8");
  });
});

describe("renderButton — border colour without a width override", () => {
  it("emits border-color even with no border-width set, so it can recolour the UA border", () => {
    // A bare <button> already has a user-agent border; the colour control must
    // be able to recolour it on its own. Pinning this guards the deliberate
    // decision in buildInlineStyle to emit border-color independently of width
    // (otherwise changing the colour would do nothing visible in the preview).
    expect(
      renderButton({ renderAs: "button-button", label: "Go", borderColor: "#888888" }).html,
    ).toBe('<button type="button" style="border-color: #888888">Go</button>');
  });
});
