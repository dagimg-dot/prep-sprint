import { useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { useStudyPlanStore } from "@/store/use-study-plan-store";
import type { StudyPlan } from "@/types";

function isStudyPlan(raw: unknown): raw is StudyPlan {
  if (!raw || typeof raw !== "object") return false;
  const p = raw as StudyPlan;
  if (typeof p.version !== "number") return false;
  if (typeof p.name !== "string") return false;
  if (!Array.isArray(p.days)) return false;
  return p.days.every(
    (d) =>
      typeof d.dayNumber === "number" &&
      typeof d.phase === "number" &&
      typeof d.title === "string" &&
      Array.isArray(d.tasks) &&
      d.tasks.every(
        (t) =>
          typeof t.id === "string" &&
          typeof t.text === "string" &&
          typeof t.done === "boolean",
      ),
  );
}

export function StudyPlanImport() {
  const fileRef = useRef<HTMLInputElement>(null);
  const setPlan = useStudyPlanStore((s) => s.setPlan);

  const handleImport = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const data = JSON.parse(reader.result as string);
          if (!isStudyPlan(data)) {
            throw new Error("Invalid study plan structure");
          }
          setPlan(data);
          alert(`Study plan "${data.name}" loaded (${data.days.length} days).`);
        } catch {
          alert(
            "Invalid study plan file. Expected a JSON file with `version`, `name`, and `days` fields.",
          );
        }
      };
      reader.readAsText(file);
      e.target.value = "";
    },
    [setPlan],
  );

  return (
    <>
      <input
        type="file"
        accept=".json"
        ref={fileRef}
        onChange={handleImport}
        className="hidden"
      />
      <Button
        variant="outline"
        size="sm"
        onClick={() => fileRef.current?.click()}
      >
        Import plan
      </Button>
    </>
  );
}
