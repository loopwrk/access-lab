import type { Rule } from '~/rules/types'

// Fires when the trigger visibly reveals a panel but exposes no
// `aria-expanded` attribute. Sighted users see the panel appear and
// disappear; screen reader users hear an ordinary button and have no
// indication that the panel below the button is opening or closing.
export const disclosureNoState: Rule = {
  id: 'disclosure-no-state',
  title: 'Disclosure trigger has no aria-expanded',
  wcag: 'SC 4.1.2 Name, Role, Value — Level A',
  tags: ['wcag2a', 'wcag412'],
  description:
    'The button reveals and hides a panel on click but exposes no `aria-expanded` attribute. Assistive technology has no way to announce the open/closed state, so screen reader users hear the same button announcement whether the panel is open or shut.',
  help: 'Add `aria-expanded="true|false"` to the trigger and flip it whenever the panel opens or closes. Consider also adding `aria-controls="<panel id>"` so the relationship between trigger and panel is explicit.',
  helpUrl: 'https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/',
  evaluate(props) {
    if (props.disclosureBehaviour !== 'none') return null
    return {
      severity: 'serious',
      measurement:
        'Disclosure behaviour is set to "no aria-expanded" — the panel toggles visually but the state is not exposed.'
    }
  }
}
