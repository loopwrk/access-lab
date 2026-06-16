import type { Rule } from "~/rules/types";

/**
 * type="number" is for quantities you would do maths on (age, count, price).
 * Card numbers, phone numbers, and postal codes are *strings of digits* - you
 * never add them up - and type="number" actively harms them: it strips leading
 * zeros (a postcode "01234" becomes "1234"), adds spinner buttons and
 * scroll-to-change that can silently alter the value, ignores maxlength, and
 * can mangle long numbers. The numeric on-screen keyboard people actually want
 * comes from inputmode="numeric" with none of those side effects.
 *
 * Detection is by INTENT, not by value: the studio configures a demo, so there
 * is no real typed value to validate. We read the field's label + name - the
 * same keyword approach vague-label uses - and stay deliberately narrow (whole-
 * word matching) so a genuine quantity ("number of guests", "age") never trips
 * it. A value-level check (Luhn for cards, libphonenumber for phones) would add
 * a heavy dependency for no teaching benefit here.
 */

interface NumericStringCategory {
  noun: string;
  recommend: string;
  pattern: RegExp;
}

const NUMERIC_STRING_CATEGORIES: NumericStringCategory[] = [
  {
    noun: "a card number",
    recommend: 'type="text" inputmode="numeric" autocomplete="cc-number"',
    pattern: /\b(credit card|debit card|card number|card no|cardnumber|cc number|ccnum)\b/,
  },
  {
    noun: "a phone number",
    recommend: 'type="tel" autocomplete="tel"',
    pattern: /\b(phone|telephone|tel|mobile|fax)\b/,
  },
  {
    noun: "a postal code",
    recommend: 'type="text" inputmode="numeric" autocomplete="postal-code"',
    pattern: /\b(post ?code|postal code|zip ?code|zip|pin ?code)\b/,
  },
];

// Lowercase and split word joins (cardNumber / card_number / card-number) so
// the field name reads like prose before the whole-word patterns run.
function normalize(value: unknown): string {
  if (typeof value !== "string") return "";
  return value
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[-_]+/g, " ")
    .toLowerCase()
    .trim();
}

export const numberInputForFormattedValue: Rule = {
  id: "input-number-for-formatted-value",
  title: "type=number is the wrong type for this field",
  wcag: "SC 1.3.5 Identify Input Purpose - Level AA",
  tags: ["best-practice"],
  description:
    'type="number" is for quantities you would do maths on. Card numbers, phone numbers, and postal codes are strings of digits, not quantities - and type="number" harms them: it strips leading zeros (a postcode "01234" becomes "1234"), adds spinner buttons and scroll-to-change that can silently alter the value, ignores maxlength, and can mangle long numbers. The numeric on-screen keyboard you want comes from inputmode="numeric" without any of these side effects.',
  help: 'Use type="text" with inputmode="numeric" (or type="tel" for phone numbers), plus the matching autocomplete token (cc-number, tel, postal-code). Reserve type="number" for true quantities.',
  helpUrl: "https://www.w3.org/WAI/WCAG22/Understanding/identify-input-purpose.html",
  evaluate(props) {
    if (props.renderAs !== "number") return null;

    const haystack = `${normalize(props.label)} ${normalize(props.name)}`;
    const match = NUMERIC_STRING_CATEGORIES.find((category) => category.pattern.test(haystack));
    if (!match) return null;

    return {
      severity: "moderate",
      measurement: `This field looks like it holds ${match.noun}, but type="number" is for quantities - leading zeros are stripped and the spinner / scroll controls can corrupt the value. Use ${match.recommend}.`,
    };
  },
};
