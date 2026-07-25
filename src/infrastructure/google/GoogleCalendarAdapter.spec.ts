import { describe, expect, it } from 'vitest'

import type { CalendarEventDraft } from '@/domain/calendar'
import { mapDraftToGoogleEvent, mapGoogleEvent } from './GoogleCalendarAdapter'

describe('GoogleCalendarAdapter mapping', () => {
  it('maps an all-day Google event with its exclusive end date', () => {
    const event = mapGoogleEvent(
      {
        id: 'event-1',
        summary: 'Planning day',
        start: { date: '2026-08-10' },
        end: { date: '2026-08-11' },
        status: 'confirmed',
      },
      'google:account-1',
      'primary',
    )

    expect(event).toMatchObject({
      start: '2026-08-10',
      end: '2026-08-11',
      allDay: true,
      provider: 'google',
    })
  })

  it('maps the provider-neutral draft to Google fields', () => {
    const draft: CalendarEventDraft = {
      calendarId: 'primary',
      title: '  Design review  ',
      description: 'Notes',
      start: '2026-08-10T10:00:00.000Z',
      end: '2026-08-10T11:00:00.000Z',
      allDay: false,
      color: '#039be5',
    }

    expect(mapDraftToGoogleEvent(draft)).toMatchObject({
      summary: 'Design review',
      colorId: '7',
      start: { dateTime: draft.start },
      end: { dateTime: draft.end },
    })
  })
})
