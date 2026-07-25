import { CalendarProviderRegistry } from '@/domain/provider'
import { GoogleCalendarAdapter } from './google/GoogleCalendarAdapter'

export const providerRegistry = new CalendarProviderRegistry()

providerRegistry.register('google', () => new GoogleCalendarAdapter())
