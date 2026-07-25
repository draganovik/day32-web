import { createPinia, setActivePinia } from 'pinia'
import { afterEach, describe, expect, it } from 'vitest'

import type { CalendarConnection } from '@/domain/calendar'
import type { CalendarProviderAdapter } from '@/domain/provider'
import { GoogleCalendarAdapter } from '@/infrastructure/google/GoogleCalendarAdapter'
import { providerRegistry } from '@/infrastructure/providers'
import { useAccountsStore } from './accounts'

afterEach(() => {
  providerRegistry.register('google', () => new GoogleCalendarAdapter())
})

describe('account disconnection', () => {
  it('clears the local session before provider revocation finishes', async () => {
    const connection: CalendarConnection = {
      id: 'google:test-user',
      provider: 'google',
      account: {
        id: 'test-user',
        provider: 'google',
        displayName: 'Test User',
        email: 'test@example.com',
      },
      connectedAt: new Date().toISOString(),
    }
    let finishRevocation: () => void = () => undefined
    const adapter: CalendarProviderAdapter = {
      provider: 'google',
      capabilities: {
        colors: true,
        attendees: true,
        recurrence: true,
        conferencing: false,
        multipleCalendars: true,
      },
      connect: async () => connection,
      disconnect: () =>
        new Promise<void>((resolve) => {
          finishRevocation = () => resolve()
        }),
      listCalendars: async () => [],
      listEvents: async () => [],
      createEvent: async () => {
        throw new Error('Not used in this test.')
      },
      updateEvent: async () => {
        throw new Error('Not used in this test.')
      },
      deleteEvent: async () => undefined,
    }

    providerRegistry.register('google', () => adapter)
    setActivePinia(createPinia())
    const accounts = useAccountsStore()
    await accounts.connect('google')

    const disconnecting = accounts.disconnect(connection.id)

    expect(accounts.status).toBe('disconnecting')
    expect(accounts.activeConnection).toBeUndefined()

    finishRevocation()
    await disconnecting
    expect(accounts.status).toBe('idle')
  })
})
