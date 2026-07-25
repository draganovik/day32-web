import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import { createAppRouter } from './router'
import { useAccountsStore } from './stores/accounts'
import './styles/main.css'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
useAccountsStore(pinia).restoreSessions()

const router = createAppRouter(pinia)
app.use(router)
app.mount('#app')
