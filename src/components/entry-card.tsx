import { format, parseISO } from "date-fns";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { useStore } from "@/store/use-store";
import {
  ERROR_CATEGORIES,
  type ErrorLogEntry,
  QUESTION_TYPES,
  TEST_TYPE_LABELS,
  type TestEntry,
  type TestType,
} from "@/types";

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

function AddErrorForm({
  testType,
  onSave,
  onCancel,
}: {
  testType: TestType;
  onSave: (error: ErrorLogEntry) => void;
  onCancel: () => void;
}) {
  const [questionType, setQuestionType] = useState("");
  const [category, setCategory] = useState("");
  const [mistake, setMistake] = useState("");
  const [fix, setFix] = useState("");

  const handleSave = () => {
    if (!mistake.trim()) return;
    onSave({
      id: crypto.randomUUID(),
      questionType: questionType.trim(),
      category: category.trim(),
      mistake: mistake.trim(),
      fix: fix.trim(),
    });
  };

  return (
    <div className="space-y-2 pt-2 border-t border-border">
      <p className="text-xs font-medium text-muted-foreground">New error</p>
      <div className="flex gap-2">
        <Select value={questionType} onValueChange={setQuestionType}>
          <SelectTrigger className="h-7 text-xs flex-1">
            <SelectValue placeholder="Question type" />
          </SelectTrigger>
          <SelectContent>
            {QUESTION_TYPES[testType].map((qt) => (
              <SelectItem key={qt} value={qt} className="text-xs">
                {qt}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="h-7 text-xs w-34">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            {ERROR_CATEGORIES[testType].map((c) => (
              <SelectItem key={c} value={c} className="text-xs">
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Textarea
        placeholder="What went wrong..."
        value={mistake}
        onChange={(e) => setMistake(e.target.value)}
        rows={2}
        className="text-xs"
      />
      <Textarea
        placeholder="How to fix it next time..."
        value={fix}
        onChange={(e) => setFix(e.target.value)}
        rows={2}
        className="text-xs"
      />
      <div className="flex gap-2">
        <Button
          size="sm"
          className="h-7 text-xs"
          onClick={handleSave}
          disabled={!mistake.trim()}
        >
          Save error
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="h-7 text-xs"
          onClick={onCancel}
        >
          Cancel
        </Button>
      </div>
    </div>
  );
}

export function EntryCard({ entry, onDelete }: EntryCardProps) {
  const addError = useStore((s) => s.addError);
  const removeError = useStore((s) => s.removeError);
  const [showErrorForm, setShowErrorForm] = useState(false);
  const [errorLogOpen, setErrorLogOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const copyErrorLog = () => {
    const output = (entry.errorLog ?? []).map(
      ({ questionType, category, mistake, fix }: ErrorLogEntry) => ({
        questionType,
        category,
        mistake,
        fix,
      }),
    );
    navigator.clipboard.writeText(JSON.stringify(output, null, 2)).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const dateLabel = format(parseISO(entry.date), "MMM d");
  const isWriting = entry.testType === "writing";
  const isSpeaking = entry.testType === "speaking";
  const errorCount = entry.errorLog?.length ?? 0;

  return (
    <Card className="group">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1 space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground whitespace-nowrap">
                {dateLabel}
              </span>
              <span className="truncate font-medium" title={entry.testName}>
                {entry.testName}
              </span>
              <Badge
                variant="outline"
                className={`text-xs font-normal ${typeColors[entry.testType] ?? ""}`}
              >
                {TEST_TYPE_LABELS[entry.testType]}
              </Badge>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {entry.partScores && entry.partScores.length > 0 && (
                <span className="flex gap-1">
                  {entry.partScores.map((ps) => (
                    <Badge
                      key={ps.label}
                      variant="outline"
                      className="text-[10px] font-normal"
                    >
                      {ps.label}: {ps.score}/{ps.max}
                    </Badge>
                  ))}
                </span>
              )}
              {entry.rawScore != null && (
                <span className="text-xs text-muted-foreground tabular-nums">
                  {entry.rawScore}
                  {entry.rawMax != null ? `/${entry.rawMax}` : ""}
                </span>
              )}
              {entry.testLink && !isWriting && (
                <a
                  href={entry.testLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] text-blue-400 hover:underline"
                >
                  link
                </a>
              )}
              {errorCount > 0 && (
                <Badge variant="secondary" className="text-[10px]">
                  {errorCount} error{errorCount !== 1 ? "s" : ""}
                </Badge>
              )}
            </div>

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

            <Separator className="my-2" />
            <div>
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setErrorLogOpen(!errorLogOpen)}
                  className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={`transition-transform ${errorLogOpen ? "rotate-90" : ""}`}
                    aria-hidden="true"
                  >
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                  Error Log{errorCount > 0 ? ` (${errorCount})` : ""}
                </button>
                {errorCount > 0 && (
                  <button
                    type="button"
                    onClick={copyErrorLog}
                    className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2"
                  >
                    {copied ? "Copied!" : "Copy for agent"}
                  </button>
                )}
              </div>

              {errorLogOpen && (
                <div className="mt-2 space-y-2">
                  {entry.errorLog?.map((err) => (
                    <div
                      key={err.id}
                      className="rounded-md border border-border bg-background p-2 space-y-1"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {err.category && (
                            <Badge
                              variant="outline"
                              className="text-[10px] font-normal"
                            >
                              {err.category}
                            </Badge>
                          )}
                          {err.questionType && (
                            <span className="text-[10px] text-muted-foreground">
                              {err.questionType}
                            </span>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => removeError(entry.id, err.id)}
                          className="text-muted-foreground hover:text-destructive shrink-0"
                          aria-label="Delete error"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                          >
                            <path d="M18 6 6 18" />
                            <path d="m6 6 12 12" />
                          </svg>
                        </button>
                      </div>
                      <p className="text-xs text-foreground">{err.mistake}</p>
                      {err.fix && (
                        <p className="text-xs text-muted-foreground">
                          → {err.fix}
                        </p>
                      )}
                    </div>
                  ))}

                  {showErrorForm ? (
                    <AddErrorForm
                      testType={entry.testType}
                      onSave={(error) => {
                        addError(entry.id, error);
                        setShowErrorForm(false);
                      }}
                      onCancel={() => setShowErrorForm(false)}
                    />
                  ) : (
                    <button
                      type="button"
                      onClick={() => setShowErrorForm(true)}
                      className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2"
                    >
                      + Add error
                    </button>
                  )}
                </div>
              )}
            </div>
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
