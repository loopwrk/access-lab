import type { Rule } from "~/rules/types";

// Fires when multiple related checkboxes are rendered without a
// surrounding <fieldset> and <legend>. Sighted users see the heading
// text above the group; assistive technology gets no group context at
// all - each checkbox is announced as if it were a standalone control
// and the relationship between them is lost. axe-core does not flag
// this case because the bare checkboxes have valid individual names.
export const checkboxGroupNoFieldset: Rule = {
  id: "checkbox-group-no-fieldset",
  title: "Checkbox group has no <fieldset> / <legend>",
  wcag: "SC 1.3.1 Info and Relationships - Level A",
  tags: ["wcag2a", "wcag131"],
  description:
    "Multiple related checkboxes need a `<fieldset>` and `<legend>` so assistive technology can announce the group context (the legend) alongside each checkbox label. A visible heading above the group looks the same to sighted users but conveys no programmatic relationship.",
  help: 'Wrap the checkboxes in a `<fieldset>` and use a `<legend>` for the group title. Screen readers will then announce the legend before each option (e.g. "Notifications, Updates, checkbox, not checked").',
  helpUrl: "https://www.w3.org/WAI/WCAG22/Understanding/info-and-relationships.html",
  evaluate(props) {
    if (props.groupMode !== "group-no-fieldset") return null;
    return {
      severity: "serious",
      measurement:
        'Group mode is set to "no fieldset" - the checkboxes share no programmatic group association.',
    };
  },
};
