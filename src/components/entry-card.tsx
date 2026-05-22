import { format, parseISO } from "date-fns";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { TestEntry } from "@/types";
import { TEST_TYPE_LABELS } from "@/types";

interface EntryCardProps {
  entry: TestEntry;
  onDelete: (id: string) => void;
}

const typeColors: Record<string, string> = {
  listening: "bg-sky-500/15 text-sky-400 border-sky-500/30",
  reading: "bg-violet-500/15 text-violet-400 border-violet-500/30",
  writing: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  speaking: "bg-rose-500/15 text-rose-400 border-rose-500/30",
};

function CollapsibleSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="space-y-1">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2"
      >
        {open ? "Hide" : "Show"} {title}
      </button>
      {open && (
        <div className="text-sm text-muted-foreground whitespace-pre-wrap rounded-md bg-background p-2 border">
          {children}
        </div>
      )}
    </div>
  );
}

export function EntryCard({ entry, onDelete }: EntryCardProps) {
  const dateLabel = format(parseISO(entry.date), "MMM d");
  const isWriting = entry.testType === "writing";
  const isSpeaking = entry.testType === "speaking";

  return (
    <Card className="group">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1 space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">{dateLabel}</span>
              <span className="truncate font-medium">{entry.testName}</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className={`text-xs font-normal ${typeColors[entry.testType] ?? ""}`}
              >
                {TEST_TYPE_LABELS[entry.testType]}
              </Badge>
            </div>

            {entry.testLink && !isWriting && (
              <a
                href={entry.testLink}
                target="_blank"
                rel="noopener noreferrer"
                className="block truncate text-sm text-blue-400 hover:underline"
              >
                {entry.testLink}
              </a>
            )}

            {isWriting && (
              <div className="space-y-2">
                {entry.writingTask1 && (
                  <CollapsibleSection title="Task 1">
                    {entry.writingTask1}
                  </CollapsibleSection>
                )}
                {entry.writingTask2 && (
                  <CollapsibleSection title="Task 2">
                    {entry.writingTask2}
                  </CollapsibleSection>
                )}
                {entry.testLink && (
                  <a
                    href={entry.testLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block truncate text-sm text-blue-400 hover:underline"
                  >
                    Prompt link
                  </a>
                )}
              </div>
            )}

            {isSpeaking && entry.audioFileName && (
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
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
                  <title>Audio</title>
                  <path d="M9 18V5l12-2v13" />
                  <circle cx="6" cy="18" r="3" />
                  <circle cx="18" cy="16" r="3" />
                </svg>
                <span>{entry.audioFileName}</span>
              </div>
            )}

            {entry.notes && (
              <>
                <Separator className="my-2" />
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {entry.notes}
                </p>
              </>
            )}
          </div>
          <div className="flex flex-col items-end gap-2">
            <Badge className="text-base px-3 py-1" variant="default">
              {entry.score}
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              className="opacity-0 group-hover:opacity-100 transition-opacity h-6 text-xs text-muted-foreground hover:text-destructive"
              onClick={() => onDelete(entry.id)}
            >
              Delete
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
