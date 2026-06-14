import type { ContextWrapper } from "~/types/component";

/**
 * Form wrapper for the checkbox studio. Differs from the button-family
 * formWrapper because the checkbox isn't its own submit trigger —
 * we need a sibling submit button so students can actually try to
 * submit the form. That makes the `required` lesson observable and
 * surfaces the name/value submission contract via the existing
 * `form:submitted` toast plumbing in ComponentStudio.
 */
export const formSubmitWrapper: ContextWrapper = {
  key: "form",
  label: "<form>",
  learnTopicId: "form-wrapping",
  wrap: (html: string) =>
    `<form>${html}<div style="margin-top: 0.8em;"><button type="submit">Submit</button></div></form>`,
};
