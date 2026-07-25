import { computed, shallowRef } from 'vue'
import { defineStore } from 'pinia'

import type { CalendarConnection, CalendarProviderId } from '@/domain/calendar'
import type { CalendarProviderAdapter } from '@/domain/provider'
import { ProviderError } from '@/domain/provider'
import { providerRegistry } from '@/infrastructure/providers'

export type ConnectionStatus = 'idle' | 'connecting' | 'connected' | 'disconnecting' | 'error'

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

    try {
      await adapter?.disconnect()
    } finally {
      status.value = connections.value.length ? 'connected' : 'idle'
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
    adapterFor,
  }
})

function messageFromError(error: unknown): string {
  return error instanceof Error ? error.message : 'The account could not be connected.'
}
