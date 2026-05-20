import { useLocalStorage, usePreferredDark } from '@vueuse/core'

type Mode = 'light' | 'dark'
type Contrast = 'normal' | 'high'

export const useTheme = defineStore('theme', () => {
  const mode = useLocalStorage<Mode>('al-theme', 'light')
  const contrast = useLocalStorage<Contrast>('al-contrast', 'normal')

  const systemDark = usePreferredDark()
  if (import.meta.client && !localStorage.getItem('al-theme')) {
    mode.value = systemDark.value ? 'dark' : 'light'
  }

  watchEffect(() => {
    if (!import.meta.client) return
    const html = document.documentElement
    html.classList.toggle('light', mode.value === 'light')
    html.classList.toggle('dark', mode.value === 'dark')
    html.classList.toggle('theme-dark', mode.value === 'dark')
    html.classList.toggle('theme-light', mode.value === 'light')
    html.classList.toggle('theme-high-contrast', contrast.value === 'high')
  })

  function toggleMode() {
    mode.value = mode.value === 'light' ? 'dark' : 'light'
  }

  function toggleContrast() {
    contrast.value = contrast.value === 'normal' ? 'high' : 'normal'
  }

  const isDark = computed(() => mode.value === 'dark')
  const isHighContrast = computed(() => contrast.value === 'high')

  return {
    mode,
    contrast,
    toggleMode,
    toggleContrast,
    isDark,
    isHighContrast
  }
})
