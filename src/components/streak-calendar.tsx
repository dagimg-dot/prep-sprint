import {
  addDays,
  differenceInDays,
  format,
  getMonth,
  isSameDay,
  startOfWeek,
} from "date-fns";

export function StreakCalendar({
  entries,
  compact,
}: {
  entries: { date: string }[];
  compact?: boolean;
}) {
  const today = new Date();
  const sprintStart = new Date(2026, 4, 22); // May 22
  const sprintEnd = new Date(2026, 5, 17); // June 17
  const startDate = startOfWeek(sprintStart, { weekStartsOn: 1 });

  const entryCounts = new Map<string, number>();
  for (const e of entries) {
    entryCounts.set(e.date, (entryCounts.get(e.date) ?? 0) + 1);
  }

  const totalDays = differenceInDays(sprintEnd, startDate) + 1;
  const weeks: Date[][] = [];
  let currentWeek: Date[] = [];

  for (let i = 0; i < totalDays; i++) {
    const day = addDays(startDate, i);
    currentWeek.push(day);
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  }
  if (currentWeek.length > 0) {
    const last = currentWeek[currentWeek.length - 1];
    for (let i = 1; currentWeek.length < 7; i++) {
      currentWeek.push(addDays(last, i));
    }
    weeks.push(currentWeek);
  }

  const cellSize = compact ? 10 : 14;
  const gap = 3;
  const colW = cellSize + gap;

  const monthLabels: { label: string; col: number; span: number }[] = [];
  let lastMonth = -1;
  let monthStartCol = 0;
  weeks.forEach((week, idx) => {
    const m = getMonth(week[0]);
    if (m !== lastMonth) {
      if (lastMonth !== -1) {
        monthLabels[monthLabels.length - 1].span = idx - monthStartCol;
      }
      monthLabels.push({ label: format(week[0], "MMM"), col: idx, span: 0 });
      monthStartCol = idx;
      lastMonth = m;
    }
  });
  if (monthLabels.length > 0) {
    monthLabels[monthLabels.length - 1].span = weeks.length - monthStartCol;
  }

  const cell = compact ? "w-[10px] h-[10px]" : "w-[14px] h-[14px]";

  const getIntensity = (count: number) => {
    if (count === 0) return "";
    if (count <= 1) return "bg-emerald-400";
    if (count <= 3) return "bg-emerald-500";
    return "bg-emerald-600";
  };

  const dayLabels = ["", "M", "", "W", "", "F", ""];

  return (
    <div
      className="overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
      style={{ minWidth: 0 }}
    >
      <div className="inline-flex flex-col gap-[2px]">
        <div className="flex gap-[3px]" style={{ paddingLeft: "28px" }}>
          {monthLabels.map((m) => (
            <div
              key={m.label}
              className="text-[10px] text-muted-foreground leading-none pt-0.5 shrink-0"
              style={{ width: `${m.span * colW - gap}px` }}
            >
              {m.label}
            </div>
          ))}
        </div>

        {Array.from({ length: 7 }, (_, dayIdx) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: fixed 7-day array, stable order
          <div key={dayIdx} className="flex gap-[3px] items-center">
            <div className="w-4 text-left text-[10px] text-muted-foreground leading-none shrink-0">
              {dayLabels[dayIdx]}
            </div>
            {weeks.map((week) => {
              const date = week[dayIdx];
              const key = format(date, "yyyy-MM-dd");
              const count = entryCounts.get(key) ?? 0;
              if (date > sprintEnd) {
                return (
                  <div key={key} className={`${cell} rounded-sm shrink-0`} />
                );
              }
              const isTodayDate = isSameDay(date, today);
              return (
                <div
                  key={key}
                  className={`${cell} rounded-sm shrink-0 ${
                    count > 0
                      ? getIntensity(count)
                      : isTodayDate
                        ? "border border-dashed border-muted-foreground"
                        : "bg-muted"
                  }`}
                  title={`${format(date, "MMM d, yyyy")}${count > 0 ? ` — ${count} test${count > 1 ? "s" : ""}` : ""}`}
                />
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
