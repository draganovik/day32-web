import { describe, expect, it } from 'vitest'

import { normalizePreferences } from './preferences'

describe('normalizePreferences', () => {
  it('keeps supported color schemes', () => {
    expect(normalizePreferences({ colorScheme: 'dark' })).toEqual({ colorScheme: 'dark' })
  })

  it('drops unrelated and invalid persisted state', () => {
    expect(
      normalizePreferences({
        colorScheme: 'purple',
        accessToken: 'must-not-survive',
        events: [{ id: 'event-1' }],
      }),
    ).toEqual({ colorScheme: 'system' })
  })
})
