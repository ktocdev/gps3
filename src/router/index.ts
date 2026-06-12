import { createRouter, createWebHistory } from 'vue-router'
import GameShellView from '../views/GameShellView.vue'
import PlayView from '../views/PlayView.vue'
import StoreView from '../views/StoreView.vue'
import DebugView from '../views/DebugView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: GameShellView,
      children: [
        {
          path: '',
          name: 'play',
          component: PlayView
        },
        {
          path: 'store',
          name: 'store',
          component: StoreView
        }
      ]
    },
    {
      path: '/debug',
      name: 'debug',
      component: DebugView
    },
    {
      path: '/home',
      redirect: '/'
    }
  ]
})

// Helper function to identify game pages that require pause management
const isGamePage = (path: string): boolean => {
  return path === '/'
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
