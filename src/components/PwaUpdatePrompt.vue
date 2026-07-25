<script setup lang="ts">
import { Download, X } from '@lucide/vue'

import { usePwaUpdate } from '@/composables/usePwaUpdate'

const { needRefresh, offlineReady, applyUpdate, closePrompt } = usePwaUpdate()
</script>

<template>
  <Transition name="notice">
    <aside
      v-if="needRefresh || offlineReady"
      class="fixed right-4 bottom-4 z-120 w-[calc(100%-2rem)] max-w-sm rounded-xl border border-border bg-popover p-4 text-popover-foreground shadow-xl"
      role="status"
    >
      <div class="flex items-start gap-3">
        <div
          class="flex size-9 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground"
        >
          <Download class="size-4" aria-hidden="true" />
        </div>
        <div class="min-w-0 flex-1">
          <p class="text-sm font-medium">
            {{ offlineReady ? 'Ready for offline launch' : 'A new version is ready' }}
          </p>
          <p class="mt-1 text-xs leading-5 text-muted-foreground">
            {{
              offlineReady
                ? 'The Day32 app shell is now available offline.'
                : 'Refresh to use the latest version of Day32.'
            }}
          </p>
        </div>
        <button
          class="inline-flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground"
          type="button"
          aria-label="Dismiss notification"
          @click="closePrompt"
        >
          <X class="size-4" aria-hidden="true" />
        </button>
      </div>

      <button
        v-if="needRefresh"
        class="mt-3 inline-flex h-9 w-full items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
        type="button"
        @click="applyUpdate"
      >
        Update now
      </button>
    </aside>
  </Transition>
</template>
