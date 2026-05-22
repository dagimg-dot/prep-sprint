import { subDays, isSameDay, startOfToday, parseISO } from 'date-fns'

export function computeStreak(dates: string[]): number {
  if (dates.length === 0) return 0

  const uniqueDays = [...new Set(dates)].sort().reverse()
  const today = startOfToday()

  let streak = 0
  for (let i = 0; i < uniqueDays.length; i++) {
    const expected = subDays(today, i)
    if (isSameDay(parseISO(uniqueDays[i]), expected)) {
      streak++
    } else {
      break
    }
  }
  return streak
}
