import type { ContextWrapper } from "~/types/component";

export const formSubmitWrapper: ContextWrapper = {
  key: "form",
  label: "<form>",
  learnTopicId: "form-wrapping",
  wrap: (html: string) =>
    `<form>${html}<div style="margin-top: 0.8em;"><button type="submit">Submit</button></div></form>`,
};
