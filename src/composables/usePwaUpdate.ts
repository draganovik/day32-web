import { onMounted, shallowRef } from 'vue'

const needRefresh = shallowRef(false)
const offlineReady = shallowRef(false)
let registration: ServiceWorkerRegistration | undefined
let reloading = false
let registered = false

export function usePwaUpdate() {
  onMounted(() => {
    if (!registered) {
      registered = true
      void registerServiceWorker()
    }
  })

  function applyUpdate(): void {
    registration?.waiting?.postMessage({ type: 'SKIP_WAITING' })
  }

  function closePrompt(): void {
    needRefresh.value = false
    offlineReady.value = false
  }

  return {
    needRefresh,
    offlineReady,
    applyUpdate,
    closePrompt,
  }
}

async function registerServiceWorker(): Promise<void> {
  if (!('serviceWorker' in navigator) || !import.meta.env.PROD) return

  window.addEventListener('load', async () => {
    registration = await navigator.serviceWorker.register('/sw.js')

    if (registration.waiting) {
      needRefresh.value = true
    }

    registration.addEventListener('updatefound', () => {
      const worker = registration?.installing
      if (!worker) return

      worker.addEventListener('statechange', () => {
        if (worker.state !== 'installed') return

        if (navigator.serviceWorker.controller) {
          needRefresh.value = true
        } else {
          offlineReady.value = true
        }
      })
    })

    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (reloading) return
      reloading = true
      window.location.reload()
    })

    window.setInterval(
      () => {
        void registration?.update()
      },
      60 * 60 * 1000,
    )
  })
}
