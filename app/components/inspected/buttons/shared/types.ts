import type { CssLength } from '~/composables/useUnitConversion'

export type ButtonRenderAs
  = | 'button'
    | 'button-submit'
    | 'button-reset'
    | 'button-button'
    | 'input-submit'
    | 'input-button'
    | 'input-reset'
    | 'input-image'
    | 'input-checkbox-switch'

export interface ButtonProps {
  renderAs: ButtonRenderAs
  wrappers: string[]
  label: string
  value: string
  name: string
  src: string
  alt: string
  disabled: boolean
  width: CssLength
  height: CssLength
  padding: CssLength
  paddingTop: CssLength
  paddingRight: CssLength
  paddingBottom: CssLength
  paddingLeft: CssLength
  borderWidth: CssLength
  borderTopWidth: CssLength
  borderRightWidth: CssLength
  borderBottomWidth: CssLength
  borderLeftWidth: CssLength
  fontSize: CssLength
  bg: string
  fgText: string
  borderColor: string
  ariaLabel: string
  contentType: 'text' | 'icon'
  focusRingEnabled: boolean
  focusRingWidth: CssLength
  focusRingColor: string
  focusRingOffset: CssLength
  toggleBehaviour?: ToggleBehaviour
  togglePressed?: boolean
  switchBehaviour?: SwitchBehaviour
  switchChecked?: boolean
  switchPillStyling?: boolean
}

export type ToggleBehaviour = 'none' | 'aria-pressed' | 'aria-checked' | 'visual-only'

export type SwitchBehaviour = 'none' | 'role-switch' | 'aria-pressed'
