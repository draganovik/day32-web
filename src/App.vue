<script setup lang="ts">
import { LoaderCircle, WifiOff } from '@lucide/vue'
import { Analytics } from '@vercel/analytics/vue'
import { RouterView } from 'vue-router'

import PwaUpdatePrompt from '@/components/PwaUpdatePrompt.vue'
import { useOnlineStatus } from '@/composables/useOnlineStatus'
import { useAccountsStore } from '@/stores/accounts'
import { usePreferencesStore } from '@/stores/preferences'

usePreferencesStore()
const accounts = useAccountsStore()
const { isOnline } = useOnlineStatus()
</script>

<template>
  <div class="min-h-screen bg-background text-foreground">
    <Transition name="notice">
      <div
        v-if="!isOnline"
        class="fixed top-3 left-1/2 z-80 flex w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 items-center justify-center gap-2 rounded-lg border border-amber-600/20 bg-amber-600 px-4 py-2.5 text-center text-sm font-medium text-white shadow-lg"
        role="status"
      >
        <WifiOff class="size-4 shrink-0" aria-hidden="true" />
        You’re offline. Calendar changes are paused.
      </div>
    </Transition>

    <RouterView v-slot="{ Component }">
      <Transition name="page" mode="out-in">
        <component :is="Component" />
      </Transition>
    </RouterView>

    <Transition name="notice">
      <div
        v-if="accounts.status === 'disconnecting'"
        class="fixed inset-0 z-150 grid place-items-center bg-background/95 backdrop-blur-sm"
        role="status"
        aria-live="polite"
      >
        <div class="flex flex-col items-center gap-3 text-center">
          <LoaderCircle class="size-6 animate-spin text-primary" aria-hidden="true" />
          <p class="text-sm font-medium">Disconnecting Google…</p>
        </div>
      </div>
    </Transition>

    <PwaUpdatePrompt />
    <Analytics />
  </div>
</template>
