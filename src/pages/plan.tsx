import { useState } from "react";
import { StudyPlanImport } from "@/components/study-plan-import";
import { TodaysPlan } from "@/components/todays-plan";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import defaultPlan from "@/lib/ielts-plan.json";
import { useStudyPlanStore } from "@/store/use-study-plan-store";

const PHASE_LABELS: Record<number, string> = {
  1: "Phase 1: Diagnostic + Foundations",
  2: "Phase 2: Intensive Sectional Drills",
  3: "Phase 3: Acceleration",
  4: "Phase 4: Final Polish + Test Readiness",
};

function PhaseGroup({
  phase,
  days,
}: {
  phase: number;
  days: { dayNumber: number; title: string; total: number; done: number }[];
}) {
  const [expanded, setExpanded] = useState(false);
  const allDone = days.every((d) => d.done === d.total);
  const totalTasks = days.reduce((s, d) => s + d.total, 0);
  const doneTasks = days.reduce((s, d) => s + d.done, 0);

  return (
    <Card>
      <CardHeader className="pb-3">
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="flex w-full items-center justify-between text-left cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <CardTitle className="text-sm">{PHASE_LABELS[phase]}</CardTitle>
            {allDone && (
              <Badge variant="secondary" className="text-[10px]">
                Complete
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground tabular-nums">
              {doneTasks}/{totalTasks}
            </span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={`transition-transform ${expanded ? "rotate-180" : ""}`}
              aria-hidden="true"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </div>
        </button>
        <div className="h-1 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-300"
            style={{
              width: `${totalTasks > 0 ? (doneTasks / totalTasks) * 100 : 0}%`,
            }}
          />
        </div>
      </CardHeader>
      {expanded && (
        <CardContent className="pt-0">
          <ul className="space-y-2">
            {days.map((day) => (
              <li
                key={day.dayNumber}
                className="flex items-center gap-2 text-sm"
              >
                <span className="text-muted-foreground tabular-nums w-6 shrink-0">
                  D{day.dayNumber}
                </span>
                <Separator className="w-px h-4" />
                <span className="flex-1 truncate">{day.title}</span>
                <span className="text-xs text-muted-foreground tabular-nums">
                  {day.done}/{day.total}
                </span>
              </li>
            ))}
          </ul>
        </CardContent>
      )}
    </Card>
  );
}

export function Plan() {
  const plan = useStudyPlanStore((s) => s.plan);
  const setPlan = useStudyPlanStore((s) => s.setPlan);

  const phaseSummaries = plan
    ? Object.keys(PHASE_LABELS)
        .map(Number)
        .reduce(
          (acc, phase) => {
            const days = plan.days.filter((d) => d.phase === phase);
            if (days.length === 0) return acc;
            acc.push({
              phase,
              days: days.map((d) => ({
                dayNumber: d.dayNumber,
                title: d.title,
                total: d.tasks.length,
                done: d.tasks.filter((t) => t.done).length,
              })),
            });
            return acc;
          },
          [] as {
            phase: number;
            days: {
              dayNumber: number;
              title: string;
              total: number;
              done: number;
            }[];
          }[],
        )
    : [];

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Study Plan</h1>
        <div className="flex items-center gap-2">
          {plan && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setPlan(defaultPlan as typeof plan)}
            >
              Reset
            </Button>
          )}
          <StudyPlanImport />
        </div>
      </div>

      <TodaysPlan />

      {plan && (
        <>
          <h2 className="text-lg font-semibold">Full Plan</h2>
          <div className="space-y-3">
            {phaseSummaries.map((ps) => (
              <PhaseGroup key={ps.phase} phase={ps.phase} days={ps.days} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
