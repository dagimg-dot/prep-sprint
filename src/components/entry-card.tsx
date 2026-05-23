import { format, parseISO } from "date-fns";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
  const updateEntry = useStore((s) => s.updateEntry);
  const [showErrorForm, setShowErrorForm] = useState(false);
  const [errorLogOpen, setErrorLogOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(entry.testName);
  const [editScore, setEditScore] = useState(String(entry.score));
  const [editRawScore, setEditRawScore] = useState(
    entry.rawScore != null ? String(entry.rawScore) : "",
  );
  const [editTestLink, setEditTestLink] = useState(entry.testLink ?? "");
  const [editNotes, setEditNotes] = useState(entry.notes);
  const [editPartScores, setEditPartScores] = useState(
    entry.partScores?.map((ps) => ({ ...ps })) ?? [],
  );

  const startEditing = () => {
    setEditName(entry.testName);
    setEditScore(String(entry.score));
    setEditRawScore(entry.rawScore != null ? String(entry.rawScore) : "");
    setEditTestLink(entry.testLink ?? "");
    setEditNotes(entry.notes);
    setEditPartScores(entry.partScores?.map((ps) => ({ ...ps })) ?? []);
    setEditing(true);
  };

  const saveEdit = () => {
    updateEntry({
      ...entry,
      testName: editName.trim() || entry.testName,
      score: parseFloat(editScore) || entry.score,
      rawScore: editRawScore ? parseInt(editRawScore, 10) : undefined,
      partScores: editPartScores.filter((ps) => !Number.isNaN(ps.score)),
      testLink: editTestLink.trim() || undefined,
      notes: editNotes.trim(),
    });
    setEditing(false);
  };

  const cancelEdit = () => {
    setEditing(false);
  };

  const copyErrorLog = () => {
    const payload: Record<string, unknown> = {
      testName: entry.testName,
      testType: entry.testType,
      bandScore: entry.score,
      rawScore: entry.rawScore,
      partScores: entry.partScores,
      testLink: entry.testLink,
      errors: (entry.errorLog ?? []).map(
        ({ questionType, category, mistake, fix }: ErrorLogEntry) => ({
          questionType,
          category,
          mistake,
          fix,
        }),
      ),
    };
    if (entry.notes) payload.notes = entry.notes;
    if (entry.timeSpent) payload.timeSpent = entry.timeSpent;
    navigator.clipboard.writeText(JSON.stringify(payload, null, 2)).then(() => {
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
              {editing ? (
                <div className="flex items-center gap-2 flex-1">
                  <Input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="h-7 text-xs flex-1 min-w-0"
                  />
                  <Input
                    type="number"
                    step="0.5"
                    min="0"
                    max="9"
                    value={editScore}
                    onChange={(e) => setEditScore(e.target.value)}
                    className="h-7 text-xs w-16"
                  />
                </div>
              ) : (
                <>
                  <span className="truncate font-medium" title={entry.testName}>
                    {entry.testName}
                  </span>
                  <Badge
                    variant="outline"
                    className={`text-xs font-normal ${typeColors[entry.testType] ?? ""}`}
                  >
                    {TEST_TYPE_LABELS[entry.testType]}
                  </Badge>
                </>
              )}
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {editing
                ? editPartScores.length > 0 && (
                    <span className="flex gap-1 flex-wrap">
                      {editPartScores.map((ps, i) => (
                        <span
                          key={ps.label}
                          className="flex items-center gap-0.5"
                        >
                          <span className="text-[10px] text-muted-foreground">
                            {ps.label}:
                          </span>
                          <Input
                            type="number"
                            min="0"
                            max={ps.max}
                            value={ps.score || ""}
                            onChange={(e) => {
                              const next = [...editPartScores];
                              next[i] = {
                                ...next[i],
                                score: parseInt(e.target.value, 10) || 0,
                              };
                              setEditPartScores(next);
                            }}
                            className="h-6 text-[10px] w-10 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                          />
                          <span className="text-[10px] text-muted-foreground">
                            /{ps.max}
                          </span>
                        </span>
                      ))}
                    </span>
                  )
                : entry.partScores &&
                  entry.partScores.length > 0 && (
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
              {entry.timeSpent && entry.timeSpent.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {entry.timeSpent.map((t) => (
                    <span
                      key={t.label}
                      className="text-[10px] px-1.5 py-0.5 rounded bg-muted"
                    >
                      {t.label}: {t.minutes}m
                    </span>
                  ))}
                </div>
              )}
              {editing ? (
                <Input
                  placeholder="Raw"
                  type="number"
                  min="0"
                  max="40"
                  value={editRawScore}
                  onChange={(e) => setEditRawScore(e.target.value)}
                  className="h-6 text-[10px] w-16"
                />
              ) : (
                entry.rawScore != null && (
                  <span className="text-xs text-muted-foreground tabular-nums">
                    {entry.rawScore}
                    {entry.rawMax != null ? `/${entry.rawMax}` : ""}
                  </span>
                )
              )}
              {editing && (
                <Input
                  placeholder="Test link"
                  value={editTestLink}
                  onChange={(e) => setEditTestLink(e.target.value)}
                  className="h-6 text-[10px] w-28"
                />
              )}
              {!editing && entry.testLink && !isWriting && (
                <a
                  href={entry.testLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] text-blue-400 hover:underline"
                >
                  link
                </a>
              )}
              {editing ? (
                <div className="flex items-center gap-1">
                  <Button
                    size="sm"
                    className="h-6 text-[10px] px-2"
                    onClick={saveEdit}
                    disabled={!editName.trim()}
                  >
                    Save
                  </Button>
                  <button
                    type="button"
                    onClick={cancelEdit}
                    className="text-muted-foreground hover:text-foreground"
                    aria-label="Cancel"
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
                      <path d="M18 6 6 18" />
                      <path d="m6 6 12 12" />
                    </svg>
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={startEditing}
                    className="text-muted-foreground hover:text-foreground"
                    aria-label="Edit entry"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="11"
                      height="11"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                      <path d="m15 5 4 4" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm("Delete this entry?"))
                        onDelete(entry.id);
                    }}
                    className="text-muted-foreground hover:text-destructive"
                    aria-label="Delete entry"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="11"
                      height="11"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M3 6h18" />
                      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={copyErrorLog}
                    className="text-muted-foreground hover:text-foreground"
                    aria-label={copied ? "Copied" : "Copy for agent"}
                  >
                    {copied ? (
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
                        <path d="M20 6 9 17l-5-5" />
                      </svg>
                    ) : (
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
                        <rect
                          width="14"
                          height="14"
                          x="8"
                          y="8"
                          rx="2"
                          ry="2"
                        />
                        <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                      </svg>
                    )}
                  </button>
                </div>
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

            {editing ? (
              <>
                <Separator className="my-2" />
                <Textarea
                  placeholder="What I learned / shortcomings..."
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  rows={3}
                  className="text-sm"
                />
              </>
            ) : (
              entry.notes && (
                <>
                  <Separator className="my-2" />
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {entry.notes}
                  </p>
                </>
              )
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
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
