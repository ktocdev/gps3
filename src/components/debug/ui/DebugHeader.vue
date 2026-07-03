<template>
  <header class="dbg-header">
    <div class="dbg-header__awning"></div>
    <div class="dbg-header__row">
      <div>
        <h1 class="dbg-header__title">🔧 GPS3 Debug Dashboard</h1>
        <p class="dbg-header__subtitle">Development &amp; testing interface · auto-paused on entry</p>
      </div>

      <div class="dbg-header__util">
        <span class="dbg-pill" :class="{ 'dbg-pill--paused': gameController.isPaused }">
          <span class="dbg-pill__dot"></span>
          {{ gameController.isPaused ? 'Paused' : 'Live' }}
        </span>

        <Button
          size="sm"
          :title="themeStore.debugTheme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'"
          @click="themeStore.toggleDebugTheme()"
        >
          {{ themeStore.debugTheme === 'dark' ? '☀️ Light' : '🌙 Dark' }}
        </Button>

        <Button size="sm" title="Clear all storage and reload" @click="clearAllStorage">
          ✨ Clear Storage
        </Button>

        <Button size="sm" title="Back to game" @click="router.push('/')">
          ← Back to game
        </Button>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import Button from '../../basic/Button.vue'
import { useGameController } from '../../../stores/gameController'
import { useHabitatConditions } from '../../../stores/habitatConditions'
import { useGuineaPigStore } from '../../../stores/guineaPigStore'
import { useGameTimingStore } from '../../../stores/gameTimingStore'
import { useThemeStore } from '../../../stores/themeStore'

const router = useRouter()
const gameController = useGameController()
const habitatConditions = useHabitatConditions()
const guineaPigStore = useGuineaPigStore()
const gameTimingStore = useGameTimingStore()
const themeStore = useThemeStore()

const clearAllStorage = () => {
  if (confirm('⚠️ This will clear ALL storage (localStorage + sessionStorage) and reload the page. Continue?')) {
    try {
      // Stop game loop and timers first so nothing writes state mid-clear
      gameTimingStore.stopGameLoop()
      if (gameController.isGameActive) {
        gameController.stopGame()
      }

      habitatConditions.habitatItems = []
      habitatConditions.itemPositions.clear()
      habitatConditions.poops = []
      habitatConditions.guineaPigPositions.clear()
      habitatConditions.bowlContents.clear()
      habitatConditions.hayRackContents.clear()

      guineaPigStore.activeGuineaPigs.forEach(gp => {
        guineaPigStore.deleteGuineaPig(gp.id)
      })

      localStorage.clear()
      sessionStorage.clear()

      setTimeout(() => {
        window.location.reload()
      }, 100)
    } catch (error) {
      console.error('Error clearing storage:', error)
      localStorage.clear()
      sessionStorage.clear()
      window.location.reload()
    }
  }
}
</script>
