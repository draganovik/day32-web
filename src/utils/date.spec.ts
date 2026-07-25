import { describe, expect, it } from 'vitest'

import { addDays } from './date'

describe('addDays', () => {
  it('creates the exclusive end date for an all-day event', () => {
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01')
  })
})
