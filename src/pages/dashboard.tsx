import { AddEntryForm } from "@/components/add-entry-form";
import { EntryCard } from "@/components/entry-card";
import { ExamDateBanner } from "@/components/exam-date-banner";
import { NotebookPanel } from "@/components/notebook-panel";
import { StatsHeader } from "@/components/stats-header";
import { StreakBadge } from "@/components/streak-badge";
import { StreakCalendar } from "@/components/streak-calendar";
import { Card, CardTitle } from "@/components/ui/card";
import { useStore } from "@/store/use-store";

export function Dashboard() {
  const entries = useStore((s) => s.entries);
  const removeEntry = useStore((s) => s.removeEntry);

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-6">
      <ExamDateBanner />

      <div className="flex gap-6">
        <Card className="p-4 rounded-md">
          <CardTitle className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">
            Activity
          </CardTitle>
          <StreakCalendar entries={entries} compact />
        </Card>

        <Card className="flex-1 p-4 rounded-md flex items-center justify-center text-muted-foreground text-sm">
          Placeholder
        </Card>
      </div>

      <div className="flex items-center justify-between">
        <StreakBadge />
        <StatsHeader />
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[4fr_6fr] gap-6">
        <div className="space-y-6 overflow-y-auto">
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

        <div className="h-full lg:sticky lg:top-20">
          <NotebookPanel />
        </div>
      </div>
    </div>
  );
}
