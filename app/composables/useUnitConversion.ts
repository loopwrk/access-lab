import { useLocalStorage } from '@vueuse/core'

export type CssUnit = 'px' | 'rem' | 'em' | 'pt'
export type DimCssUnit = CssUnit | '%'

export function useUnitConversion() {
  const unit = useLocalStorage<CssUnit>('al-unit', 'px')
  const dimensionUnit = useLocalStorage<DimCssUnit>('al-dim-unit', 'px')

  const rootFontSizePx = ref(16)

  if (import.meta.client) {
    rootFontSizePx.value
      = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16
  }

  const unitOptions = [
    { label: 'px', value: 'px' as const },
    { label: 'rem', value: 'rem' as const },
    { label: 'em', value: 'em' as const },
    { label: 'pt', value: 'pt' as const }
  ]

  const dimensionUnitOptions = [
    { label: 'px', value: 'px' as const },
    { label: 'rem', value: 'rem' as const },
    { label: 'em', value: 'em' as const },
    { label: 'pt', value: 'pt' as const },
    { label: '%', value: '%' as const }
  ]

  function pickUnit(referencePx: number | undefined): CssUnit | DimCssUnit {
    return referencePx != null ? dimensionUnit.value : unit.value
  }

  function toDisplay(
    pxValue: number | null | undefined,
    referencePx?: number
  ): number {
    if (pxValue == null) return 0
    const base = rootFontSizePx.value
    const u = pickUnit(referencePx)
    switch (u) {
      case 'rem':
      case 'em':
        return parseFloat((pxValue / base).toFixed(3))
      case 'pt':
        return parseFloat((pxValue * 0.75).toFixed(1))
      case '%': {
        const ref = referencePx ?? 800
        return parseFloat(((pxValue / ref) * 100).toFixed(1))
      }
      default:
        return pxValue
    }
  }

  function toPx(value: number, referencePx?: number): number {
    const base = rootFontSizePx.value
    const u = pickUnit(referencePx)
    switch (u) {
      case 'rem':
      case 'em':
        return Math.round(value * base)
      case 'pt':
        return Math.round(value / 0.75)
      case '%': {
        const ref = referencePx ?? 800
        return Math.round((value / 100) * ref)
      }
      default:
        return Math.round(value)
    }
  }

  function displayStep(pxStep: number, referencePx?: number): number {
    const base = rootFontSizePx.value
    const u = pickUnit(referencePx)
    switch (u) {
      case 'rem':
      case 'em':
        return parseFloat((pxStep / base).toFixed(3))
      case 'pt':
        return parseFloat((pxStep * 0.75).toFixed(1))
      case '%': {
        const ref = referencePx ?? 800
        return parseFloat(((pxStep / ref) * 100).toFixed(1))
      }
      default:
        return pxStep
    }
  }

  return {
    unit,
    dimensionUnit,
    unitOptions,
    dimensionUnitOptions,
    rootFontSizePx,
    toDisplay,
    toPx,
    displayStep
  }
}
