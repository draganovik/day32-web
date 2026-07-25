import type { Pinia } from 'pinia'
import { createRouter, createWebHistory } from 'vue-router'

import { useAccountsStore } from '@/stores/accounts'
import ConnectView from '@/views/ConnectView.vue'
import HomeView from '@/views/HomeView.vue'

export function createAppRouter(pinia: Pinia) {
  const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
      {
        path: '/',
        name: 'home',
        component: HomeView,
        meta: { requiresConnection: true },
      },
      {
        path: '/connect',
        name: 'connect',
        component: ConnectView,
      },
      {
        path: '/:pathMatch(.*)*',
        redirect: '/',
      },
    ],
  })

  router.beforeEach((to) => {
    const accounts = useAccountsStore(pinia)

    if (to.meta.requiresConnection && !accounts.activeConnection) {
      return { name: 'connect' }
    }

    if (to.name === 'connect' && accounts.activeConnection) {
      return { name: 'home' }
    }

    return true
  })

  return router
}
