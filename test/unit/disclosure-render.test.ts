/**
 * Characterisation tests for the disclosure-trigger render output.
 *
 * The disclosure markup is load-bearing: axe audits it, the rules reason about
 * it, the code drawer shows it to the student, and — new in the declarative
 * interaction protocol — the iframe shell reads the `data-al-interaction`
 * marker to decide how to report an activation. So this pins:
 *   - the marker sits on the studio WRAPPER, never on the copied button
 *   - the panel wraps at a readable width and breaks paragraphs on blank lines
 *     (author-controlled), not by guessing sentence boundaries
 *   - aria-expanded / aria-controls track the behaviour the page teaches
 *
 * Pure function → node unit env (matches button-render.test.ts).
 */

import { describe, expect, it } from "vitest";
import { renderButton } from "../../app/components/inspected/buttons/shared/render";
import type { ButtonProps } from "../../app/components/inspected/buttons/shared/types";

const base: Partial<ButtonProps> = {
  renderAs: "button-button",
  label: "Show details",
  disclosureBehaviour: "aria-expanded",
  disclosureExpanded: false,
  disclosureShowControls: true,
  disclosurePanelText: "First sentence. Second sentence.",
};

const buttonTag = (html: string) => html.match(/<button[^>]*>/)![0];

describe("renderButton (disclosure) — wrapper, marker, and panel", () => {
  it("wraps trigger + panel and marks the WRAPPER (not the button) for the host bridge", () => {
    const { html } = renderButton(base);
    expect(html).toBe(
      '<div class="al-disclosure-wrap" data-al-interaction="toggle">' +
        '<button type="button" aria-expanded="false" aria-controls="al-disclosure-panel">Show details</button>' +
        '<div id="al-disclosure-panel" class="al-disclosure-panel" hidden><p>First sentence. Second sentence.</p></div>' +
        "</div>",
    );
    // The marker lives on the studio scaffolding wrapper so the copied button
    // the student learns from stays clean semantic markup.
    expect(buttonTag(html)).not.toContain("data-al-interaction");
  });

  it("keeps the marker on the bare <button> variant too, so a type-less trigger still toggles", () => {
    // The bare variant emits no type attribute (defaults to submit) — the exact
    // condition that used to suppress the toggle. The marker is what routes its
    // activation through the host bridge instead of the form-submit heuristic.
    const { html } = renderButton({ ...base, renderAs: "button" });
    expect(html).toContain('<div class="al-disclosure-wrap" data-al-interaction="toggle">');
    expect(buttonTag(html)).not.toContain("type=");
  });
});

describe("renderButton (disclosure) — panel paragraphs", () => {
  it("renders one paragraph for prose with no blank line", () => {
    const { html } = renderButton({ ...base, disclosurePanelText: "All one. Still one." });
    expect(html).toContain("<p>All one. Still one.</p>");
    expect(html.match(/<p>/g)!.length).toBe(1);
  });

  it("starts a new paragraph at a blank line (author-controlled, not sentence-guessed)", () => {
    const { html } = renderButton({ ...base, disclosurePanelText: "Para one.\n\nPara two." });
    expect(html).toContain("<p>Para one.</p><p>Para two.</p>");
  });

  it("caps the panel width so the revealed text wraps at a readable length", () => {
    const { css } = renderButton(base);
    expect(css).toContain(".al-disclosure-panel{");
    expect(css).toContain("max-width:60ch;");
  });
});

describe("renderButton (disclosure) — the ARIA the page teaches", () => {
  it("reflects disclosureExpanded in aria-expanded for the correct behaviour", () => {
    const { html } = renderButton({ ...base, disclosureExpanded: true });
    expect(buttonTag(html)).toContain('aria-expanded="true"');
    // panel revealed → no hidden attribute
    expect(html).toContain('class="al-disclosure-panel"><p>');
  });

  it("hardcodes aria-expanded=false for the out-of-sync anti-pattern, even when open", () => {
    const { html } = renderButton({
      ...base,
      disclosureBehaviour: "out-of-sync",
      disclosureExpanded: true,
    });
    expect(buttonTag(html)).toContain('aria-expanded="false"'); // says shut
    expect(html).toContain('class="al-disclosure-panel"><p>'); // but is open
  });

  it("emits no aria-expanded for the none behaviour, but keeps aria-controls when included", () => {
    // Matches the disclosure-no-state reword: aria-controls links the panel but
    // never carries open/closed state — only aria-expanded does.
    const { html } = renderButton({ ...base, disclosureBehaviour: "none" });
    expect(buttonTag(html)).not.toContain("aria-expanded");
    expect(buttonTag(html)).toContain('aria-controls="al-disclosure-panel"');
  });

  it("includes aria-controls only when disclosureShowControls is on", () => {
    expect(buttonTag(renderButton({ ...base, disclosureShowControls: true }).html)).toContain(
      'aria-controls="al-disclosure-panel"',
    );
    expect(buttonTag(renderButton({ ...base, disclosureShowControls: false }).html)).not.toContain(
      "aria-controls",
    );
  });
});
