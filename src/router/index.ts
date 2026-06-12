import { createRouter, createWebHistory } from 'vue-router'
import DebugView from '../views/DebugView.vue'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'debug',
      component: DebugView
    },
    {
      path: '/home',
      name: 'home',
      component: HomeView
    }
  ]
})

// Helper function to identify game pages that require pause management
const isGamePage = (path: string): boolean => {
  return path === '/' || path === '/home'
}

// Navigation guards for automatic game pause/resume
router.beforeEach(async (_to, from) => {
  // Auto-pause when leaving game pages
  if (isGamePage(from.path)) {
    try {
      // Dynamic import to avoid circular dependency during router setup
      const { useGameController } = await import('../stores/gameController')
      const gameController = useGameController()

      if (gameController.isGameActive) {
        gameController.pauseGame('navigation')
      }
    } catch (error) {
      console.warn('Failed to pause game on navigation:', error)
    }
  }
})

router.afterEach(async (to) => {
  // Auto-pause when entering game pages
  if (isGamePage(to.path)) {
    try {
      // Dynamic import to avoid circular dependency during router setup
      const { useGameController } = await import('../stores/gameController')
      const gameController = useGameController()

      // Always pause when entering game pages - user must manually resume
      gameController.pauseGame('navigation')
    } catch (error) {
      console.warn('Failed to pause game on page entry:', error)
    }
  }
})

export default router