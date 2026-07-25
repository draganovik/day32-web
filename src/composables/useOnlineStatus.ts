import { onMounted, onUnmounted, shallowRef } from 'vue'

export function useOnlineStatus() {
  const isOnline = shallowRef(navigator.onLine)

  const update = () => {
    isOnline.value = navigator.onLine
  }

  onMounted(() => {
    window.addEventListener('online', update)
    window.addEventListener('offline', update)
  })

  onUnmounted(() => {
    window.removeEventListener('online', update)
    window.removeEventListener('offline', update)
  })

  return { isOnline }
}
