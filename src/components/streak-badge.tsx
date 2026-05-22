import { useStore } from '@/store/use-store'
import { computeStreak } from '@/lib/streak'

export function StreakBadge() {
  const entries = useStore((s) => s.entries)
  const dates = entries.map((e) => e.date)
  const streak = computeStreak(dates)

  if (streak === 0) return null

  return (
    <div className="flex items-center gap-1.5 text-sm">
      <span className="text-orange-400" aria-hidden>
        🔥
      </span>
      <span className="font-semibold">{streak}</span>
      <span className="text-muted-foreground">day streak</span>
    </div>
  )
}
