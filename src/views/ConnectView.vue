<script setup lang="ts">
import { CalendarDays, Check, LockKeyhole } from '@lucide/vue'
import { useRouter } from 'vue-router'

import { useAccountsStore } from '@/stores/accounts'
import { useCalendarStore } from '@/stores/calendar'

const accounts = useAccountsStore()
const calendar = useCalendarStore()
const router = useRouter()

async function connectGoogle(): Promise<void> {
  try {
    const connection = await accounts.connect('google')
    await calendar.loadConnection(connection.id)
    await router.replace({ name: 'home' })
  } catch {
    // Stores expose the reader-facing error.
  }
}
</script>

<template>
  <main class="relative isolate grid min-h-screen place-items-center overflow-hidden px-4 py-10">
    <div
      class="pointer-events-none absolute inset-x-0 top-0 -z-10 h-80 bg-[radial-gradient(ellipse_at_top,color-mix(in_oklab,var(--primary)_14%,transparent),transparent_65%)]"
    />

    <section
      class="grid w-full max-w-5xl overflow-hidden rounded-3xl border border-border bg-card shadow-[0_24px_80px_-32px_rgb(20_20_35_/_0.28)] lg:grid-cols-[1.05fr_0.95fr]"
    >
      <div
        class="relative hidden overflow-hidden bg-primary p-10 text-primary-foreground lg:flex lg:flex-col"
      >
        <div
          class="absolute -top-28 -right-28 size-80 rounded-full border border-white/15 bg-white/5"
        />
        <div
          class="absolute right-20 -bottom-32 size-72 rounded-full border border-white/10 bg-black/5"
        />

        <div class="relative flex items-center gap-3">
          <span
            class="flex size-10 items-center justify-center rounded-xl border border-white/15 bg-white/10"
          >
            <CalendarDays class="size-5" aria-hidden="true" />
          </span>
          <span class="text-sm font-semibold tracking-wide">Day32 - Calendar &amp; Events</span>
        </div>

        <div class="relative my-auto py-16">
          <p class="mb-4 text-sm font-medium text-primary-foreground/70">Your day, in focus</p>
          <h1 class="max-w-md text-4xl leading-[1.08] font-semibold tracking-[-0.04em]">
            A calmer way to manage what comes next.
          </h1>
          <p class="mt-5 max-w-md text-base leading-7 text-primary-foreground/75">
            Day32 brings your upcoming calendar into one clean, focused agenda without creating a
            second copy of your data.
          </p>
        </div>

        <div class="relative flex items-center gap-2 text-xs text-primary-foreground/70">
          <LockKeyhole class="size-3.5" aria-hidden="true" />
          Direct browser connection · No Day32 calendar database
        </div>
      </div>

      <div class="p-6 sm:p-10 lg:p-12">
        <div class="flex items-center gap-3 lg:hidden">
          <span class="flex size-10 items-center justify-center rounded-xl bg-primary text-white">
            <CalendarDays class="size-5" aria-hidden="true" />
          </span>
          <span class="font-semibold">Day32 - Calendar &amp; Events</span>
        </div>

        <div class="mt-12 lg:mt-10">
          <h2 class="text-3xl font-semibold tracking-[-0.035em]">Connect your calendar</h2>
          <p class="mt-3 text-sm leading-6 text-muted-foreground">
            Use your Google account to open the agenda. You’ll approve the exact permissions on
            Google’s consent screen.
          </p>
        </div>

        <ul class="my-8 space-y-3 text-sm">
          <li class="flex items-center gap-3">
            <span class="flex size-5 items-center justify-center rounded-full bg-accent">
              <Check class="size-3 text-accent-foreground" aria-hidden="true" />
            </span>
            View and manage your upcoming events
          </li>
          <li class="flex items-center gap-3">
            <span class="flex size-5 items-center justify-center rounded-full bg-accent">
              <Check class="size-3 text-accent-foreground" aria-hidden="true" />
            </span>
            Tokens remain only in this browser tab
          </li>
          <li class="flex items-center gap-3">
            <span class="flex size-5 items-center justify-center rounded-full bg-accent">
              <Check class="size-3 text-accent-foreground" aria-hidden="true" />
            </span>
            Disconnect or close the tab to clear access
          </li>
        </ul>

        <button
          class="flex h-11 w-full items-center justify-center gap-3 rounded-lg border border-input bg-card px-4 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground disabled:cursor-wait disabled:opacity-60"
          type="button"
          :disabled="accounts.status === 'connecting'"
          @click="connectGoogle"
        >
          <svg class="size-4.5" aria-hidden="true" viewBox="0 0 48 48">
            <path
              fill="#EA4335"
              d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
            />
            <path
              fill="#4285F4"
              d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
            />
            <path
              fill="#FBBC05"
              d="M10.53 28.59A14.1 14.1 0 0 1 9.77 24c0-1.6.27-3.14.76-4.59l-7.98-6.19A23.9 23.9 0 0 0 0 24c0 3.88.92 7.54 2.56 10.78z"
            />
            <path
              fill="#34A853"
              d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
            />
          </svg>
          {{ accounts.status === 'connecting' ? 'Connecting…' : 'Continue with Google' }}
        </button>

        <p
          v-if="accounts.errorMessage"
          class="mt-4 rounded-lg border border-destructive/20 bg-destructive/8 px-3 py-2.5 text-sm text-destructive"
          role="alert"
        >
          {{ accounts.errorMessage }}
        </p>

        <p class="mt-6 text-center text-xs leading-5 text-muted-foreground">
          By continuing, you agree to Google’s account consent flow. Read the
          <a
            class="font-medium text-foreground underline underline-offset-4 hover:text-primary"
            href="/privacy-policy.html"
            target="_blank"
          >
            privacy information
          </a>
          .
        </p>
        <p class="mt-3 text-center text-xs text-muted-foreground">
          Developed by
          <a
            class="font-medium text-foreground underline underline-offset-4 hover:text-primary"
            href="https://mladen.dev"
            target="_blank"
            rel="noreferrer"
          >
            mladen.dev
          </a>
        </p>
      </div>
    </section>
  </main>
</template>
