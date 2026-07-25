<script setup lang="ts">
import { CalendarCheck2, CircleAlert, LoaderCircle, Plus, RotateCcw, Trash2 } from '@lucide/vue'
import { computed, onMounted, shallowRef } from 'vue'

import AppBar from '@/components/AppBar.vue'
import BaseModal from '@/components/BaseModal.vue'
import EventCard from '@/components/EventCard.vue'
import EventEditorModal from '@/components/EventEditorModal.vue'
import type { CalendarEvent, CalendarEventDraft } from '@/domain/calendar'
import { useAccountsStore } from '@/stores/accounts'
import { useCalendarStore } from '@/stores/calendar'
import { formatEventDate, formatEventTime } from '@/utils/date'

interface EventGroup {
  key: string
  label: string
  events: CalendarEvent[]
}

const accounts = useAccountsStore()
const calendar = useCalendarStore()
const editorOpen = shallowRef(false)
const selectedEvent = shallowRef<CalendarEvent>()
const editorError = shallowRef<string>()
const pendingDeleteEvent = shallowRef<CalendarEvent>()
const deleteError = shallowRef<string>()
const deleteBusy = shallowRef(false)

const isBusy = computed(() => calendar.status === 'saving')
const todayLabel = new Intl.DateTimeFormat(undefined, {
  weekday: 'long',
  month: 'long',
  day: 'numeric',
}).format(new Date())

const eventSummary = computed(() => {
  const count = calendar.upcomingEvents.length
  if (count === 0) return 'No upcoming events'
  return `${count} upcoming ${count === 1 ? 'event' : 'events'}`
})

const eventGroups = computed<EventGroup[]>(() => {
  const groups: EventGroup[] = []

  for (const event of calendar.upcomingEvents) {
    const key = eventDateKey(event)
    const existing = groups.at(-1)

    if (existing?.key === key) {
      existing.events.push(event)
      continue
    }

    groups.push({
      key,
      label: formatEventDate(event.start, event.allDay),
      events: [event],
    })
  }

  return groups
})

onMounted(async () => {
  const connectionId = accounts.activeConnectionId
  if (connectionId && calendar.calendars.length === 0) {
    try {
      await calendar.loadConnection(connectionId)
    } catch {
      // The store exposes the error state.
    }
  }
})

function eventDateKey(event: CalendarEvent): string {
  if (event.allDay) return event.start.slice(0, 10)

  const date = new Date(event.start)
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-')
}

function createEvent(): void {
  selectedEvent.value = undefined
  editorError.value = undefined
  editorOpen.value = true
}

function editEvent(event: CalendarEvent): void {
  selectedEvent.value = event
  editorError.value = undefined
  editorOpen.value = true
}

function closeEditor(): void {
  if (isBusy.value) return
  editorOpen.value = false
  selectedEvent.value = undefined
  editorError.value = undefined
}

async function saveEvent(draft: CalendarEventDraft): Promise<void> {
  editorError.value = undefined
  try {
    if (selectedEvent.value) {
      await calendar.updateEvent(selectedEvent.value.id, draft)
    } else {
      await calendar.createEvent(draft)
    }
    closeEditor()
  } catch (error) {
    editorError.value = error instanceof Error ? error.message : 'The event could not be saved.'
  }
}

function requestDelete(event: CalendarEvent): void {
  pendingDeleteEvent.value = event
  deleteError.value = undefined
}

function closeDeleteConfirmation(): void {
  if (deleteBusy.value) return
  pendingDeleteEvent.value = undefined
  deleteError.value = undefined
}

async function confirmDelete(): Promise<void> {
  const event = pendingDeleteEvent.value
  if (!event) return

  deleteBusy.value = true
  deleteError.value = undefined

  try {
    await calendar.deleteEvent(event)
    pendingDeleteEvent.value = undefined
    deleteError.value = undefined
  } catch (error) {
    deleteError.value = error instanceof Error ? error.message : 'The event could not be deleted.'
  } finally {
    deleteBusy.value = false
  }
}
</script>

<template>
  <main class="min-h-screen pb-24 sm:pb-12">
    <AppBar />

    <div class="mx-auto w-full max-w-4xl px-4 sm:px-6">
      <section class="border-b border-border py-8 sm:py-12">
        <p class="text-sm font-medium text-primary">{{ todayLabel }}</p>
        <div class="mt-2 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 class="text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">Upcoming</h1>
            <p class="mt-2 text-sm text-muted-foreground">{{ eventSummary }}</p>
          </div>

          <div class="flex items-center gap-2">
            <div
              class="inline-flex h-10 min-w-0 items-center gap-2 rounded-lg border border-border bg-card px-3 text-sm shadow-xs"
            >
              <span
                class="size-2.5 shrink-0 rounded-full"
                :style="{ backgroundColor: calendar.selectedCalendar?.color ?? 'var(--primary)' }"
                aria-hidden="true"
              />
              <span class="max-w-44 truncate">
                {{ calendar.selectedCalendar?.name ?? 'Calendar' }}
              </span>
            </div>
            <button
              class="hidden h-10 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 sm:inline-flex"
              type="button"
              @click="createEvent"
            >
              <Plus class="size-4" aria-hidden="true" />
              New event
            </button>
          </div>
        </div>
      </section>

      <section class="py-8" aria-live="polite">
        <div
          v-if="calendar.status === 'loading' && calendar.events.length === 0"
          class="mx-auto grid max-w-3xl gap-8"
          aria-label="Loading calendar"
        >
          <div v-for="group in 2" :key="group" class="grid gap-4 sm:grid-cols-[9rem_1fr] sm:gap-8">
            <div class="h-5 w-24 animate-pulse rounded-md bg-muted" />
            <div class="space-y-3">
              <div
                v-for="card in group === 1 ? 2 : 1"
                :key="card"
                class="h-28 animate-pulse rounded-xl border border-border bg-card"
              />
            </div>
          </div>
        </div>

        <div
          v-else-if="calendar.errorMessage && calendar.events.length === 0"
          class="mx-auto flex min-h-[48vh] max-w-md flex-col items-center justify-center text-center"
        >
          <span
            class="flex size-12 items-center justify-center rounded-2xl bg-destructive/10 text-destructive"
          >
            <CircleAlert class="size-5" aria-hidden="true" />
          </span>
          <h2 class="mt-5 text-lg font-semibold">Calendar unavailable</h2>
          <p class="mt-2 text-sm leading-6 text-muted-foreground">{{ calendar.errorMessage }}</p>
          <button
            class="mt-5 inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-input bg-card px-4 text-sm font-medium shadow-xs transition-colors hover:bg-accent hover:text-accent-foreground"
            type="button"
            @click="calendar.refresh"
          >
            <RotateCcw class="size-4" aria-hidden="true" />
            Try again
          </button>
        </div>

        <div
          v-else-if="calendar.upcomingEvents.length === 0"
          class="mx-auto flex min-h-[48vh] max-w-md flex-col items-center justify-center text-center"
        >
          <span
            class="flex size-12 items-center justify-center rounded-2xl bg-accent text-accent-foreground"
          >
            <CalendarCheck2 class="size-5" aria-hidden="true" />
          </span>
          <h2 class="mt-5 text-lg font-semibold">Your calendar is clear</h2>
          <p class="mt-2 text-sm leading-6 text-muted-foreground">
            Nothing upcoming in {{ calendar.selectedCalendar?.name }}. Add an event when you’re
            ready.
          </p>
          <button
            class="mt-5 inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
            type="button"
            @click="createEvent"
          >
            <Plus class="size-4" aria-hidden="true" />
            New event
          </button>
        </div>

        <div v-else class="mx-auto max-w-3xl space-y-9">
          <section
            v-for="group in eventGroups"
            :key="group.key"
            class="grid gap-3 sm:grid-cols-[9rem_minmax(0,1fr)] sm:gap-8"
          >
            <div class="sm:pt-4">
              <h2 class="text-sm font-semibold tracking-tight">{{ group.label }}</h2>
              <p class="mt-1 text-xs text-muted-foreground">
                {{ group.events.length }} {{ group.events.length === 1 ? 'event' : 'events' }}
              </p>
            </div>

            <ol class="space-y-3">
              <EventCard
                v-for="event in group.events"
                :key="`${event.connectionId}:${event.calendarId}:${event.id}`"
                :event="event"
                @select="editEvent"
                @delete="requestDelete"
              />
            </ol>
          </section>
        </div>

        <p
          v-if="calendar.errorMessage && calendar.events.length > 0"
          class="mt-6 flex items-start gap-2 rounded-lg border border-destructive/20 bg-destructive/8 px-3 py-2.5 text-sm text-destructive"
          role="alert"
        >
          <CircleAlert class="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          {{ calendar.errorMessage }}
        </p>
      </section>
    </div>

    <button
      class="fixed right-4 bottom-[max(1rem,env(safe-area-inset-bottom))] z-30 inline-flex h-11 items-center justify-center gap-2 rounded-full bg-primary px-5 text-sm font-medium text-primary-foreground shadow-lg shadow-primary/25 transition-transform hover:-translate-y-0.5 sm:hidden"
      type="button"
      @click="createEvent"
    >
      <Plus class="size-4" aria-hidden="true" />
      New event
    </button>

    <EventEditorModal
      v-if="calendar.selectedCalendar"
      :open="editorOpen"
      :calendar-id="calendar.selectedCalendar.id"
      :event="selectedEvent"
      :busy="isBusy"
      :error-message="editorError"
      @close="closeEditor"
      @save="saveEvent"
    />

    <BaseModal
      :open="Boolean(pendingDeleteEvent)"
      title="Delete event?"
      description="This action removes the event from Google Calendar and cannot be undone."
      size="sm"
      @close="closeDeleteConfirmation"
    >
      <div v-if="pendingDeleteEvent">
        <div class="rounded-xl border border-border bg-muted/45 p-4">
          <p class="font-medium">{{ pendingDeleteEvent.title }}</p>
          <p class="mt-1 text-sm text-muted-foreground">
            {{
              formatEventTime(
                pendingDeleteEvent.start,
                pendingDeleteEvent.end,
                pendingDeleteEvent.allDay,
              )
            }}
            · {{ formatEventDate(pendingDeleteEvent.start, pendingDeleteEvent.allDay) }}
          </p>
        </div>

        <p
          v-if="deleteError"
          class="mt-4 rounded-lg border border-destructive/20 bg-destructive/8 px-3 py-2.5 text-sm text-destructive"
          role="alert"
        >
          {{ deleteError }}
        </p>

        <div class="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            class="inline-flex h-10 items-center justify-center rounded-lg border border-input bg-background px-4 text-sm font-medium shadow-xs transition-colors hover:bg-accent hover:text-accent-foreground disabled:cursor-not-allowed disabled:opacity-60"
            type="button"
            :disabled="deleteBusy"
            @click="closeDeleteConfirmation"
          >
            Cancel
          </button>
          <button
            class="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-destructive px-4 text-sm font-medium text-destructive-foreground shadow-sm transition-colors hover:bg-destructive/90 disabled:cursor-wait disabled:opacity-60"
            type="button"
            :disabled="deleteBusy"
            @click="confirmDelete"
          >
            <LoaderCircle v-if="deleteBusy" class="size-4 animate-spin" aria-hidden="true" />
            <Trash2 v-else class="size-4" aria-hidden="true" />
            {{ deleteBusy ? 'Deleting…' : 'Delete event' }}
          </button>
        </div>
      </div>
    </BaseModal>
  </main>
</template>
