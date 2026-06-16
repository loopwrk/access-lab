import type { Rule } from "~/rules/types";

/**
 * SC 1.3.5 Identify Input Purpose (AA): when a field's type pins a specific
 * purpose, its `autocomplete` token must name that SAME purpose. axe's
 * `autocomplete-valid` only catches an invalid token (a typo) or a token on the
 * wrong control group (e.g. cc-number on a checkbox); it stays silent when a
 * perfectly valid token names the WRONG purpose, because `tel` and `email` are
 * both accepted on any text-entry control. That gap is actively harmful:
 * autofill would pour a phone number into an email field, which is worse than
 * having no autocomplete at all. This rule fills it.
 *
 * Detection is deliberately narrow to avoid false positives. It judges only the
 * three input types whose semantics pin a single purpose - email / tel / url -
 * and flags only a token that is a KNOWN field-name token belonging to a
 * different purpose. An unknown or typo'd token is left to axe; a permissive
 * type="text" field (which can legitimately carry almost any token) is skipped;
 * a missing token is left to `input-missing-autocomplete`.
 */

// The field-name token a type implies, plus the other tokens still legitimate on
// it - `username` on an email/tel login field, the `tel-*` parts on a phone
// field, URL-valued tokens on a url field.
const ALLOWED_TOKENS_BY_TYPE: Record<string, string[]> = {
  email: ["email", "username"],
  tel: [
    "tel",
    "tel-country-code",
    "tel-national",
    "tel-area-code",
    "tel-local",
    "tel-extension",
    "username",
  ],
  url: ["url", "photo", "impp"],
};

const RECOMMENDED_TOKEN: Record<string, string> = {
  email: "email",
  tel: "tel",
  url: "url",
};

// Known autocomplete field-name tokens. Only a token in this set is treated as a
// clear "different purpose"; anything outside it is an unknown or invalid value,
// which is axe's `autocomplete-valid` to flag, not ours.
const KNOWN_FIELD_TOKENS = new Set([
  "name",
  "honorific-prefix",
  "given-name",
  "additional-name",
  "family-name",
  "honorific-suffix",
  "nickname",
  "username",
  "organization-title",
  "organization",
  "street-address",
  "address-line1",
  "address-line2",
  "address-line3",
  "address-level1",
  "address-level2",
  "country",
  "country-name",
  "postal-code",
  "cc-name",
  "cc-number",
  "cc-exp",
  "cc-exp-month",
  "cc-exp-year",
  "cc-csc",
  "cc-type",
  "language",
  "bday",
  "sex",
  "url",
  "photo",
  "impp",
  "tel",
  "tel-country-code",
  "tel-national",
  "tel-area-code",
  "tel-local",
  "tel-extension",
  "email",
]);

// The field-name token is the LAST token in the autocomplete value, after any
// optional section-*, shipping/billing, and home/work/mobile grouping tokens.
function fieldNameToken(value: string): string {
  const tokens = value.trim().toLowerCase().split(/\s+/);
  return tokens[tokens.length - 1] ?? "";
}

export const autocompleteMismatch: Rule = {
  id: "input-autocomplete-mismatch",
  title: "Autocomplete names a different purpose than the field",
  wcag: "SC 1.3.5 Identify Input Purpose - Level AA",
  tags: ["wcag2aa", "wcag135"],
  description:
    "This field's type pins a specific purpose, but its autocomplete token names a different one, so the purpose is programmatically identifiable yet wrong. The cost is real: autofill offers the wrong data (a phone number dropped into an email field), which is worse than no autocomplete at all.",
  help: "Use an autocomplete token that matches the field's purpose.",
  helpUrl: "https://www.w3.org/WAI/WCAG22/Understanding/identify-input-purpose.html",
  evaluate(props) {
    const type = typeof props.renderAs === "string" ? props.renderAs : "";
    const allowed = ALLOWED_TOKENS_BY_TYPE[type];
    if (!allowed) return null; // only email / tel / url pin a single purpose

    const raw = typeof props.autocomplete === "string" ? props.autocomplete.trim() : "";
    if (!raw) return null; // missing token is input-missing-autocomplete's job

    const token = fieldNameToken(raw);
    if (token === "on" || token === "off") return null; // generic, never a mismatch
    if (allowed.includes(token)) return null; // correct, or an acceptable token for this type
    if (!KNOWN_FIELD_TOKENS.has(token)) return null; // unknown/typo - axe's autocomplete-valid

    return {
      severity: "serious",
      measurement:
        `This field is type="${type}", but autocomplete="${token}" describes a different kind of data. ` +
        `Autofill would offer the wrong value. Use autocomplete="${RECOMMENDED_TOKEN[type]}".`,
    };
  },
};
