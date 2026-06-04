import type { Rule } from "~/rules/types";

export const selectOptionsEmpty: Rule = {
  id: "select-options-empty",
  title: "Select has no options",
  wcag: "SC 3.3.2 Labels or Instructions — Level A",
  tags: ["best-practice"],
  description:
    "The select has no `<option>` elements. Screen reader users hear the field announced but cannot make a choice, and sighted users see an empty dropdown that does nothing. An empty select almost always indicates a data-loading bug or a misconfigured controls panel.",
  help:
    "Populate the select with at least one meaningful option. If the options are loaded asynchronously, render a `<option disabled>Loading…</option>` placeholder until the real data arrives.",
  helpUrl: "https://www.w3.org/WAI/WCAG22/Understanding/labels-or-instructions.html",
  learnTopicId: "select",
  evaluate(props) {
    const options = Array.isArray(props.options) ? props.options : [];
    if (options.length > 0) return null;
    return {
      severity: "moderate",
      measurement:
        "Options list is empty — the rendered select has nothing for the user to pick.",
    };
  },
};
