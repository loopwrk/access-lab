import type { ManualChecklistItem } from '~/rules/types'

export const checkboxManualChecklist: ManualChecklistItem[] = [
  {
    id: 'checkbox-label-clickable',
    title: 'The visible label activates the checkbox when clicked',
    wcagSc: '2.5.5 Target Size (Enhanced)',
    description:
      'Clicking the label text should toggle the checkbox. The browser handles this for free when the input is associated to a <label> via for/id or by wrapping. If clicking the label does nothing, the association is broken.',
    url: 'https://www.w3.org/WAI/WCAG22/Understanding/target-size-enhanced.html'
  },
  {
    id: 'checkbox-space-activates',
    title: 'Space activates the checkbox when focused',
    wcagSc: '2.1.1 Keyboard',
    description:
      'Focus the checkbox with Tab and press Space. The state should toggle. Native checkboxes get this for free; custom div-based checkboxes break it unless you wire it up by hand.',
    url: 'https://www.w3.org/WAI/WCAG22/Understanding/keyboard.html'
  },
  {
    id: 'checkbox-focus-visible',
    title: 'The focus indicator is clearly visible',
    wcagSc: '2.4.7 Focus Visible',
    description:
      'Tab to the checkbox and verify a visible focus ring appears. Native checkbox focus styling is often subtle — consider whether it meets the 3:1 contrast minimum against adjacent colours.',
    url: 'https://www.w3.org/WAI/WCAG22/Understanding/focus-visible.html'
  },
  {
    id: 'checkbox-target-size',
    title: 'The checkbox has a comfortable hit area',
    wcagSc: '2.5.5 Target Size (Enhanced)',
    description:
      'Native checkboxes default to around 13x13 pixels — well below the WCAG AAA 44x44 minimum. The label, when associated, extends the effective target. Confirm the combined hit area is comfortable for touch users and people with motor impairments.',
    url: 'https://www.w3.org/WAI/WCAG22/Understanding/target-size-enhanced.html'
  },
  {
    id: 'checkbox-state-announced',
    title: 'State changes are announced to screen readers',
    wcagSc: '4.1.2 Name, Role, Value',
    description:
      'Activate the checkbox with a screen reader running. The new state ("checked" or "not checked") should be announced. If you are setting the state via JavaScript on a custom control, ensure `aria-checked` is updated in the same handler.',
    url: 'https://www.w3.org/WAI/WCAG22/Understanding/name-role-value.html'
  },
  {
    id: 'checkbox-indeterminate-meaning',
    title: 'Indeterminate state has a clear visual cue',
    wcagSc: '1.4.1 Use of Color',
    description:
      'If using the indeterminate state (e.g. a "select all" checkbox reflecting a partial child selection), pair the visual dash with a tooltip or supporting text. Sighted users may not recognise the dash; assistive tech announces it as "mixed".',
    url: 'https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html'
  },
  {
    id: 'checkbox-group-legend-clear',
    title: 'Group legend describes the choice being made',
    wcagSc: '1.3.1 Info and Relationships',
    description:
      'For grouped checkboxes inside a <fieldset>, the <legend> text should describe what the user is choosing between — not just the section heading. "Notifications" alone is less helpful than "Which notifications would you like to receive?".',
    url: 'https://www.w3.org/WAI/WCAG22/Understanding/info-and-relationships.html'
  }
]
