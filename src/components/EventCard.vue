<script setup lang="ts">
import { AlignLeft, Clock3, MapPin, Trash2, Users } from '@lucide/vue'
import { computed } from 'vue'

import type { CalendarEvent } from '@/domain/calendar'
import { formatEventTime } from '@/utils/date'

const props = defineProps<{
  event: CalendarEvent
}>()

const emit = defineEmits<{
  select: [event: CalendarEvent]
  delete: [event: CalendarEvent]
}>()

const visibleAttendees = computed(() =>
  props.event.attendees.filter((attendee) => !attendee.isSelf),
)
const descriptionPreview = computed(() => {
  const description = props.event.description?.trim()
  if (!description) return undefined
  return description.length > 72 ? `${description.slice(0, 69)}…` : description
})

function requestDelete(): void {
  emit('delete', props.event)
}
</script>

<template>
  <li
    class="group relative flex overflow-hidden rounded-xl border border-border bg-card text-card-foreground shadow-sm transition-all hover:-translate-y-px hover:border-ring/25 hover:shadow-md"
  >
    <span
      class="w-1 shrink-0"
      :style="{ backgroundColor: event.color ?? 'var(--muted-foreground)' }"
      aria-hidden="true"
    />

    <button
      class="grid min-w-0 flex-1 gap-4 p-4 text-left sm:grid-cols-[7.5rem_minmax(0,1fr)] sm:p-5"
      type="button"
      @click="emit('select', event)"
    >
      <span class="flex items-center gap-2 text-sm font-medium sm:items-start">
        <Clock3 class="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
        <span>{{ formatEventTime(event.start, event.end, event.allDay) }}</span>
      </span>

      <span class="min-w-0 pr-9">
        <span class="flex flex-wrap items-center gap-2">
          <span class="truncate text-[0.95rem] font-semibold tracking-[-0.01em]">
            {{ event.title }}
          </span>
          <span
            v-if="event.status === 'tentative'"
            class="rounded-full border border-amber-500/25 bg-amber-500/8 px-2 py-0.5 text-[0.65rem] font-medium text-amber-600"
          >
            Tentative
          </span>
        </span>

        <span
          v-if="event.location || visibleAttendees.length || descriptionPreview"
          class="mt-2.5 flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted-foreground"
        >
          <span v-if="event.location" class="inline-flex min-w-0 items-center gap-1.5">
            <MapPin class="size-3.5 shrink-0" aria-hidden="true" />
            <span class="truncate">{{ event.location }}</span>
          </span>
          <span v-if="visibleAttendees.length" class="inline-flex items-center gap-1.5">
            <Users class="size-3.5 shrink-0" aria-hidden="true" />
            {{ visibleAttendees.length }}
            {{ visibleAttendees.length === 1 ? 'guest' : 'guests' }}
          </span>
          <span v-if="descriptionPreview" class="inline-flex min-w-0 items-center gap-1.5">
            <AlignLeft class="size-3.5 shrink-0" aria-hidden="true" />
            <span class="truncate">{{ descriptionPreview }}</span>
          </span>
        </span>
      </span>
    </button>

    <button
      class="absolute top-3.5 right-3.5 inline-flex size-8 items-center justify-center rounded-md text-muted-foreground opacity-70 transition-all hover:bg-destructive/8 hover:text-destructive sm:top-4.5 sm:right-4.5 sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100"
      type="button"
      :aria-label="`Delete ${event.title}`"
      @click="requestDelete"
    >
      <Trash2 class="size-3.5" aria-hidden="true" />
    </button>
  </li>
</template>
