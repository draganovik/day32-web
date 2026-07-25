import { createPinia, setActivePinia } from 'pinia'
import { afterEach, describe, expect, it } from 'vitest'

import type { CalendarConnection } from '@/domain/calendar'
import type { CalendarProviderAdapter, CalendarProviderSession } from '@/domain/provider'
import { GoogleCalendarAdapter } from '@/infrastructure/google/GoogleCalendarAdapter'
import { providerRegistry } from '@/infrastructure/providers'
import { useAccountsStore } from './accounts'

const connection: CalendarConnection = {
  id: 'google:test-user',
  provider: 'google',
  account: {
    id: 'test-user',
    provider: 'google',
    displayName: 'Test User',
    email: 'test@example.com',
  },
  connectedAt: '2026-07-25T10:00:00.000Z',
}

afterEach(() => {
  sessionStorage.clear()
  providerRegistry.register('google', () => new GoogleCalendarAdapter())
})

describe('account sessions', () => {
  it('clears the local session before provider revocation finishes', async () => {
    let finishRevocation: () => void = () => undefined
    const adapter = createAdapter({
      disconnect: () =>
        new Promise<void>((resolve) => {
          finishRevocation = () => resolve()
        }),
    })

    providerRegistry.register('google', () => adapter)
    setActivePinia(createPinia())
    const accounts = useAccountsStore()
    await accounts.connect('google')

    const disconnecting = accounts.disconnect(connection.id)

    expect(accounts.status).toBe('disconnecting')
    expect(accounts.activeConnection).toBeUndefined()
    expect(sessionStorage.length).toBe(0)

    finishRevocation()
    await disconnecting
    expect(accounts.status).toBe('idle')
  })

  it('restores the active adapter and account after a page reload', async () => {
    let restoreCount = 0
    providerRegistry.register('google', () =>
      createAdapter({
        restoreSession: (session) => {
          restoreCount += 1
          return session.connection
        },
      }),
    )

    setActivePinia(createPinia())
    const initialAccounts = useAccountsStore()
    await initialAccounts.connect('google')

    setActivePinia(createPinia())
    const restoredAccounts = useAccountsStore()
    restoredAccounts.restoreSessions()

    expect(restoreCount).toBe(1)
    expect(restoredAccounts.status).toBe('connected')
    expect(restoredAccounts.activeConnection).toEqual(connection)
    expect(restoredAccounts.adapterFor(connection.id).provider).toBe('google')
  })

  it('discards an expired persisted provider session', () => {
    sessionStorage.setItem(
      'day32:calendar-sessions:v1',
      JSON.stringify({
        version: 1,
        activeConnectionId: connection.id,
        sessions: [
          {
            provider: 'google',
            connection,
            expiresAt: Date.now() - 1,
            authorization: {
              accessToken: 'expired-token',
            },
          },
        ],
      }),
    )
    providerRegistry.register('google', () => new GoogleCalendarAdapter())
    setActivePinia(createPinia())
    const accounts = useAccountsStore()

    accounts.restoreSessions()

    expect(accounts.status).toBe('idle')
    expect(accounts.activeConnection).toBeUndefined()
    expect(sessionStorage.length).toBe(0)
  })
})

function createAdapter(overrides: Partial<CalendarProviderAdapter> = {}): CalendarProviderAdapter {
  const session: CalendarProviderSession = {
    provider: 'google',
    connection,
    expiresAt: Date.now() + 60 * 60 * 1000,
    authorization: {
      accessToken: 'test-token',
    },
  }

  return {
    provider: 'google',
    capabilities: {
      colors: true,
      attendees: true,
      recurrence: true,
      conferencing: false,
      multipleCalendars: true,
    },
    connect: async () => connection,
    restoreSession: (persistedSession) => persistedSession.connection,
    exportSession: () => session,
    disconnect: async () => undefined,
    listCalendars: async () => [],
    listEvents: async () => [],
    createEvent: async () => {
      throw new Error('Not used in this test.')
    },
    updateEvent: async () => {
      throw new Error('Not used in this test.')
    },
    deleteEvent: async () => undefined,
    ...overrides,
  }
}
