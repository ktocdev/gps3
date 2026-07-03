import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import router from './router'
import App from './App.vue'

// Import base styles
import './styles/base.css'
import './styles/utilities.css'
import './styles/panel.css'
import './styles/stats.css'
import './styles/dialogs.css'
import './styles/forms.css'
import './styles/alerts.css'
import './styles/game-view.css'
import './styles/storefront.css'
import './styles/activity-feed.css'
import './styles/debug.css'
import './styles/chrome/primitives.css'
import './styles/chrome/bars.css'
import './styles/chrome/panels.css'
import './styles/chrome/fab.css'

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

const app = createApp(App)
app.use(pinia)
app.use(router)
app.mount('#app')