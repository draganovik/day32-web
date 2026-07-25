export type CalendarProviderId = 'google' | 'microsoft'

export interface CalendarAccount {
  id: string
  provider: CalendarProviderId
  displayName: string
  email: string
  avatarUrl?: string
}

export interface CalendarConnection {
  id: string
  provider: CalendarProviderId
  account: CalendarAccount
  connectedAt: string
}

export type CalendarAccessRole = 'owner' | 'writer' | 'reader' | 'freeBusyReader'

export interface Calendar {
  id: string
  connectionId: string
  provider: CalendarProviderId
  name: string
  description?: string
  color?: string
  isPrimary: boolean
  accessRole: CalendarAccessRole
}

export interface CalendarAttendee {
  email: string
  displayName?: string
  isSelf?: boolean
  responseStatus?: 'needsAction' | 'declined' | 'tentative' | 'accepted'
}

export interface CalendarEvent {
  id: string
  provider: CalendarProviderId
  connectionId: string
  calendarId: string
  title: string
  description?: string
  location?: string
  start: string
  end: string
  allDay: boolean
  timeZone?: string
  color?: string
  status: 'confirmed' | 'tentative' | 'cancelled'
  attendees: CalendarAttendee[]
  recurrence?: string[]
  providerMetadata?: Readonly<Record<string, unknown>>
}

export interface CalendarEventDraft {
  calendarId: string
  title: string
  description?: string
  location?: string
  start: string
  end: string
  allDay: boolean
  timeZone?: string
  color?: string
}

export interface EventQuery {
  calendarId: string
  timeMin: string
  timeMax?: string
}

export interface CalendarProviderCapabilities {
  colors: boolean
  attendees: boolean
  recurrence: boolean
  conferencing: boolean
  multipleCalendars: boolean
}

export const EVENT_COLOR_OPTIONS = [
  { name: 'Lavender', value: '#7986cb' },
  { name: 'Sage', value: '#33b679' },
  { name: 'Grape', value: '#8e24aa' },
  { name: 'Flamingo', value: '#e67c73' },
  { name: 'Banana', value: '#f6c026' },
  { name: 'Tangerine', value: '#f5511d' },
  { name: 'Peacock', value: '#039be5' },
  { name: 'Graphite', value: '#616161' },
  { name: 'Blueberry', value: '#3f51b5' },
  { name: 'Basil', value: '#0b8043' },
  { name: 'Tomato', value: '#d60000' },
] as const
