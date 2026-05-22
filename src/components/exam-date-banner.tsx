import {
  differenceInDays,
  differenceInHours,
  format,
  parseISO,
} from "date-fns";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useStore } from "@/store/use-store";

export function ExamDateBanner() {
  const targetDate = useStore((s) => s.targetDate);
  const setTargetDate = useStore((s) => s.setTargetDate);
  const [editing, setEditing] = useState(false);
  const [input, setInput] = useState(targetDate ?? "");

  const handleSave = () => {
    if (input) {
      setTargetDate(input);
    } else {
      setTargetDate(null);
    }
    setEditing(false);
  };

  const handleClear = () => {
    setTargetDate(null);
    setInput("");
    setEditing(false);
  };

  if (!targetDate && !editing) {
    return (
      <div className="flex items-center justify-between rounded-xl border bg-card p-4 shadow">
        <p className="text-muted-foreground">No exam date set yet.</p>
        <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
          Set exam date
        </Button>
      </div>
    );
  }

  const diffDays = targetDate
    ? differenceInDays(parseISO(targetDate), new Date())
    : 0;
  const diffHours = targetDate
    ? differenceInHours(parseISO(targetDate), new Date()) % 24
    : 0;
  const formatted = targetDate
    ? format(parseISO(targetDate), "MMM d, yyyy")
    : "";

  return (
    <div className="rounded-xl border bg-card p-4 shadow">
      {editing ? (
        <div className="flex items-center gap-2">
          <Input
            type="date"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="w-fit"
          />
          <Button size="sm" onClick={handleSave}>
            Save
          </Button>
          <Button size="sm" variant="ghost" onClick={handleClear}>
            Clear
          </Button>
        </div>
      ) : (
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">
              {formatted}
              <button
                type="button"
                onClick={() => {
                  if (targetDate) setInput(targetDate);
                  setEditing(true);
                }}
                className="ml-2 text-sm underline underline-offset-2 hover:text-foreground"
              >
                change
              </button>
            </p>
            {diffDays > 0 ? (
              <p className="text-3xl font-bold tracking-tight">
                {diffDays}d {diffHours}h until exam
              </p>
            ) : diffDays === 0 ? (
              <p className="text-3xl font-bold tracking-tight text-destructive">
                Exam day!
              </p>
            ) : (
              <p className="text-lg font-bold text-muted-foreground">
                Exam was {Math.abs(diffDays)}d ago
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
