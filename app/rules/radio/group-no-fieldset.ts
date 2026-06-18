import type { Rule } from "~/rules/types";

export const radioGroupNoFieldset: Rule = {
  id: "radio-group-no-fieldset",
  title: "Radio group has no <fieldset> / <legend>",
  wcag: "SC 1.3.1 Info and Relationships - Level A",
  tags: ["wcag2a", "wcag131"],
  description:
    "Radio buttons that represent mutually exclusive choices need a `<fieldset>` and `<legend>` so assistive technology can announce the group question (the legend) before each option. A visible heading above the group looks the same to sighted users but conveys no programmatic relationship.",
  help: 'Wrap the radios in a `<fieldset>` and use a `<legend>` for the group question. Screen readers will then announce the legend before each option (e.g. "Which plan would you like?, Free, radio, not checked").',
  helpUrl: "https://www.w3.org/WAI/WCAG22/Understanding/info-and-relationships.html",
  evaluate(props) {
    if (props.groupMode !== "group-no-fieldset") return null;
    return {
      severity: "serious",
      message:
        'Group mode is set to "no fieldset" - the radios share no programmatic group association.',
    };
  },
};
