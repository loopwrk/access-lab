/**
 * Characterisation tests for the four form-input renderers.
 *
 * These pin the exact HTML each renderer emits per label-association
 * mode and group mode. The rendered markup is load-bearing: axe-core
 * audits it, the custom rules reason about it, and the code drawer
 * shows it to the student verbatim — so refactors of the render
 * helpers must not change a single byte of output.
 */

import { describe, expect, it } from "vitest";
import { renderCheckbox } from "../../app/components/inspected/checkbox/render";
import { renderInput } from "../../app/components/inspected/input/render";
import { renderRadio } from "../../app/components/inspected/radio/render";
import { renderSelect } from "../../app/components/inspected/select/render";

describe("renderRadio", () => {
  const baseProps = {
    label: "Choose",
    name: "fruit",
    groupItems: ["One", "Two"],
    selectedItem: "Two",
  };

  it("renders a bare input when called without props", () => {
    expect(renderRadio()).toBe('<input type="radio" />');
  });

  it("renders a fieldset group with for-id labels by default", () => {
    expect(renderRadio(baseProps)).toBe(
      "<fieldset><legend>Choose</legend>" +
        '<div><input type="radio" id="al-radio-0" name="fruit" value="one" data-al-child-index="0" />' +
        ' <label for="al-radio-0">One</label></div>' +
        '<div><input type="radio" id="al-radio-1" name="fruit" value="two" data-al-child-index="1" checked />' +
        ' <label for="al-radio-1">Two</label></div>' +
        "</fieldset>",
    );
  });

  it("wraps each input in its label for the wrapping mode", () => {
    const html = renderRadio({ ...baseProps, labelAssociation: "wrapping" });
    expect(html).toContain(
      '<label><input type="radio" id="al-radio-0" name="fruit" value="one" data-al-child-index="0" /> One</label>',
    );
  });

  it("uses aria-label instead of a visible label for the aria-label mode", () => {
    const html = renderRadio({ ...baseProps, labelAssociation: "aria-label" });
    expect(html).toContain(
      '<input type="radio" id="al-radio-0" name="fruit" value="one" data-al-child-index="0" aria-label="One" />',
    );
    expect(html).not.toContain("<label");
  });

  it("emits no label at all for the none mode", () => {
    const html = renderRadio({ ...baseProps, labelAssociation: "none" });
    expect(html).not.toContain("label");
  });

  it("puts required on the first input only", () => {
    const html = renderRadio({ ...baseProps, required: true });
    expect(html).toContain('value="one" data-al-child-index="0" required');
    expect(html).not.toContain('data-al-child-index="1" required');
  });

  it("renders a heading paragraph instead of a fieldset for group-no-fieldset", () => {
    const html = renderRadio({ ...baseProps, groupMode: "group-no-fieldset" });
    expect(html.startsWith('<p style="font-weight: 600; margin: 0 0 0.4em;">Choose</p>')).toBe(true);
    expect(html).not.toContain("<fieldset>");
  });

  it("builds the inline style attribute from the style props", () => {
    const html = renderRadio({
      ...baseProps,
      fontSize: { value: 1.5, unit: "rem" },
      bg: "#fff",
      fgText: "#000",
      borderColor: "#888",
    });
    expect(html).toContain(
      ' style="font-size: 1.5rem; background: #fff; color: #000; border-color: #888"',
    );
  });
});

describe("renderCheckbox", () => {
  it("renders a bare input when called without props", () => {
    expect(renderCheckbox().html).toBe('<input type="checkbox" />');
  });

  it("renders a single checkbox with a for-id label by default", () => {
    const { html } = renderCheckbox({ label: "Subscribe", name: "sub", value: "yes" });
    expect(html).toBe(
      '<input type="checkbox" id="al-checkbox" name="sub" value="yes" class="al-inspected-element" />' +
        ' <label for="al-checkbox">Subscribe</label>',
    );
  });

  it("renders the wrapping mode with every state attribute in order", () => {
    const { html } = renderCheckbox({
      label: "Subscribe",
      labelAssociation: "wrapping",
      checked: true,
      disabled: true,
      ariaChecked: true,
      indeterminate: true,
    });
    expect(html).toBe(
      '<label><input type="checkbox" id="al-checkbox" name="" value="" class="al-inspected-element"' +
        ' checked disabled aria-checked="true" data-al-indeterminate /> Subscribe</label>',
    );
  });

  it("uses aria-label for the aria-label mode", () => {
    const { html } = renderCheckbox({ label: "Subscribe", labelAssociation: "aria-label" });
    expect(html).toBe(
      '<input type="checkbox" id="al-checkbox" name="" value="" class="al-inspected-element" aria-label="Subscribe" />',
    );
  });

  it("emits no accessible name for the none mode", () => {
    const { html } = renderCheckbox({ label: "Subscribe", labelAssociation: "none" });
    expect(html).toBe(
      '<input type="checkbox" id="al-checkbox" name="" value="" class="al-inspected-element" />',
    );
  });

  it("renders a fieldset group with per-child ids and indices", () => {
    const { html } = renderCheckbox({
      label: "Pick",
      groupMode: "group-with-fieldset",
      groupItems: ["A", "B"],
    });
    expect(html).toBe(
      "<fieldset><legend>Pick</legend>" +
        '<div><input type="checkbox" id="al-checkbox-0" name="" value="" class="al-inspected-element" checked data-al-child-index="0" />' +
        ' <label for="al-checkbox-0">A</label></div>' +
        '<div><input type="checkbox" id="al-checkbox-1" name="" value="" class="al-inspected-element" data-al-child-index="1" />' +
        ' <label for="al-checkbox-1">B</label></div>' +
        "</fieldset>",
    );
  });

  it("renders parent-with-children with uninspected children and the select-all JS", () => {
    const { html, js } = renderCheckbox({
      label: "Select all",
      groupMode: "parent-with-children",
      groupItems: ["A", "B"],
    });
    expect(html).toContain('<div class="al-parent-children">');
    expect(html).toContain('id="al-checkbox-child-0"');
    expect(html).not.toContain('id="al-checkbox-child-0" name="" value="" class');
    expect(js).toContain('document.getElementById("select-all")');
  });

  it("renders the div variant with aria-labelledby for the for-id mode", () => {
    const { html, css } = renderCheckbox({ label: "Subscribe", renderAs: "div-checkbox" });
    expect(html).toBe(
      '<div class="al-div-checkbox al-inspected-element" role="checkbox" tabindex="0"' +
        ' aria-checked="false" aria-labelledby="al-div-checkbox-label"></div>' +
        ' <label id="al-div-checkbox-label">Subscribe</label>',
    );
    expect(css).toContain(".al-div-checkbox{");
  });
});

describe("renderInput", () => {
  it("renders a block label before the input for the for-id mode", () => {
    const { html } = renderInput({ label: "Name", name: "n" });
    expect(html).toBe(
      '<div><label for="al-input" style="display: block; margin-bottom: 4px; margin-right: 8px">Name</label>' +
        '<input type="text" id="al-input" name="n" /></div>',
    );
  });

  it("wraps the input with the label text leading for the wrapping mode", () => {
    const { html } = renderInput({ label: "Name", name: "n", labelAssociation: "wrapping" });
    expect(html).toBe(
      '<div><label style="display: block">Name <input type="text" id="al-input" name="n" /></label></div>',
    );
  });

  it("uses aria-label for the aria-label mode", () => {
    const { html } = renderInput({ label: "Name", name: "n", labelAssociation: "aria-label" });
    expect(html).toBe('<div><input type="text" id="al-input" name="n" aria-label="Name" /></div>');
  });

  it("emits no accessible name for the none mode", () => {
    const { html } = renderInput({ label: "Name", name: "n", labelAssociation: "none" });
    expect(html).toBe('<div><input type="text" id="al-input" name="n" /></div>');
  });

  it("links help text via aria-describedby", () => {
    const { html } = renderInput({ label: "Name", helpText: "Required field" });
    expect(html).toContain('aria-describedby="al-input-help"');
    expect(html).toContain('<small id="al-input-help"');
    expect(html).toContain("Required field</small>");
  });

  it("emits placeholder styling as a CSS rule, not inline", () => {
    const { html, css } = renderInput({ label: "Name", placeholderStyle: { fgText: "#999" } });
    expect(css).toBe("#al-input::placeholder{color:#999;}");
    expect(html).not.toContain("#999");
  });

  it("emits the autocomplete attribute when set (valid or invalid — axe judges validity), omits it otherwise", () => {
    expect(renderInput({ label: "Email", name: "email", autocomplete: "email" }).html).toContain(
      'autocomplete="email"',
    );
    expect(renderInput({ label: "Email", name: "email", autocomplete: "emial" }).html).toContain(
      'autocomplete="emial"',
    );
    expect(renderInput({ label: "Email", name: "email" }).html).not.toContain("autocomplete");
  });

  it("renders the title-only anti-pattern: named only by title, with no label or aria-label", () => {
    const { html } = renderInput({ label: "Email", name: "email", labelAssociation: "title" });
    expect(html).toBe('<div><input type="text" id="al-input" name="email" title="Email" /></div>');
    expect(html).not.toContain("<label");
    expect(html).not.toContain("aria-label");
  });
});

describe("renderSelect", () => {
  it("renders a native select with a for-id label, options, and styles", () => {
    const { html } = renderSelect({
      label: "Pet",
      labelAssociation: "for-id",
      options: ["Cat", "Dog"],
      selectedOption: "Dog",
      name: "pet",
      fontSize: { value: 16, unit: "px" },
    });
    expect(html).toBe(
      '<div><label for="al-select" style="display: block; margin-bottom: 4px">Pet</label>' +
        '<select class="al-inspected-element" name="pet" id="al-select" style="font-size: 16px">' +
        '<option value="cat">Cat</option><option value="dog" selected>Dog</option>' +
        "</select></div>",
    );
  });
});
