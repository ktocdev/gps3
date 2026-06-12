/**
 * Game View Store
 * Manages the game view mode (2D vs 3D)
 */

import { defineStore } from 'pinia'
import { ref } from 'vue'

export type GameViewMode = '2d' | '3d'

export const useGameViewStore = defineStore('gameView', () => {
  // State - default to 3D view
  const mode = ref<GameViewMode>('3d')

  // Actions
  function setMode(newMode: GameViewMode) {
    console.log(`[Game View] Switching to ${newMode} mode`)
    mode.value = newMode
  }

  function toggleMode() {
    setMode(mode.value === '2d' ? '3d' : '2d')
  }

  return {
    mode,
    setMode,
    toggleMode
  }
}, {
  persist: true
})
