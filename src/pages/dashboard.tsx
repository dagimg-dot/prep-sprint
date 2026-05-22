import { AddEntryForm } from "@/components/add-entry-form";
import { EntryCard } from "@/components/entry-card";
import { ExamDateBanner } from "@/components/exam-date-banner";
import { NotebookPanel } from "@/components/notebook-panel";
import { StatsHeader } from "@/components/stats-header";
import { StreakBadge } from "@/components/streak-badge";
import { useStore } from "@/store/use-store";

export function Dashboard() {
  const entries = useStore((s) => s.entries);
  const removeEntry = useStore((s) => s.removeEntry);

  return (
    <div className="space-y-6">
      <ExamDateBanner />

      <div className="flex items-center justify-between">
        <StreakBadge />
        <StatsHeader />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[4fr_6fr] gap-6">
        <div className="space-y-6">
          <AddEntryForm />

          {entries.length > 0 && (
            <div className="space-y-2">
              {entries.map((entry) => (
                <EntryCard
                  key={entry.id}
                  entry={entry}
                  onDelete={removeEntry}
                />
              ))}
            </div>
          )}

          {entries.length === 0 && (
            <p className="py-12 text-center text-muted-foreground">
              No entries yet. Add your first test result above.
            </p>
          )}
        </div>

        <div className="lg:sticky lg:top-20 lg:self-start">
          <NotebookPanel />
        </div>
      </div>
    </div>
  );
}
