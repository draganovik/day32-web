import { shallowRef, watch } from 'vue'
import { defineStore } from 'pinia'

export type ColorScheme = 'system' | 'light' | 'dark'

interface Preferences {
  colorScheme: ColorScheme
}

const STORAGE_KEY = 'day32.preferences.v2'
const DEFAULT_PREFERENCES: Preferences = {
  colorScheme: 'system',
}

export const usePreferencesStore = defineStore('preferences', () => {
  const colorScheme = shallowRef<ColorScheme>(readPreferences().colorScheme)

  watch(
    colorScheme,
    (scheme) => {
      document.documentElement.dataset.theme = scheme
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ colorScheme: scheme } satisfies Preferences),
      )
    },
    { immediate: true },
  )

  function setColorScheme(scheme: ColorScheme): void {
    colorScheme.value = scheme
  }

  return {
    colorScheme,
    setColorScheme,
  }
})

export function normalizePreferences(value: unknown): Preferences {
  if (!value || typeof value !== 'object') return DEFAULT_PREFERENCES

  const colorScheme = Reflect.get(value, 'colorScheme')
  return {
    colorScheme:
      colorScheme === 'light' || colorScheme === 'dark' || colorScheme === 'system'
        ? colorScheme
        : 'system',
  }
}

function readPreferences(): Preferences {
  try {
    const value = localStorage.getItem(STORAGE_KEY)
    return value ? normalizePreferences(JSON.parse(value)) : DEFAULT_PREFERENCES
  } catch {
    return DEFAULT_PREFERENCES
  }
}
