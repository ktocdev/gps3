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

// Play/pause is a property of the simulation, not the current route — the sim
// keeps whatever state the player set as they move between Live Mode, the
// Supplies Store, and Debug. (Window-hidden/orientation auto-pauses still apply
// elsewhere; those aren't navigation-driven.)

export default router
