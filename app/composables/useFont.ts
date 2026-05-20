import { useLocalStorage } from '@vueuse/core'

type FontSize = '14px' | '16px' | '18px' | '21px'

const defaultFont = 'OpenDyslexicRegular'
const defaultSize: FontSize = '16px'

export const useFont = defineStore('font', () => {
  const family = useLocalStorage<string>('al-font-family', defaultFont)
  const size = useLocalStorage<FontSize>('al-font-size', defaultSize)

  watchEffect(() => {
    if (!import.meta.client) return
    const html = document.documentElement
    html.style.setProperty('--al-font', family.value)
    html.style.setProperty('--al-base-size', size.value)
  })

  function setFont(f: string) {
    family.value = f
  }

  function setSize(s: FontSize) {
    size.value = s
  }

  return {
    family,
    size,
    setFont,
    setSize
  }
})
