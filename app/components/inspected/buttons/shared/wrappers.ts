import type { ContextWrapper } from "~/types/component";

export const formWrapper: ContextWrapper = {
  key: "form",
  label: "<form>",
  learnTopicId: "form-wrapping",
  wrap: (html: string) => `<form>${html}</form>`,
};

export const linkWrapper: ContextWrapper = {
  key: "link",
  label: "<a href>",
  wrap: (html: string) => `<a href="#">${html}</a>`,
};

export const buttonWrapper: ContextWrapper = {
  key: "button",
  label: "<button>",
  availableFor: (renderAs) => renderAs?.startsWith("input-") ?? false,
  wrap: (html: string) => `<button type="button">${html}</button>`,
};
