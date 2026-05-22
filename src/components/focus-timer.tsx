import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { TEST_TYPE_LABELS, TEST_TYPES, type TestType } from "@/types";

const TARGET_TIMES: Record<TestType, number> = {
  listening: 30 * 60,
  reading: 60 * 60,
  writing: 60 * 60,
  speaking: 14 * 60,
};

function formatTime(totalSec: number): string {
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  if (h > 0) {
    return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function FocusTimer() {
  const [selectedType, setSelectedType] = useState<TestType | null>(null);
  const [state, setState] = useState<"idle" | "running" | "paused">("idle");
  const [elapsed, setElapsed] = useState(0);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTs = useRef(0);
  const accrued = useRef(0);

  const tick = () => {
    const delta = Math.floor((Date.now() - startTs.current) / 1000);
    setElapsed(accrued.current + delta);
  };

  const clearTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const handleSelectType = (t: TestType) => {
    clearTimer();
    setElapsed(0);
    accrued.current = 0;
    setState("idle");
    setSelectedType(t);
  };

  const handleStart = () => {
    startTs.current = Date.now();
    setState("running");
    intervalRef.current = setInterval(tick, 200);
  };

  const handlePause = () => {
    clearTimer();
    accrued.current = elapsed;
    setState("paused");
  };

  const handleStop = () => {
    clearTimer();
    setElapsed(0);
    accrued.current = 0;
    setState("idle");
    setSelectedType(null);
  };

  const targetTime = selectedType ? TARGET_TIMES[selectedType] : null;
  const remaining = targetTime !== null ? Math.max(0, targetTime - elapsed) : 0;
  const isComplete = targetTime !== null && elapsed >= targetTime;
  const progress =
    targetTime !== null && targetTime > 0
      ? Math.min(elapsed / targetTime, 1)
      : 0;

  return (
    <div className="flex h-full gap-3">
      <div className="flex flex-col gap-1">
        {TEST_TYPES.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => handleSelectType(t)}
            className={`text-xs px-2 py-1 rounded-md border transition-colors ${
              selectedType === t
                ? "border-primary bg-primary/10 text-foreground"
                : "border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            {TEST_TYPE_LABELS[t]}
          </button>
        ))}
      </div>

      {selectedType ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-2">
          <span className="text-3xl font-mono font-bold tabular-nums">
            {formatTime(remaining)}
          </span>

          <div className="w-full h-1 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-300"
              style={{ width: `${progress * 100}%` }}
            />
          </div>

          <div className="flex items-center gap-2">
            {state === "idle" && (
              <Button size="sm" onClick={handleStart}>
                Start
              </Button>
            )}
            {state === "running" && (
              <Button size="sm" variant="outline" onClick={handlePause}>
                Pause
              </Button>
            )}
            {state === "paused" && (
              <>
                <Button size="sm" onClick={handleStart}>
                  Resume
                </Button>
                <Button size="sm" variant="outline" onClick={handleStop}>
                  Stop
                </Button>
              </>
            )}
          </div>

          {isComplete && (
            <p className="text-xs text-muted-foreground">Target reached!</p>
          )}
        </div>
      ) : (
        <div className="flex flex-1 items-center justify-center">
          <p className="text-xs text-muted-foreground">
            Select a section to begin timing
          </p>
        </div>
      )}
    </div>
  );
}
