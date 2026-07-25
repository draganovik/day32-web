import type {
  Calendar,
  CalendarConnection,
  CalendarEvent,
  CalendarEventDraft,
  CalendarProviderCapabilities,
  CalendarProviderId,
  EventQuery,
} from './calendar'

export class ProviderError extends Error {
  constructor(
    message: string,
    readonly code: 'configuration' | 'authorization' | 'network' | 'provider' | 'unsupported',
    options?: ErrorOptions,
  ) {
    super(message, options)
    this.name = 'ProviderError'
  }
}

export interface CalendarProviderSession {
  provider: CalendarProviderId
  connection: CalendarConnection
  expiresAt: number
  authorization: Readonly<Record<string, unknown>>
}

export interface CalendarProviderAdapter {
  readonly provider: CalendarProviderId
  readonly capabilities: CalendarProviderCapabilities

  connect(): Promise<CalendarConnection>
  restoreSession(session: CalendarProviderSession): CalendarConnection
  exportSession(): CalendarProviderSession | undefined
  disconnect(): Promise<void>
  listCalendars(): Promise<Calendar[]>
  listEvents(query: EventQuery): Promise<CalendarEvent[]>
  createEvent(draft: CalendarEventDraft): Promise<CalendarEvent>
  updateEvent(eventId: string, draft: CalendarEventDraft): Promise<CalendarEvent>
  deleteEvent(calendarId: string, eventId: string): Promise<void>
}

export type CalendarProviderAdapterFactory = () => CalendarProviderAdapter

export class CalendarProviderRegistry {
  private readonly factories = new Map<CalendarProviderId, CalendarProviderAdapterFactory>()

  register(provider: CalendarProviderId, factory: CalendarProviderAdapterFactory): void {
    this.factories.set(provider, factory)
  }

  create(provider: CalendarProviderId): CalendarProviderAdapter {
    const factory = this.factories.get(provider)

    if (!factory) {
      throw new ProviderError(`${provider} is not available yet.`, 'unsupported')
    }

    return factory()
  }

  availableProviders(): CalendarProviderId[] {
    return [...this.factories.keys()]
  }
}
