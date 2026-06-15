import type { Rule } from "~/rules/types";

/**
 * SC 1.3.5 Identify Input Purpose (AA): fields that collect known personal
 * data should carry an `autocomplete` token so browsers can autofill them and
 * assistive tech can personalise the UI from the field's purpose.
 *
 * This fills a gap axe leaves: axe's `autocomplete-valid` only flags a *wrong*
 * autocomplete, never a *missing* one. So when an identifiable field has no
 * autocomplete at all, no automated check fires -this rule does. Detection is
 * by INTENT (label + name), the same whole-word keyword approach as
 * `input-number-for-formatted-value`. It stays silent once autocomplete is
 * set (valid or not -validity is axe's job), and skips number-type fields,
 * which the type-misuse rule already covers and which are usually quantities.
 */

interface AutocompleteHint {
  token: string;
  pattern: RegExp;
}

const AUTOCOMPLETE_HINTS: AutocompleteHint[] = [
  { token: "email", pattern: /\b(e-?mail)\b/ },
  { token: "tel", pattern: /\b(phone|telephone|tel|mobile|fax)\b/ },
  { token: "postal-code", pattern: /\b(post ?code|postal code|zip ?code|zip)\b/ },
  { token: "cc-number", pattern: /\b(credit card|debit card|card number|cc number)\b/ },
  {
    token: "street-address",
    pattern: /\b(street address|billing address|shipping address|postal address|address line)\b/,
  },
];

function normalize(value: unknown): string {
  if (typeof value !== "string") return "";
  return value
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[-_]+/g, " ")
    .toLowerCase()
    .trim();
}

export const missingAutocomplete: Rule = {
  id: "input-missing-autocomplete",
  title: "Identifiable field has no autocomplete",
  wcag: "SC 1.3.5 Identify Input Purpose -Level AA",
  tags: ["best-practice"],
  description:
    "Fields that collect a person's own information (email, phone, address, postcode, card number) should carry an `autocomplete` token so browsers can offer autofill and assistive technology can adapt to the field's purpose. Automated tools only flag an invalid autocomplete, never a missing one -so a field with a recognisable purpose and no autocomplete passes every automated check while still failing SC 1.3.5.",
  help: "Add the matching `autocomplete` token -e.g. `email`, `tel`, `postal-code`, `cc-number`, `street-address`. See the WHATWG autocomplete token list for the full set.",
  helpUrl: "https://www.w3.org/WAI/WCAG22/Understanding/identify-input-purpose.html",
  evaluate(props) {
    // Number-type fields are covered by input-number-for-formatted-value (which
    // already recommends an autocomplete token) or are plain quantities.
    if (props.renderAs === "number") return null;

    const autocomplete = typeof props.autocomplete === "string" ? props.autocomplete.trim() : "";
    if (autocomplete.length > 0) return null; // present → axe judges its validity

    const haystack = `${normalize(props.label)} ${normalize(props.name)}`;
    const hint = AUTOCOMPLETE_HINTS.find((entry) => entry.pattern.test(haystack));
    if (!hint) return null;

    return {
      severity: "moderate",
      measurement: `This field has a recognisable purpose but no autocomplete attribute, so browsers can't offer autofill. Add autocomplete="${hint.token}".`,
    };
  },
};
