export function addDays(date: string, amount: number): string {
  const [year, month, day] = date.split('-').map(Number)
  if (!year || !month || !day) return date

  const value = new Date(Date.UTC(year, month - 1, day))
  value.setUTCDate(value.getUTCDate() + amount)
  return value.toISOString().slice(0, 10)
}

export function toLocalDateTimeInput(value: string): string {
  const date = new Date(value)
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000)
  return local.toISOString().slice(0, 16)
}

export function fromLocalDateTimeInput(value: string): string {
  return new Date(value).toISOString()
}

export function formatEventDate(start: string, allDay: boolean): string {
  const date = allDay ? localDateFromIsoDay(start) : new Date(start)
  const today = startOfDay(new Date())
  const eventDay = startOfDay(date)
  const difference = Math.round((eventDay.getTime() - today.getTime()) / 86_400_000)
  const weekdayAndDay = new Intl.DateTimeFormat(undefined, {
    weekday: 'short',
    day: 'numeric',
    month: difference > 7 ? 'short' : undefined,
    year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
  }).format(date)

  if (difference === 0) return `${weekdayAndDay} · Today`
  if (difference === 1) return `${weekdayAndDay} · Tomorrow`
  if (difference > 1 && difference < 10) return `${weekdayAndDay} · In ${difference} days`
  return weekdayAndDay
}

export function formatEventTime(start: string, end: string, allDay: boolean): string {
  if (allDay) return 'All day'

  const formatter = new Intl.DateTimeFormat(undefined, {
    hour: '2-digit',
    minute: '2-digit',
  })
  return `${formatter.format(new Date(start))}–${formatter.format(new Date(end))}`
}

function localDateFromIsoDay(value: string): Date {
  const [year, month, day] = value.slice(0, 10).split('-').map(Number)
  return new Date(year ?? 0, (month ?? 1) - 1, day ?? 1)
}

function startOfDay(value: Date): Date {
  return new Date(value.getFullYear(), value.getMonth(), value.getDate())
}
