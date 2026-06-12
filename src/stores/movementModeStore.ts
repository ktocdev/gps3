/**
 * Movement Mode Store
 * Manages the guinea pig movement system (grid-based vs free movement)
 */

import { defineStore } from 'pinia'
import { ref } from 'vue'

export type MovementMode = 'grid' | 'free'

export const useMovementModeStore = defineStore('movementMode', () => {
  // State
  const mode = ref<MovementMode>('grid')
  const freeMovementSpeed = ref(300) // pixels per second (50-500 range) - 300 feels responsive

  // Actions
  function setMode(newMode: MovementMode) {
    console.log(`[Movement Mode] Switching to ${newMode} mode`)
    mode.value = newMode
  }

  function toggleMode() {
    setMode(mode.value === 'grid' ? 'free' : 'grid')
  }

  function setFreeMovementSpeed(speed: number) {
    freeMovementSpeed.value = Math.max(50, Math.min(500, speed))
  }

  return {
    mode,
    freeMovementSpeed,
    setMode,
    toggleMode,
    setFreeMovementSpeed
  }
}, {
  persist: true
})
