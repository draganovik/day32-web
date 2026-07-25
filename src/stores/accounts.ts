import { computed, shallowRef } from 'vue'
import { defineStore } from 'pinia'

import type { CalendarConnection, CalendarProviderId } from '@/domain/calendar'
import type { CalendarProviderAdapter, CalendarProviderSession } from '@/domain/provider'
import { ProviderError } from '@/domain/provider'
import { providerRegistry } from '@/infrastructure/providers'

export type ConnectionStatus = 'idle' | 'connecting' | 'connected' | 'disconnecting' | 'error'

const SESSION_STORAGE_KEY = 'day32:calendar-sessions:v1'

interface PersistedAccountsState {
  version: 1
  activeConnectionId?: string
  sessions: CalendarProviderSession[]
}

export const useAccountsStore = defineStore('accounts', () => {
  const connections = shallowRef<CalendarConnection[]>([])
  const activeConnectionId = shallowRef<string>()
  const status = shallowRef<ConnectionStatus>('idle')
  const errorMessage = shallowRef<string>()
  const adapters = new Map<string, CalendarProviderAdapter>()

  const activeConnection = computed(() =>
    connections.value.find((connection) => connection.id === activeConnectionId.value),
  )

  const availableProviders = computed(() => providerRegistry.availableProviders())

  async function connect(provider: CalendarProviderId): Promise<CalendarConnection> {
    status.value = 'connecting'
    errorMessage.value = undefined

    const adapter = providerRegistry.create(provider)

    try {
      const connection = await adapter.connect()
      adapters.set(connection.id, adapter)
      connections.value = [
        ...connections.value.filter((candidate) => candidate.id !== connection.id),
        connection,
      ]
      activeConnectionId.value = connection.id
      status.value = 'connected'
      persistSessions()
      return connection
    } catch (error) {
      status.value = 'error'
      errorMessage.value = messageFromError(error)
      throw error
    }
  }

  async function disconnect(connectionId = activeConnectionId.value): Promise<void> {
    if (!connectionId) return

    status.value = 'disconnecting'
    errorMessage.value = undefined
    const adapter = adapters.get(connectionId)
    adapters.delete(connectionId)
    connections.value = connections.value.filter((connection) => connection.id !== connectionId)
    activeConnectionId.value = connections.value[0]?.id
    persistSessions()

    try {
      await adapter?.disconnect()
    } finally {
      status.value = connections.value.length ? 'connected' : 'idle'
    }
  }

  function restoreSessions(): void {
    const persisted = readPersistedState()
    if (!persisted) return

    const restoredConnections: CalendarConnection[] = []

    for (const session of persisted.sessions) {
      try {
        const adapter = providerRegistry.create(session.provider)
        const connection = adapter.restoreSession(session)
        adapters.set(connection.id, adapter)
        restoredConnections.push(connection)
      } catch {
        // Ignore expired, malformed, or no-longer-supported provider sessions.
      }
    }

    connections.value = restoredConnections
    activeConnectionId.value = restoredConnections.some(
      (connection) => connection.id === persisted.activeConnectionId,
    )
      ? persisted.activeConnectionId
      : restoredConnections[0]?.id
    status.value = restoredConnections.length ? 'connected' : 'idle'
    errorMessage.value = undefined
    persistSessions()
  }

  function persistSessions(): void {
    const storage = getSessionStorage()
    if (!storage) return

    const sessions = [...adapters.values()]
      .map((adapter) => adapter.exportSession())
      .filter((session): session is CalendarProviderSession => Boolean(session))

    try {
      if (sessions.length === 0) {
        storage.removeItem(SESSION_STORAGE_KEY)
        return
      }

      const persisted: PersistedAccountsState = {
        version: 1,
        ...(activeConnectionId.value ? { activeConnectionId: activeConnectionId.value } : {}),
        sessions,
      }
      storage.setItem(SESSION_STORAGE_KEY, JSON.stringify(persisted))
    } catch {
      // A blocked or full session store should not prevent calendar access.
    }
  }

  function adapterFor(connectionId: string): CalendarProviderAdapter {
    const adapter = adapters.get(connectionId)

    if (!adapter) {
      throw new ProviderError('This calendar account is no longer connected.', 'authorization')
    }

    return adapter
  }

  return {
    connections,
    activeConnectionId,
    activeConnection,
    availableProviders,
    status,
    errorMessage,
    connect,
    disconnect,
    restoreSessions,
    adapterFor,
  }
})

function messageFromError(error: unknown): string {
  return error instanceof Error ? error.message : 'The account could not be connected.'
}

function readPersistedState(): PersistedAccountsState | undefined {
  const storage = getSessionStorage()
  if (!storage) return undefined

  try {
    const serialized = storage.getItem(SESSION_STORAGE_KEY)
    if (!serialized) return undefined

    const value: unknown = JSON.parse(serialized)
    if (!isPersistedAccountsState(value)) {
      clearPersistedState(storage)
      return undefined
    }

    return value
  } catch {
    clearPersistedState(storage)
    return undefined
  }
}

function clearPersistedState(storage: Storage): void {
  try {
    storage.removeItem(SESSION_STORAGE_KEY)
  } catch {
    // Ignore browser storage restrictions during startup.
  }
}

function getSessionStorage(): Storage | undefined {
  if (typeof window === 'undefined') return undefined

  try {
    return window.sessionStorage
  } catch {
    return undefined
  }
}

function isPersistedAccountsState(value: unknown): value is PersistedAccountsState {
  if (!isRecord(value) || value.version !== 1 || !Array.isArray(value.sessions)) return false
  if (value.activeConnectionId !== undefined && typeof value.activeConnectionId !== 'string') {
    return false
  }

  return value.sessions.every(
    (session) =>
      isRecord(session) &&
      (session.provider === 'google' || session.provider === 'microsoft') &&
      isRecord(session.connection) &&
      typeof session.expiresAt === 'number' &&
      isRecord(session.authorization),
  )
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}
