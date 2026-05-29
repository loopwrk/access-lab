import type { ButtonProps, ButtonRenderAs } from './types'
import type { CssLength } from '~/composables/useUnitConversion'

const DEFAULT_LABEL = 'Button Label'

const BUTTON_TYPE_BY_RENDER_AS: Partial<Record<ButtonRenderAs, string>> = {
  'button-submit': 'submit',
  'button-reset': 'reset',
  'button-button': 'button'
}

const INPUT_TYPE_BY_RENDER_AS: Partial<Record<ButtonRenderAs, string>> = {
  'input-submit': 'submit',
  'input-button': 'button',
  'input-reset': 'reset'
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

function escapeAttribute(value: string): string {
  return escapeHtml(value).replace(/"/g, '&quot;')
}

// Selector hooks for the injected :focus-visible block (focus override)
// and pressed-state styling (toggle behaviour). Only applied when the
// relevant behaviour is on.
const INSPECTED_CLASS = 'al-inspected-element'
const PRESSED_CLASS = 'al-pressed'

function buildStyleBlock(props: Partial<ButtonProps>): string {
  const rules: string[] = []

  if (props.focusRingEnabled) {
    const width = props.focusRingWidth
      ? formatLength(props.focusRingWidth)
      : '2px'
    const color = props.focusRingColor ?? '#1d4ed8'
    const offset = props.focusRingOffset
      ? formatLength(props.focusRingOffset)
      : '2px'
    rules.push(
      `.${INSPECTED_CLASS}:focus-visible{outline:${width} solid ${color};outline-offset:${offset};}`
    )
  }

  // Pressed-state tint — a translucent inset overlay reads as "pressed"
  // regardless of what bg/fg colours the student has chosen.
  if (isToggleable(props)) {
    rules.push(
      `.${INSPECTED_CLASS}.${PRESSED_CLASS}{box-shadow:inset 0 0 0 999px rgb(0 0 0 / 0.18);}`
    )
  }

  return rules.length ? `<style>${rules.join('')}</style>` : ''
}

function isToggleable(props: Partial<ButtonProps>): boolean {
  return props.toggleBehaviour != null && props.toggleBehaviour !== 'none'
}

function buildElementClass(props: Partial<ButtonProps>): string | null {
  const tokens: string[] = []
  if (props.focusRingEnabled) tokens.push(INSPECTED_CLASS)
  if (isToggleable(props) && props.togglePressed) {
    if (!tokens.includes(INSPECTED_CLASS)) tokens.push(INSPECTED_CLASS)
    tokens.push(PRESSED_CLASS)
  }
  return tokens.length ? tokens.join(' ') : null
}

function withInspectedClass(
  extraAttrs: string[],
  props: Partial<ButtonProps>
): string[] {
  const cls = buildElementClass(props)
  if (!cls) return extraAttrs
  return [`class="${cls}"`, ...extraAttrs]
}

function toggleAttrs(props: Partial<ButtonProps>): string[] {
  if (!isToggleable(props)) return []
  const pressed = props.togglePressed === true
  switch (props.toggleBehaviour) {
    case 'aria-pressed':
      return [`aria-pressed="${pressed}"`]
    case 'aria-checked':
      return [`aria-checked="${pressed}"`]
    case 'visual-only':
      return []
    default:
      return []
  }
}

function formatLength(length: CssLength): string {
  return `${length.value}${length.unit}`
}

function resolveSide(
  explicit: CssLength | undefined,
  shorthand: CssLength | undefined
): CssLength {
  return explicit ?? shorthand ?? { value: 0, unit: 'px' }
}

function buildInlineStyle(props: Partial<ButtonProps>): string {
  const declarations: string[] = []

  if (props.bg) declarations.push(`background:${props.bg}`)
  if (props.fgText) declarations.push(`color:${props.fgText}`)
  if (props.width) declarations.push(`width:${formatLength(props.width)}`)
  if (props.height) declarations.push(`height:${formatLength(props.height)}`)
  if (props.fontSize) {
    declarations.push(`font-size:${formatLength(props.fontSize)}`)
  }

  const hasIndividualPadding
    = props.paddingTop != null
      || props.paddingRight != null
      || props.paddingBottom != null
      || props.paddingLeft != null

  if (hasIndividualPadding) {
    const top = resolveSide(props.paddingTop, props.padding)
    const right = resolveSide(props.paddingRight, props.padding)
    const bottom = resolveSide(props.paddingBottom, props.padding)
    const left = resolveSide(props.paddingLeft, props.padding)
    declarations.push(
      `padding:${formatLength(top)} ${formatLength(right)} ${formatLength(bottom)} ${formatLength(left)}`
    )
  } else if (props.padding != null) {
    declarations.push(`padding:${formatLength(props.padding)}`)
  }

  const hasIndividualBorder
    = props.borderTopWidth != null
      || props.borderRightWidth != null
      || props.borderBottomWidth != null
      || props.borderLeftWidth != null

  if (hasIndividualBorder) {
    const top = resolveSide(props.borderTopWidth, props.borderWidth)
    const right = resolveSide(props.borderRightWidth, props.borderWidth)
    const bottom = resolveSide(props.borderBottomWidth, props.borderWidth)
    const left = resolveSide(props.borderLeftWidth, props.borderWidth)
    declarations.push(
      `border-top-width:${formatLength(top)}`,
      `border-right-width:${formatLength(right)}`,
      `border-bottom-width:${formatLength(bottom)}`,
      `border-left-width:${formatLength(left)}`,
      `border-style:solid`
    )
  } else if (props.borderWidth != null && props.borderWidth.value > 0) {
    declarations.push(
      `border-width:${formatLength(props.borderWidth)}`,
      'border-style:solid'
    )
  }

  const hasAnyBorder
    = hasIndividualBorder
      || (props.borderWidth != null && props.borderWidth.value > 0)
  if (props.borderColor && hasAnyBorder) {
    declarations.push(`border-color:${props.borderColor}`)
  }

  return declarations.join(';')
}

function renderNativeButton(
  props: Partial<ButtonProps>,
  style: string,
  explicitType: string | undefined
): string {
  const label = escapeHtml(props.label ?? DEFAULT_LABEL)
  const content
    = props.contentType === 'icon'
      ? '<span aria-hidden="true">&#128269;</span>'
      : label

  const attrs: string[] = []
  if (explicitType) attrs.push(`type="${explicitType}"`)
  if (props.name) attrs.push(`name="${escapeAttribute(props.name)}"`)
  if (props.value) attrs.push(`value="${escapeAttribute(props.value)}"`)
  if (props.ariaLabel) {
    attrs.push(`aria-label="${escapeAttribute(props.ariaLabel)}"`)
  }
  attrs.push(...toggleAttrs(props))
  if (props.disabled) attrs.push('disabled')
  if (style) attrs.push(`style="${style}"`)

  return `<button ${withInspectedClass(attrs, props).join(' ')}>${content}</button>`
}

function renderInputButton(
  type: string,
  props: Partial<ButtonProps>,
  style: string
): string {
  const value = props.label ?? ''

  const attrs: string[] = [`type="${type}"`]
  if (props.name) attrs.push(`name="${escapeAttribute(props.name)}"`)
  if (value) attrs.push(`value="${escapeAttribute(value)}"`)
  if (props.ariaLabel) {
    attrs.push(`aria-label="${escapeAttribute(props.ariaLabel)}"`)
  }
  if (props.disabled) attrs.push('disabled')
  if (style) attrs.push(`style="${style}"`)

  return `<input ${withInspectedClass(attrs, props).join(' ')}>`
}

function renderInputImage(props: Partial<ButtonProps>, style: string): string {
  const attrs: string[] = [`type="image"`]
  if (props.src) attrs.push(`src="${escapeAttribute(props.src)}"`)
  if (props.alt) attrs.push(`alt="${escapeAttribute(props.alt)}"`)
  if (props.name) attrs.push(`name="${escapeAttribute(props.name)}"`)
  if (props.value) attrs.push(`value="${escapeAttribute(props.value)}"`)
  if (props.ariaLabel) {
    attrs.push(`aria-label="${escapeAttribute(props.ariaLabel)}"`)
  }
  if (props.disabled) attrs.push('disabled')
  if (style) attrs.push(`style="${style}"`)

  return `<input ${withInspectedClass(attrs, props).join(' ')}>`
}

export function renderButton(props?: Partial<ButtonProps>): string {
  if (!props) return `<button>${DEFAULT_LABEL}</button>`

  const style = buildInlineStyle(props)
  const styleBlock = buildStyleBlock(props)
  const renderAs = props.renderAs ?? 'button'

  let element: string
  if (renderAs === 'input-image') {
    element = renderInputImage(props, style)
  } else {
    const inputType = INPUT_TYPE_BY_RENDER_AS[renderAs]
    if (inputType) {
      element = renderInputButton(inputType, props, style)
    } else {
      const explicitButtonType = BUTTON_TYPE_BY_RENDER_AS[renderAs]
      element = renderNativeButton(props, style, explicitButtonType)
    }
  }

  return `${styleBlock}${element}`
}
