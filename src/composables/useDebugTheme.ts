import { watch, onMounted, onUnmounted } from 'vue'
import { useThemeStore } from '../stores/themeStore'

/**
 * Applies the debug light/dark theme as data-theme on <html> while the
 * consuming view (DebugView) is mounted, and removes it on unmount so
 * the game routes always render in the default light theme.
 */
export function useDebugTheme() {
  const themeStore = useThemeStore()

  function apply() {
    if (themeStore.debugTheme === 'dark') {
      document.documentElement.dataset.theme = 'dark'
    } else {
      delete document.documentElement.dataset.theme
    }
  }

  watch(() => themeStore.debugTheme, apply)

  onMounted(apply)

  onUnmounted(() => {
    delete document.documentElement.dataset.theme
  })

  return { themeStore }
}
