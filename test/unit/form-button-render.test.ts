/**
 * The lesson this component teaches is WHERE a control's accessible name comes
 * from, and that source differs by element. So these tests are organised
 * around naming, and each pins the byte-exact markup (the artefact axe audits
 * and the student copies - see button-render.test.ts for the full rationale).
 *
 * On the <form> wrapper: the renderer emits ONLY the control. The surrounding
 * <form> is layered on afterwards by the studio's context-wrapper chain
 * (useInspectedComponent.applyContextWrappers), so it is correct that nothing
 * here expects a <form> - that wrapping is the controls layer's responsibility
 * and is covered in test/nuxt/form-button-controls.test.ts.
 *
 * Pure function → node unit env.
 */

import { describe, expect, it } from "vitest";
import { renderButton } from "../../app/components/inspected/buttons/shared/render";

describe("renderButton - a <button> is named by its content", () => {
  it("button-submit puts the label between the tags", () => {
    expect(renderButton({ renderAs: "button-submit", label: "Save changes" }).html).toBe(
      '<button type="submit">Save changes</button>',
    );
  });

  it("button-reset puts the label between the tags too", () => {
    expect(renderButton({ renderAs: "button-reset", label: "Discard changes" }).html).toBe(
      '<button type="reset">Discard changes</button>',
    );
  });
});

describe("renderButton - an <input> button is named by its value attribute", () => {
  // The teaching contrast with the block above: an <input> is a void element
  // with no content model, so the SAME label string becomes the `value`
  // attribute, which serves double duty as the visible text AND the accessible
  // name. This is the heart of the button-value-attribute Learn topic, and the
  // reason carrying assumptions from <button> to <input> creates silent bugs.
  it("input-submit renders the label as the value, not as content", () => {
    expect(renderButton({ renderAs: "input-submit", label: "Save changes" }).html).toBe(
      '<input type="submit" value="Save changes">',
    );
  });

  it("input-button and input-reset follow the same void-element shape", () => {
    expect(renderButton({ renderAs: "input-button", label: "Go" }).html).toBe(
      '<input type="button" value="Go">',
    );
    expect(renderButton({ renderAs: "input-reset", label: "Reset" }).html).toBe(
      '<input type="reset" value="Reset">',
    );
  });

  it("derives the value from the label, ignoring a separate value prop", () => {
    // There is only one string on an input button, and it is the label. A
    // distinct `value` prop has no slot to fill, so the renderer never reads it
    // for these variants - pinning that prevents a future "use props.value
    // here" change from quietly splitting the label and the form value apart.
    const html = renderButton({ renderAs: "input-submit", label: "Save", value: "ignored" }).html;
    expect(html).toBe('<input type="submit" value="Save">');
    expect(html).not.toContain("ignored");
  });

  it("carries a name alongside the value as form data (multi-submit)", () => {
    expect(renderButton({ renderAs: "input-submit", label: "Save", name: "action" }).html).toBe(
      '<input type="submit" name="action" value="Save">',
    );
  });
});

describe('renderButton - an <input type="image"> is named by alt', () => {
  it("renders an UNNAMED image button when alt is absent (the anti-pattern axe catches)", () => {
    // No alt: the button has no accessible name. This is the exact state that
    // fires axe-core's button-name, and the state the image variant starts in
    // so the failure is visible immediately. value/name are absent here too -
    // the control is purely an unnamed image.
    expect(renderButton({ renderAs: "input-image", src: "/i/search.svg" }).html).toBe(
      '<input type="image" src="/i/search.svg">',
    );
  });

  it("takes its accessible name from alt - not from label or value", () => {
    // An image button is named exactly like an <img>: by alt. The label is
    // meaningless here, so pinning that label is dropped guards the teaching
    // distinction (and matches the image-button-coordinates Learn topic).
    const html = renderButton({
      renderAs: "input-image",
      src: "/i/search.svg",
      alt: "Search",
      label: "ignored",
    }).html;
    expect(html).toBe('<input type="image" src="/i/search.svg" alt="Search">');
    expect(html).not.toContain("ignored");
  });

  it("emits name and value as form data alongside the image", () => {
    // These are the fields that ride along with the x/y click coordinates when
    // an image button submits - the behaviour the image-button-coordinates
    // topic explains.
    expect(
      renderButton({
        renderAs: "input-image",
        src: "/i/s.svg",
        alt: "Search",
        name: "q",
        value: "go",
      }).html,
    ).toBe('<input type="image" src="/i/s.svg" alt="Search" name="q" value="go">');
  });
});
