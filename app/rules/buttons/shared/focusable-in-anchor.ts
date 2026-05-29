import type { Rule } from '~/rules/types'

/**
 * Detect when a focusable element is wrapped in an `<a href>`.
 *
 * Why this rule exists: axe-core's `nested-interactive` rule only fires
 * on ARIA roles whose definition has `childrenPresentational: true`
 * (button, checkbox, img, radio, slider, switch, tab, etc.). The `link`
 * role is *not* in that set — per the ARIA spec, a link's children
 * aren't presentational — so axe stays silent on the canonical
 * card-as-link-with-button-inside misuse pattern.
 *
 * HTML's content model still forbids it: `<a>` is "Transparent, but
 * there must be no interactive content descendant, a element descendant,
 * or descendant with the tabindex attribute specified." The real-world
 * failure mode is severe — screen readers announce both interactives
 * separately, focus order is ambiguous, and the click target overlaps
 * so the parent anchor often swallows clicks intended for the child.
 *
 * For the button component every variant is focusable, so we only need
 * to check whether the `link` wrapper is applied. The rule lives in
 * `rules/button/` rather than `rules/shared/` because that "the inner
 * element is always focusable" assumption is button-specific.
 */
export const focusableInAnchor: Rule = {
  id: 'focusable-in-anchor',
  title: 'Focusable element inside an anchor',
  wcag: 'SC 4.1.2 Name, Role, Value — Level A',
  tags: ['wcag2a', 'wcag412'],
  description:
    'An `<a href>` element contains a focusable descendant. HTML forbids interactive content as a descendant of an anchor, and assistive technology breaks here in real ways: screen readers announce both interactives separately so the user doesn\'t know which one they\'re on, keyboard focus order becomes ambiguous (the user lands on the outer link then on the inner button as two separate stops), and the parent anchor\'s hit area swallows clicks intended for the inner control.',
  help: 'Restructure so only one element is interactive. Either make the wrapper a non-interactive element (e.g. a card div) and extend its hit area to cover the focusable child, or remove the inner focusable so the anchor is the only interactive element.',
  helpUrl: 'https://www.w3.org/WAI/WCAG22/Understanding/name-role-value.html',
  evaluate(props) {
    const wrappers = Array.isArray(props.wrappers)
      ? (props.wrappers as string[])
      : []
    if (!wrappers.includes('link')) return null
    return {
      severity: 'serious',
      measurement:
        'The button is wrapped in an `<a href>`. The anchor and the button are both focusable, producing two separate tab stops, two screen-reader announcements, and an ambiguous click target.'
    }
  }
}
