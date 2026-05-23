import { differenceInDays, parseISO } from "date-fns";
import { useState } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useStore } from "@/store/use-store";
import { useStudyPlanStore } from "@/store/use-study-plan-store";
import type { StudyDay } from "@/types";

const PHASE_LABELS: Record<number, string> = {
  1: "Diagnostic + Foundations",
  2: "Intensive Sectional Drills",
  3: "Acceleration",
  4: "Final Polish + Test Readiness",
};

function getCurrentDayNumber(targetDate: string | null): number | null {
  if (!targetDate) return null;
  const exam = parseISO(targetDate);
  const today = new Date();
  const daysUntilExam = differenceInDays(exam, today);
  const dayNumber = 25 - daysUntilExam;
  if (dayNumber < 1 || dayNumber > 24) return null;
  return dayNumber;
}

function TaskChecklist({
  day,
  toggleTask,
}: {
  day: StudyDay;
  toggleTask: (dayNumber: number, taskId: string) => void;
}) {
  const done = day.tasks.filter((t) => t.done).length;
  const total = day.tasks.length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <span className="text-sm text-muted-foreground">
          {done}/{total} tasks done
        </span>
        <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-300"
            style={{ width: `${pct}%` }}
          />
        </div>
        <span className="text-xs font-medium tabular-nums">{pct}%</span>
      </div>

      <ul className="space-y-1">
        {day.tasks.map((task) => (
          <li key={task.id} className="group flex items-start gap-2">
            <button
              type="button"
              onClick={() => toggleTask(day.dayNumber, task.id)}
              className={`mt-0.5 shrink-0 w-4 h-4 rounded border-2 flex items-center justify-center transition-colors cursor-pointer ${
                task.done
                  ? "bg-primary border-primary text-primary-foreground"
                  : "border-muted-foreground/40 hover:border-primary"
              }`}
              aria-label={task.done ? "Mark as not done" : "Mark as done"}
            >
              {task.done && (
                <svg
                  viewBox="0 0 12 12"
                  className="w-3 h-3"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <polyline points="2 6 5 9 10 3" />
                </svg>
              )}
            </button>
            <span
              className={`text-sm leading-relaxed [&_a]:underline [&_a]:underline-offset-2 [&_a]:hover:text-primary ${
                task.done ? "line-through text-muted-foreground/60" : ""
              }`}
            >
              <Markdown
                components={{
                  p: ({ children }) => <>{children}</>,
                }}
                remarkPlugins={[remarkGfm]}
              >
                {task.text}
              </Markdown>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function TodaysPlan() {
  const targetDate = useStore((s) => s.targetDate);
  const plan = useStudyPlanStore((s) => s.plan);
  const toggleTask = useStudyPlanStore((s) => s.toggleTask);

  const currentDay = targetDate ? getCurrentDayNumber(targetDate) : null;
  const [viewingDay, setViewingDay] = useState(currentDay ?? 1);

  if (!plan) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Today&apos;s Plan</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No study plan loaded. Import a plan JSON file to get started.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!targetDate) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Today&apos;s Plan</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Set your exam date to see today&apos;s plan.
          </p>
        </CardContent>
      </Card>
    );
  }

  const day = plan.days.find((d) => d.dayNumber === viewingDay);
  if (!day) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Today&apos;s Plan</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No tasks for Day {viewingDay}.
          </p>
        </CardContent>
      </Card>
    );
  }

  const phaseLabel = PHASE_LABELS[day.phase] ?? `Phase ${day.phase}`;
  const isToday = currentDay === viewingDay;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">
            {isToday ? "Today&apos;s Plan" : `Day ${viewingDay}`}
          </CardTitle>
          <div className="flex items-center gap-2">
            {isToday && <Badge variant="secondary">Today</Badge>}
            <Badge variant="secondary">Day {day.dayNumber}/24</Badge>
          </div>
        </div>
        <div className="flex items-center justify-between gap-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2 min-w-0">
            <span>{phaseLabel}</span>
            <Separator className="w-3 shrink-0" />
            <span className="truncate">{day.title}</span>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              disabled={viewingDay <= 1}
              onClick={() => setViewingDay(viewingDay - 1)}
              aria-label="Previous day"
            >
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
                aria-hidden="true"
              >
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              disabled={viewingDay >= 24}
              onClick={() => setViewingDay(viewingDay + 1)}
              aria-label="Next day"
            >
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
                aria-hidden="true"
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <TaskChecklist day={day} toggleTask={toggleTask} />
      </CardContent>
    </Card>
  );
}
