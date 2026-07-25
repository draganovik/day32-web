<script setup lang="ts">
import { CalendarDays, LogOut, Monitor, Moon, RefreshCw, ShieldCheck, Sun } from '@lucide/vue'
import { computed, shallowRef } from 'vue'
import { useRouter } from 'vue-router'

import BaseModal from '@/components/BaseModal.vue'
import type { ColorScheme } from '@/stores/preferences'
import { useAccountsStore } from '@/stores/accounts'
import { useCalendarStore } from '@/stores/calendar'
import { usePreferencesStore } from '@/stores/preferences'

const accounts = useAccountsStore()
const calendar = useCalendarStore()
const preferences = usePreferencesStore()
const router = useRouter()
const menuOpen = shallowRef(false)

const accountInitial = computed(
  () => accounts.activeConnection?.account.displayName.trim().slice(0, 1).toUpperCase() || '?',
)
const isRefreshing = computed(() => calendar.status === 'loading')
const themeOptions = [
  { value: 'system', label: 'System', icon: Monitor },
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
] as const

async function refresh(): Promise<void> {
  try {
    await calendar.refresh()
  } catch {
    // The store exposes the reader-facing error.
  }
}

function chooseTheme(scheme: ColorScheme): void {
  preferences.setColorScheme(scheme)
}

async function disconnect(): Promise<void> {
  const connectionId = accounts.activeConnectionId
  if (!connectionId) return

  menuOpen.value = false
  const disconnection = accounts.disconnect(connectionId)
  calendar.clearConnection(connectionId)
  await router.replace({ name: 'connect' })
  try {
    await disconnection
  } catch {
    // Local access is already cleared even if provider revocation fails.
  }
}
</script>

<template>
  <header
    class="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur-xl supports-[backdrop-filter]:bg-background/70"
  >
    <div class="mx-auto flex h-16 w-full max-w-4xl items-center gap-3 px-4 sm:px-6">
      <div class="flex min-w-0 items-center gap-3">
        <span
          class="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm"
        >
          <CalendarDays class="size-4.5" aria-hidden="true" />
        </span>
        <div class="min-w-0">
          <p class="truncate text-sm font-semibold tracking-tight">Day32</p>
          <p class="truncate text-xs text-muted-foreground">
            {{ calendar.selectedCalendar?.name ?? 'Calendar' }}
          </p>
        </div>
      </div>

      <div class="ml-auto flex items-center gap-1.5">
        <button
          class="inline-flex size-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground disabled:cursor-wait disabled:opacity-50"
          type="button"
          :disabled="isRefreshing"
          aria-label="Refresh calendar"
          @click="refresh"
        >
          <RefreshCw class="size-4" :class="{ 'animate-spin': isRefreshing }" aria-hidden="true" />
        </button>

        <div class="mx-1 h-5 w-px bg-border" aria-hidden="true" />

        <button
          class="inline-flex size-9 items-center justify-center overflow-hidden rounded-full border border-border bg-primary text-xs font-semibold text-primary-foreground shadow-sm transition-shadow hover:ring-2 hover:ring-ring/20"
          type="button"
          aria-label="Open account settings"
          @click="menuOpen = true"
        >
          <img
            v-if="accounts.activeConnection?.account.avatarUrl"
            class="size-full object-cover"
            :src="accounts.activeConnection.account.avatarUrl"
            alt=""
            referrerpolicy="no-referrer"
          />
          <span v-else>{{ accountInitial }}</span>
        </button>
      </div>
    </div>
  </header>

  <BaseModal
    :open="menuOpen"
    title="Account settings"
    description="Manage the connected account and local appearance."
    size="sm"
    @close="menuOpen = false"
  >
    <div class="flex items-center gap-4 rounded-xl border border-border bg-muted/50 p-4">
      <div
        class="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary font-semibold text-primary-foreground"
      >
        <img
          v-if="accounts.activeConnection?.account.avatarUrl"
          class="size-full object-cover"
          :src="accounts.activeConnection.account.avatarUrl"
          alt=""
          referrerpolicy="no-referrer"
        />
        <span v-else>{{ accountInitial }}</span>
      </div>
      <div class="min-w-0">
        <p class="truncate text-sm font-semibold">
          {{ accounts.activeConnection?.account.displayName }}
        </p>
        <p class="truncate text-xs text-muted-foreground">
          {{ accounts.activeConnection?.account.email }}
        </p>
      </div>
    </div>

    <div class="mt-6">
      <div class="mb-2 flex items-center justify-between">
        <p class="text-sm font-medium">Appearance</p>
        <p class="text-xs text-muted-foreground">Saved on this device</p>
      </div>
      <div class="grid grid-cols-3 gap-2 rounded-xl bg-muted p-1.5">
        <button
          v-for="option in themeOptions"
          :key="option.value"
          class="flex h-9 items-center justify-center gap-1.5 rounded-lg text-xs font-medium transition-all"
          :class="
            preferences.colorScheme === option.value
              ? 'bg-card text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          "
          type="button"
          :aria-pressed="preferences.colorScheme === option.value"
          @click="chooseTheme(option.value)"
        >
          <component :is="option.icon" class="size-3.5" aria-hidden="true" />
          {{ option.label }}
        </button>
      </div>
    </div>

    <div class="mt-6 rounded-xl border border-border p-4">
      <div class="flex gap-3">
        <ShieldCheck class="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
        <div>
          <p class="text-sm font-medium">Private by design</p>
          <p class="mt-1 text-xs leading-5 text-muted-foreground">
            Google access stays in this tab across reloads and clears when you disconnect, close the
            tab, or the token expires.
          </p>
        </div>
      </div>
    </div>

    <button
      class="mt-6 inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-destructive/25 bg-destructive/8 px-4 text-sm font-medium text-destructive transition-colors hover:bg-destructive/12"
      type="button"
      @click="disconnect"
    >
      <LogOut class="size-4" aria-hidden="true" />
      Disconnect Google
    </button>

    <footer
      class="mt-6 flex items-center gap-4 border-t border-border pt-4 text-xs text-muted-foreground"
    >
      <span>Day32 2.0</span>
      <a
        class="ml-auto underline-offset-4 hover:text-foreground hover:underline"
        href="https://mladen.dev"
        target="_blank"
        rel="noreferrer"
      >
        Developer
      </a>
      <a
        class="underline-offset-4 hover:text-foreground hover:underline"
        href="/privacy-policy.html"
        target="_blank"
      >
        Privacy
      </a>
    </footer>
  </BaseModal>
</template>
