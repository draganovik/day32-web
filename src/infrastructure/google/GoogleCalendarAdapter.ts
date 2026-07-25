import type {
  Calendar,
  CalendarAccessRole,
  CalendarAttendee,
  CalendarConnection,
  CalendarEvent,
  CalendarEventDraft,
  CalendarProviderCapabilities,
  EventQuery,
} from '@/domain/calendar'
import type { CalendarProviderAdapter } from '@/domain/provider'
import { ProviderError } from '@/domain/provider'
import { loadGoogleIdentityServices } from './googleIdentity'

const GOOGLE_CALENDAR_API = 'https://www.googleapis.com/calendar/v3'
const GOOGLE_USERINFO_API = 'https://openidconnect.googleapis.com/v1/userinfo'
const GOOGLE_SCOPES = [
  'openid',
  'email',
  'profile',
  'https://www.googleapis.com/auth/calendar.events',
  'https://www.googleapis.com/auth/calendar.calendarlist.readonly',
].join(' ')

const GOOGLE_COLOR_BY_ID: Readonly<Record<string, string>> = {
  '1': '#7986cb',
  '2': '#33b679',
  '3': '#8e24aa',
  '4': '#e67c73',
  '5': '#f6c026',
  '6': '#f5511d',
  '7': '#039be5',
  '8': '#616161',
  '9': '#3f51b5',
  '10': '#0b8043',
  '11': '#d60000',
}

const GOOGLE_ID_BY_COLOR = new Map(
  Object.entries(GOOGLE_COLOR_BY_ID).map(([id, color]) => [color.toLowerCase(), id]),
)

interface GoogleUserInfo {
  sub: string
  email: string
  name: string
  picture?: string
}

interface GoogleCalendarListEntry {
  id: string
  summary: string
  description?: string
  backgroundColor?: string
  primary?: boolean
  accessRole: CalendarAccessRole
}

interface GoogleCalendarListResponse {
  items?: GoogleCalendarListEntry[]
  nextPageToken?: string
}

interface GoogleEventDateTime {
  date?: string
  dateTime?: string
  timeZone?: string
}

interface GoogleEventAttendee {
  email: string
  displayName?: string
  self?: boolean
  responseStatus?: CalendarAttendee['responseStatus']
}

export interface GoogleEventResource {
  id: string
  summary?: string
  description?: string
  location?: string
  start: GoogleEventDateTime
  end: GoogleEventDateTime
  colorId?: string
  status?: CalendarEvent['status']
  attendees?: GoogleEventAttendee[]
  recurrence?: string[]
  htmlLink?: string
}

interface GoogleEventListResponse {
  items?: GoogleEventResource[]
  nextPageToken?: string
}

export const googleCapabilities: CalendarProviderCapabilities = {
  colors: true,
  attendees: true,
  recurrence: true,
  conferencing: true,
  multipleCalendars: true,
}

function optionalString(value: string | undefined): string | undefined {
  const trimmed = value?.trim()
  return trimmed ? trimmed : undefined
}

export function mapGoogleEvent(
  resource: GoogleEventResource,
  connectionId: string,
  calendarId: string,
): CalendarEvent {
  const allDay = Boolean(resource.start.date)
  const start = resource.start.date ?? resource.start.dateTime
  const end = resource.end.date ?? resource.end.dateTime
  const description = optionalString(resource.description)
  const location = optionalString(resource.location)

  if (!start || !end) {
    throw new ProviderError('Google returned an event without a start or end.', 'provider')
  }

  return {
    id: resource.id,
    provider: 'google',
    connectionId,
    calendarId,
    title: resource.summary?.trim() || 'Untitled event',
    ...(description ? { description } : {}),
    ...(location ? { location } : {}),
    start,
    end,
    allDay,
    ...(resource.start.timeZone ? { timeZone: resource.start.timeZone } : {}),
    ...(resource.colorId && GOOGLE_COLOR_BY_ID[resource.colorId]
      ? { color: GOOGLE_COLOR_BY_ID[resource.colorId] }
      : {}),
    status: resource.status ?? 'confirmed',
    attendees: (resource.attendees ?? []).map((attendee) => ({
      email: attendee.email,
      ...(attendee.displayName ? { displayName: attendee.displayName } : {}),
      ...(attendee.self !== undefined ? { isSelf: attendee.self } : {}),
      ...(attendee.responseStatus ? { responseStatus: attendee.responseStatus } : {}),
    })),
    ...(resource.recurrence ? { recurrence: resource.recurrence } : {}),
    providerMetadata: {
      ...(resource.colorId ? { colorId: resource.colorId } : {}),
      ...(resource.htmlLink ? { htmlLink: resource.htmlLink } : {}),
    },
  }
}

export function mapDraftToGoogleEvent(draft: CalendarEventDraft): Record<string, unknown> {
  const colorId = draft.color ? GOOGLE_ID_BY_COLOR.get(draft.color.toLowerCase()) : undefined

  return {
    summary: draft.title.trim(),
    description: draft.description?.trim() ?? '',
    location: draft.location?.trim() ?? '',
    ...(colorId ? { colorId } : {}),
    start: draft.allDay
      ? { date: draft.start.slice(0, 10) }
      : {
          dateTime: draft.start,
          ...(draft.timeZone ? { timeZone: draft.timeZone } : {}),
        },
    end: draft.allDay
      ? { date: draft.end.slice(0, 10) }
      : {
          dateTime: draft.end,
          ...(draft.timeZone ? { timeZone: draft.timeZone } : {}),
        },
  }
}

export class GoogleCalendarAdapter implements CalendarProviderAdapter {
  readonly provider = 'google' as const
  readonly capabilities = googleCapabilities

  private accessToken: string | undefined
  private expiresAt = 0
  private connection: CalendarConnection | undefined

  async connect(): Promise<CalendarConnection> {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID

    if (!clientId) {
      throw new ProviderError(
        'Google is not configured. Add VITE_GOOGLE_CLIENT_ID to .env.local.',
        'configuration',
      )
    }

    await loadGoogleIdentityServices()
    const token = await this.requestAccessToken(clientId)
    this.accessToken = token.access_token
    this.expiresAt = Date.now() + Number(token.expires_in ?? 3600) * 1000

    const profile = await this.request<GoogleUserInfo>(GOOGLE_USERINFO_API)
    this.connection = {
      id: `google:${profile.sub}`,
      provider: 'google',
      account: {
        id: profile.sub,
        provider: 'google',
        displayName: profile.name,
        email: profile.email,
        ...(profile.picture ? { avatarUrl: profile.picture } : {}),
      },
      connectedAt: new Date().toISOString(),
    }

    return this.connection
  }

  async disconnect(): Promise<void> {
    const token = this.accessToken
    this.accessToken = undefined
    this.expiresAt = 0
    this.connection = undefined

    if (token && typeof google !== 'undefined' && google.accounts?.oauth2) {
      await new Promise<void>((resolve) => {
        google.accounts.oauth2.revoke(token, () => resolve())
      })
    }
  }

  async listCalendars(): Promise<Calendar[]> {
    const connection = this.requireConnection()
    const calendars: Calendar[] = []
    let pageToken: string | undefined

    do {
      const params = new URLSearchParams({
        minAccessRole: 'reader',
        showDeleted: 'false',
        showHidden: 'false',
        maxResults: '250',
      })
      if (pageToken) params.set('pageToken', pageToken)

      const response = await this.request<GoogleCalendarListResponse>(
        `${GOOGLE_CALENDAR_API}/users/me/calendarList?${params}`,
      )

      calendars.push(
        ...(response.items ?? []).map((calendar) => ({
          id: calendar.id,
          connectionId: connection.id,
          provider: 'google' as const,
          name: calendar.summary,
          ...(calendar.description ? { description: calendar.description } : {}),
          ...(calendar.backgroundColor ? { color: calendar.backgroundColor } : {}),
          isPrimary: calendar.primary ?? false,
          accessRole: calendar.accessRole,
        })),
      )
      pageToken = response.nextPageToken
    } while (pageToken)

    return calendars
  }

  async listEvents(query: EventQuery): Promise<CalendarEvent[]> {
    const connection = this.requireConnection()
    const events: CalendarEvent[] = []
    let pageToken: string | undefined

    do {
      const params = new URLSearchParams({
        timeMin: query.timeMin,
        singleEvents: 'true',
        showDeleted: 'false',
        orderBy: 'startTime',
        maxResults: '2500',
      })
      if (query.timeMax) params.set('timeMax', query.timeMax)
      if (pageToken) params.set('pageToken', pageToken)

      const response = await this.request<GoogleEventListResponse>(
        `${GOOGLE_CALENDAR_API}/calendars/${encodeURIComponent(query.calendarId)}/events?${params}`,
      )
      events.push(
        ...(response.items ?? []).map((event) =>
          mapGoogleEvent(event, connection.id, query.calendarId),
        ),
      )
      pageToken = response.nextPageToken
    } while (pageToken)

    return events
  }

  async createEvent(draft: CalendarEventDraft): Promise<CalendarEvent> {
    const connection = this.requireConnection()
    const event = await this.request<GoogleEventResource>(
      `${GOOGLE_CALENDAR_API}/calendars/${encodeURIComponent(draft.calendarId)}/events`,
      {
        method: 'POST',
        body: JSON.stringify(mapDraftToGoogleEvent(draft)),
      },
    )

    return mapGoogleEvent(event, connection.id, draft.calendarId)
  }

  async updateEvent(eventId: string, draft: CalendarEventDraft): Promise<CalendarEvent> {
    const connection = this.requireConnection()
    const event = await this.request<GoogleEventResource>(
      `${GOOGLE_CALENDAR_API}/calendars/${encodeURIComponent(draft.calendarId)}/events/${encodeURIComponent(eventId)}`,
      {
        method: 'PATCH',
        body: JSON.stringify(mapDraftToGoogleEvent(draft)),
      },
    )

    return mapGoogleEvent(event, connection.id, draft.calendarId)
  }

  async deleteEvent(calendarId: string, eventId: string): Promise<void> {
    await this.request<void>(
      `${GOOGLE_CALENDAR_API}/calendars/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(eventId)}`,
      { method: 'DELETE' },
    )
  }

  private requestAccessToken(clientId: string): Promise<google.accounts.oauth2.TokenResponse> {
    return new Promise((resolve, reject) => {
      const client = google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: GOOGLE_SCOPES,
        prompt: 'select_account',
        callback: (response: google.accounts.oauth2.TokenResponse) => {
          if (response.error) {
            reject(
              new ProviderError(
                response.error_description ?? 'Google authorization was not completed.',
                'authorization',
              ),
            )
            return
          }
          resolve(response)
        },
        error_callback: (error: google.accounts.oauth2.ClientConfigError) => {
          reject(
            new ProviderError(
              error.message ?? 'The Google authorization popup could not be opened.',
              'authorization',
            ),
          )
        },
      })

      client.requestAccessToken()
    })
  }

  private requireConnection(): CalendarConnection {
    if (!this.connection || !this.accessToken || Date.now() >= this.expiresAt) {
      throw new ProviderError(
        'Your Google authorization expired. Connect the account again.',
        'authorization',
      )
    }

    return this.connection
  }

  private async request<T>(url: string, init: RequestInit = {}): Promise<T> {
    if (!this.accessToken || Date.now() >= this.expiresAt) {
      throw new ProviderError(
        'Your Google authorization expired. Connect the account again.',
        'authorization',
      )
    }

    let response: Response
    try {
      response = await fetch(url, {
        ...init,
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          ...(init.body ? { 'Content-Type': 'application/json' } : {}),
          ...init.headers,
        },
      })
    } catch (error) {
      throw new ProviderError('Google Calendar could not be reached.', 'network', {
        cause: error,
      })
    }

    if (!response.ok) {
      const details = await response.text()
      throw new ProviderError(
        response.status === 401
          ? 'Your Google authorization expired. Connect the account again.'
          : `Google Calendar returned ${response.status}. ${details}`.trim(),
        response.status === 401 || response.status === 403 ? 'authorization' : 'provider',
      )
    }

    if (response.status === 204) {
      return undefined as T
    }

    return (await response.json()) as T
  }
}
