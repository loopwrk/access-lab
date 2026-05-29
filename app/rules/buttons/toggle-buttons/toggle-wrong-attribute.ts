import type { Rule } from '~/rules/types'

// `aria-checked` is only valid on widgets with a checkbox / radio /
// switch role. On a plain `<button>` it's not part of the role's
// supported attributes, so screen readers may ignore it or announce
// inconsistently.
export const toggleWrongAttribute: Rule = {
  id: 'toggle-wrong-attribute',
  title: 'aria-checked on a button without role="switch"',
  wcag: 'SC 4.1.2 Name, Role, Value — Level A',
  tags: ['wcag2a', 'wcag412'],
  description:
    '`aria-checked` is only valid on widgets whose role expects it — checkbox, radio, switch. On a plain `<button>` the attribute isn\'t part of the role\'s supported state set, so assistive tech may ignore it or announce inconsistently.',
  help: 'For a button toggle, use `aria-pressed` instead. If you genuinely want switch semantics (an on/off setting), give the element `role="switch"` and use `aria-checked`.',
  helpUrl: 'https://www.w3.org/TR/wai-aria-1.2/#button',
  evaluate(props) {
    if (props.toggleBehaviour !== 'aria-checked') return null
    return {
      severity: 'serious',
      measurement:
        'Button uses aria-checked but has no role="switch" — assistive tech will not interpret the state reliably.'
    }
  }
}
