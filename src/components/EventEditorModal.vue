<script setup lang="ts">
import { CalendarPlus, Check, LoaderCircle } from '@lucide/vue'
import { reactive, watch } from 'vue'

import type { CalendarEvent, CalendarEventDraft } from '@/domain/calendar'
import { EVENT_COLOR_OPTIONS } from '@/domain/calendar'
import { addDays, fromLocalDateTimeInput, toLocalDateTimeInput } from '@/utils/date'
import BaseModal from './BaseModal.vue'

const props = defineProps<{
  open: boolean
  calendarId: string
  event: CalendarEvent | undefined
  busy: boolean
  errorMessage: string | undefined
}>()

const emit = defineEmits<{
  close: []
  save: [draft: CalendarEventDraft]
}>()

interface EventForm {
  title: string
  description: string
  location: string
  allDay: boolean
  date: string
  startDateTime: string
  endDateTime: string
  color: string
}

const form = reactive<EventForm>(createEmptyForm())
const validationMessage = defineModel<string>('validationMessage', { default: '' })
const fieldClass =
  'h-10 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground shadow-xs transition-colors placeholder:text-muted-foreground/70 hover:border-ring/40 focus:border-ring disabled:cursor-not-allowed disabled:opacity-60'

watch(
  () => [props.open, props.event] as const,
  ([open]) => {
    if (!open) return
    Object.assign(form, props.event ? formFromEvent(props.event) : createEmptyForm())
    validationMessage.value = ''
  },
)

function submit(): void {
  validationMessage.value = ''
  const title = form.title.trim()

  if (!title) {
    validationMessage.value = 'Add a title before saving.'
    return
  }

  let start: string
  let end: string

  if (form.allDay) {
    if (!form.date) {
      validationMessage.value = 'Choose a date.'
      return
    }
    start = form.date
    end = addDays(form.date, 1)
  } else {
    if (!form.startDateTime || !form.endDateTime) {
      validationMessage.value = 'Choose a start and end time.'
      return
    }
    start = fromLocalDateTimeInput(form.startDateTime)
    end = fromLocalDateTimeInput(form.endDateTime)

    if (new Date(end) <= new Date(start)) {
      validationMessage.value = 'The end must be after the start.'
      return
    }
  }

  emit('save', {
    calendarId: props.calendarId,
    title,
    ...(form.description.trim() ? { description: form.description.trim() } : {}),
    ...(form.location.trim() ? { location: form.location.trim() } : {}),
    start,
    end,
    allDay: form.allDay,
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    ...(form.color ? { color: form.color } : {}),
  })
}

function createEmptyForm(): EventForm {
  const now = new Date()
  now.setSeconds(0, 0)
  const end = new Date(now.getTime() + 60 * 60 * 1000)

  return {
    title: '',
    description: '',
    location: '',
    allDay: false,
    date: toLocalDateTimeInput(now.toISOString()).slice(0, 10),
    startDateTime: toLocalDateTimeInput(now.toISOString()),
    endDateTime: toLocalDateTimeInput(end.toISOString()),
    color: EVENT_COLOR_OPTIONS[0].value,
  }
}

function formFromEvent(event: CalendarEvent): EventForm {
  return {
    title: event.title,
    description: event.description ?? '',
    location: event.location ?? '',
    allDay: event.allDay,
    date: event.start.slice(0, 10),
    startDateTime: event.allDay ? '' : toLocalDateTimeInput(event.start),
    endDateTime: event.allDay ? '' : toLocalDateTimeInput(event.end),
    color: event.color ?? EVENT_COLOR_OPTIONS[0].value,
  }
}
</script>

<template>
  <BaseModal
    :open="open"
    :title="event ? 'Edit event' : 'New event'"
    :description="
      event ? 'Update the details saved in Google Calendar.' : 'Add an activity to your calendar.'
    "
    @close="emit('close')"
  >
    <form class="space-y-5" @submit.prevent="submit">
      <label class="block space-y-2">
        <span class="text-sm font-medium">Title</span>
        <input
          v-model="form.title"
          :class="fieldClass"
          type="text"
          autocomplete="off"
          placeholder="What’s happening?"
          :disabled="busy"
          autofocus
        />
      </label>

      <label
        class="flex items-center justify-between gap-4 rounded-xl border border-border bg-muted/40 px-4 py-3"
      >
        <span>
          <span class="block text-sm font-medium">All-day event</span>
          <span class="mt-0.5 block text-xs text-muted-foreground">
            Hide specific start and end times
          </span>
        </span>
        <span class="relative inline-flex h-6 w-10 shrink-0">
          <input v-model="form.allDay" class="peer sr-only" type="checkbox" :disabled="busy" />
          <span
            class="absolute inset-0 rounded-full bg-input transition-colors peer-checked:bg-primary peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-background"
          />
          <span
            class="absolute top-1 left-1 size-4 rounded-full bg-white shadow-sm transition-transform peer-checked:translate-x-4"
          />
        </span>
      </label>

      <label v-if="form.allDay" class="block space-y-2">
        <span class="text-sm font-medium">Date</span>
        <input v-model="form.date" :class="fieldClass" type="date" :disabled="busy" />
      </label>

      <div v-else class="grid gap-4 sm:grid-cols-2">
        <label class="block space-y-2">
          <span class="text-sm font-medium">Starts</span>
          <input
            v-model="form.startDateTime"
            :class="fieldClass"
            type="datetime-local"
            :disabled="busy"
          />
        </label>
        <label class="block space-y-2">
          <span class="text-sm font-medium">Ends</span>
          <input
            v-model="form.endDateTime"
            :class="fieldClass"
            type="datetime-local"
            :disabled="busy"
          />
        </label>
      </div>

      <label class="block space-y-2">
        <span class="text-sm font-medium">
          Location <span class="font-normal text-muted-foreground">(optional)</span>
        </span>
        <input
          v-model="form.location"
          :class="fieldClass"
          type="text"
          autocomplete="off"
          placeholder="Add a place or meeting link"
          :disabled="busy"
        />
      </label>

      <fieldset>
        <legend class="mb-2 text-sm font-medium">Color</legend>
        <div class="flex flex-wrap gap-2">
          <label
            v-for="color in EVENT_COLOR_OPTIONS"
            :key="color.value"
            class="relative flex size-8 items-center justify-center rounded-full transition-transform hover:scale-105"
            :title="color.name"
          >
            <input
              v-model="form.color"
              class="peer sr-only"
              type="radio"
              name="event-color"
              :value="color.value"
              :disabled="busy"
            />
            <span
              class="absolute inset-0 rounded-full ring-offset-2 ring-offset-background peer-checked:ring-2 peer-checked:ring-ring peer-focus-visible:ring-2 peer-focus-visible:ring-ring"
              :style="{ backgroundColor: color.value }"
            />
            <Check
              v-if="form.color === color.value"
              class="relative size-3.5 text-white drop-shadow-sm"
              aria-hidden="true"
            />
            <span class="sr-only">{{ color.name }}</span>
          </label>
        </div>
      </fieldset>

      <label class="block space-y-2">
        <span class="text-sm font-medium">
          Description <span class="font-normal text-muted-foreground">(optional)</span>
        </span>
        <textarea
          v-model="form.description"
          class="min-h-28 w-full resize-y rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-foreground shadow-xs transition-colors placeholder:text-muted-foreground/70 hover:border-ring/40 focus:border-ring disabled:cursor-not-allowed disabled:opacity-60"
          rows="4"
          placeholder="Add notes or context"
          :disabled="busy"
        />
      </label>

      <p
        v-if="validationMessage || errorMessage"
        class="rounded-lg border border-destructive/20 bg-destructive/8 px-3 py-2.5 text-sm text-destructive"
        role="alert"
      >
        {{ validationMessage || errorMessage }}
      </p>

      <div
        class="flex flex-col-reverse gap-2 border-t border-border pt-5 sm:flex-row sm:justify-end"
      >
        <button
          class="inline-flex h-10 items-center justify-center rounded-lg border border-input bg-background px-4 text-sm font-medium shadow-xs transition-colors hover:bg-accent hover:text-accent-foreground disabled:cursor-not-allowed disabled:opacity-60"
          type="button"
          :disabled="busy"
          @click="emit('close')"
        >
          Cancel
        </button>
        <button
          class="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 disabled:cursor-wait disabled:opacity-60"
          type="submit"
          :disabled="busy"
        >
          <LoaderCircle v-if="busy" class="size-4 animate-spin" aria-hidden="true" />
          <CalendarPlus v-else class="size-4" aria-hidden="true" />
          {{ busy ? 'Saving…' : event ? 'Save changes' : 'Create event' }}
        </button>
      </div>
    </form>
  </BaseModal>
</template>
