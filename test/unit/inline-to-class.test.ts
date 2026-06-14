/**
 * "Copy with classes" extracts a styled element's inline styles into a
 * `.my-component` class and rewrites the tag to reference it. The critical
 * behaviour is the class MERGE: inspected elements already carry
 * `al-inspected-element`, and appending a second `class` attribute produces
 * invalid HTML that the parser silently collapses.
 *
 * Pure regex/string work, no Nuxt context, so the composable runs in the node
 * unit env directly.
 */

import { describe, expect, it } from "vitest";
import { useInlineToClass } from "../../app/composables/useInlineToClass";

const { convert } = useInlineToClass();

describe("useInlineToClass.convert", () => {
  it("merges into an existing class attribute instead of adding a second one", () => {
    const result = convert(
      '<button class="al-inspected-element" type="button" style="width: 24px; height: 24px">Go</button>',
    );
    expect(result?.html).toBe(
      '<button class="al-inspected-element my-component" type="button">Go</button>',
    );
    // Exactly one class attribute — a duplicate is what the bug produced.
    expect(result?.html.match(/class=/g)?.length).toBe(1);
  });

  it("adds a class attribute when the tag has none", () => {
    const result = convert('<button style="width: 24px">Go</button>');
    expect(result?.html).toBe('<button class="my-component">Go</button>');
  });

  it("extracts the declarations into a .my-component rule", () => {
    const result = convert('<button class="x" style="width: 24px; height: 24px">Go</button>');
    expect(result?.css).toBe(".my-component {\n  width: 24px;\n  height: 24px;\n}");
    expect(result?.className).toBe("my-component");
  });

  it("returns null when the markup has no inline style", () => {
    expect(convert('<button class="x" type="button">Go</button>')).toBeNull();
  });
});
