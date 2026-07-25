import { computed, shallowRef } from 'vue'
import { defineStore } from 'pinia'

import type { Calendar, CalendarEvent, CalendarEventDraft } from '@/domain/calendar'
import { useAccountsStore } from './accounts'

export type CalendarLoadStatus = 'idle' | 'loading' | 'ready' | 'saving' | 'error'

export const useCalendarStore = defineStore('calendar', () => {
  const accounts = useAccountsStore()
  const calendars = shallowRef<Calendar[]>([])
  const events = shallowRef<CalendarEvent[]>([])
  const selectedCalendarByConnection = shallowRef<Record<string, string>>({})
  const status = shallowRef<CalendarLoadStatus>('idle')
  const errorMessage = shallowRef<string>()

  const selectedCalendar = computed(() => {
    const connectionId = accounts.activeConnectionId
    if (!connectionId) return undefined

    const selectedId = selectedCalendarByConnection.value[connectionId]
    return (
      calendars.value.find(
        (calendar) => calendar.connectionId === connectionId && calendar.id === selectedId,
      ) ??
      calendars.value.find(
        (calendar) => calendar.connectionId === connectionId && calendar.isPrimary,
      ) ??
      calendars.value.find((calendar) => calendar.connectionId === connectionId)
    )
  })

  const upcomingEvents = computed(() =>
    [...events.value].sort((left, right) => left.start.localeCompare(right.start)),
  )

  async function loadConnection(connectionId: string): Promise<void> {
    status.value = 'loading'
    errorMessage.value = undefined

    try {
      const adapter = accounts.adapterFor(connectionId)
      const connectionCalendars = await adapter.listCalendars()
      calendars.value = [
        ...calendars.value.filter((calendar) => calendar.connectionId !== connectionId),
        ...connectionCalendars,
      ]

      const calendar =
        connectionCalendars.find((candidate) => candidate.isPrimary) ?? connectionCalendars[0]

      if (!calendar) {
        events.value = events.value.filter((event) => event.connectionId !== connectionId)
        status.value = 'ready'
        return
      }

      selectedCalendarByConnection.value = {
        ...selectedCalendarByConnection.value,
        [connectionId]: calendar.id,
      }
      await loadEvents(connectionId, calendar.id)
    } catch (error) {
      status.value = 'error'
      errorMessage.value = messageFromError(error)
      throw error
    }
  }

  async function loadEvents(connectionId: string, calendarId: string): Promise<void> {
    status.value = 'loading'
    errorMessage.value = undefined

    try {
      const adapter = accounts.adapterFor(connectionId)
      const loadedEvents = await adapter.listEvents({
        calendarId,
        timeMin: new Date().toISOString(),
      })
      events.value = [
        ...events.value.filter(
          (event) => event.connectionId !== connectionId || event.calendarId !== calendarId,
        ),
        ...loadedEvents,
      ]
      status.value = 'ready'
    } catch (error) {
      status.value = 'error'
      errorMessage.value = messageFromError(error)
      throw error
    }
  }

  async function refresh(): Promise<void> {
    const connectionId = accounts.activeConnectionId
    const calendar = selectedCalendar.value
    if (!connectionId || !calendar) return

    await loadEvents(connectionId, calendar.id)
  }

  async function createEvent(draft: CalendarEventDraft): Promise<CalendarEvent> {
    const connectionId = accounts.activeConnectionId
    if (!connectionId) throw new Error('Connect a calendar account first.')

    status.value = 'saving'
    errorMessage.value = undefined

    try {
      const event = await accounts.adapterFor(connectionId).createEvent(draft)
      events.value = [...events.value, event]
      status.value = 'ready'
      return event
    } catch (error) {
      status.value = 'error'
      errorMessage.value = messageFromError(error)
      throw error
    }
  }

  async function updateEvent(eventId: string, draft: CalendarEventDraft): Promise<CalendarEvent> {
    const existing = events.value.find((event) => event.id === eventId)
    if (!existing) throw new Error('The selected event is no longer available.')

    status.value = 'saving'
    errorMessage.value = undefined

    try {
      const updated = await accounts.adapterFor(existing.connectionId).updateEvent(eventId, draft)
      events.value = events.value.map((event) => (event.id === eventId ? updated : event))
      status.value = 'ready'
      return updated
    } catch (error) {
      status.value = 'error'
      errorMessage.value = messageFromError(error)
      throw error
    }
  }

  async function deleteEvent(event: CalendarEvent): Promise<void> {
    status.value = 'saving'
    errorMessage.value = undefined

    try {
      await accounts.adapterFor(event.connectionId).deleteEvent(event.calendarId, event.id)
      events.value = events.value.filter((candidate) => candidate.id !== event.id)
      status.value = 'ready'
    } catch (error) {
      status.value = 'error'
      errorMessage.value = messageFromError(error)
      throw error
    }
  }

  function clearConnection(connectionId: string): void {
    calendars.value = calendars.value.filter((calendar) => calendar.connectionId !== connectionId)
    events.value = events.value.filter((event) => event.connectionId !== connectionId)
    const remainingSelections = { ...selectedCalendarByConnection.value }
    delete remainingSelections[connectionId]
    selectedCalendarByConnection.value = remainingSelections
    status.value = 'idle'
    errorMessage.value = undefined
  }

  return {
    calendars,
    events,
    selectedCalendarByConnection,
    selectedCalendar,
    upcomingEvents,
    status,
    errorMessage,
    loadConnection,
    loadEvents,
    refresh,
    createEvent,
    updateEvent,
    deleteEvent,
    clearConnection,
  }
})

function messageFromError(error: unknown): string {
  return error instanceof Error ? error.message : 'The calendar operation failed.'
}
