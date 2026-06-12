import { defineStore } from 'pinia'
import { ref } from 'vue'

export type DebugTheme = 'light' | 'dark'
export type ChromeTheme = 'default' | 'low-stim'

/**
 * Theme state for the two independent theming axes:
 * - debugTheme: light/dark for the debug dashboard only (applied as
 *   data-theme on <html> while DebugView is mounted)
 * - chromeTheme: game chrome theme (applied as data-chrome-theme on <html>,
 *   e.g. 'low-stim' for the low-stimulation mode)
 */
export const useThemeStore = defineStore('theme', () => {
  const debugTheme = ref<DebugTheme>('light')
  const chromeTheme = ref<ChromeTheme>('default')

  function toggleDebugTheme() {
    debugTheme.value = debugTheme.value === 'light' ? 'dark' : 'light'
  }

  function setChromeTheme(theme: ChromeTheme) {
    chromeTheme.value = theme
  }

  return {
    debugTheme,
    chromeTheme,
    toggleDebugTheme,
    setChromeTheme
  }
}, {
  persist: true
})
