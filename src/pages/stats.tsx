import { useStore } from '@/store/use-store'
import {
  startOfMonth,
  format,
  parseISO,
  isSameDay,
  startOfWeek,
  addDays,
  subMonths,
  differenceInDays,
} from 'date-fns'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TEST_TYPE_LABELS, type TestType } from '@/types'

export function Stats() {
  const entries = useStore((s) => s.entries)

  if (entries.length === 0) {
    return (
      <div className="mx-auto max-w-2xl py-12 text-center text-muted-foreground">
        No data yet. Add test entries to see stats.
      </div>
    )
  }

  const allScores = entries.map((e) => e.score)
  const avg = allScores.reduce((a, b) => a + b, 0) / allScores.length
  const highest = Math.max(...allScores)
  const lowest = Math.min(...allScores)
  const sorted = [...entries].sort(
    (a, b) => parseISO(a.date).getTime() - parseISO(b.date).getTime(),
  )

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">Stats</h1>

      <div className="grid grid-cols-3 gap-3">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold">{avg.toFixed(1)}</p>
            <p className="text-sm text-muted-foreground">Average</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-emerald-400">{highest}</p>
            <p className="text-sm text-muted-foreground">Highest</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-orange-400">{lowest}</p>
            <p className="text-sm text-muted-foreground">Lowest</p>
          </CardContent>
        </Card>
      </div>

      <Card className="p-4">
        <CardTitle className="text-base mb-3">Average by type</CardTitle>
        <div className="grid grid-cols-2 gap-3">
          {(Object.keys(TEST_TYPE_LABELS) as TestType[]).map((type) => {
            const typeEntries = entries.filter((e) => e.testType === type)
            const typeAvg =
              typeEntries.length > 0
                ? typeEntries.reduce((s, e) => s + e.score, 0) / typeEntries.length
                : null
            return (
              <div key={type} className="rounded-lg border bg-background p-3">
                <p className="text-sm text-muted-foreground">{TEST_TYPE_LABELS[type]}</p>
                <p className="text-xl font-bold">
                  {typeAvg !== null ? typeAvg.toFixed(1) : '—'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {typeEntries.length} test{typeEntries.length !== 1 ? 's' : ''}
                </p>
              </div>
            )
          })}
        </div>
      </Card>

      {sorted.length >= 2 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Score trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ScoreTrendChart entries={sorted} />
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Activity calendar</CardTitle>
        </CardHeader>
        <CardContent>
          <StreakCalendar entries={entries} />
        </CardContent>
      </Card>
    </div>
  )
}

function ScoreTrendChart({
  entries,
}: {
  entries: { date: string; score: number }[]
}) {
  const minScore = Math.min(...entries.map((e) => e.score)) - 0.5
  const maxScore = Math.max(...entries.map((e) => e.score)) + 0.5
  const range = maxScore - minScore

  const points = entries.map((e, i) => {
    const x = entries.length > 1 ? (i / (entries.length - 1)) * 100 : 50
    const y = range > 0 ? 100 - ((e.score - minScore) / range) * 100 : 50
    return `${x},${y}`
  })

  return (
    <svg viewBox="0 0 100 100" className="w-full h-32" preserveAspectRatio="none" role="img" aria-label="Score trend chart">
      <title>Score trend</title>
      <polyline
        points={points.join(' ')}
        fill="none"
        stroke="oklch(0.715 0.143 215.221)"
        strokeWidth="1.5"
        vectorEffect="non-scaling-stroke"
      />
      {entries.map((e, i) => {
        const x = entries.length > 1 ? (i / (entries.length - 1)) * 100 : 50
        const y = range > 0 ? 100 - ((e.score - minScore) / range) * 100 : 50
        return (
          <circle
            key={e.date}
            cx={x}
            cy={y}
            r="1.5"
            fill="oklch(0.546 0.245 262.881)"
            vectorEffect="non-scaling-stroke"
          />
        )
      })}
    </svg>
  )
}

function StreakCalendar({ entries }: { entries: { date: string }[] }) {
  const today = new Date()
  const startDate = subMonths(startOfMonth(today), 2)
  const entryDates = new Set(entries.map((e) => e.date))

  const weeks: Date[][] = []
  let currentWeek: Date[] = []
  const weekStart = startOfWeek(startDate, { weekStartsOn: 1 })

  for (let i = 0; i < differenceInDays(today, weekStart) + 1; i++) {
    const day = addDays(weekStart, i)
    currentWeek.push(day)
    if (currentWeek.length === 7) {
      weeks.push(currentWeek)
      currentWeek = []
    }
  }
  if (currentWeek.length > 0) weeks.push(currentWeek)

  return (
    <div className="space-y-1">
      <div className="flex gap-0.5">
        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d) => (
          <div
            key={d}
            className="w-4 text-[10px] text-muted-foreground text-center"
          >
            {d}
          </div>
        ))}
      </div>
      {weeks.map((week) => (
        <div key={format(week[0], 'yyyy-MM-dd')} className="flex gap-0.5">
          {week.map((day) => {
            const key = format(day, 'yyyy-MM-dd')
            const hasEntry = entryDates.has(key)
            const isToday = isSameDay(day, today)
            return (
              <div
                key={key}
                className={`w-4 h-4 rounded-sm ${
                  hasEntry
                    ? 'bg-emerald-500'
                    : isToday
                      ? 'border border-dashed border-muted-foreground'
                      : 'bg-muted'
                }`}
                title={`${format(day, 'MMM d')}${hasEntry ? ' — active' : ''}`}
              />
            )
          })}
        </div>
      ))}
    </div>
  )
}
