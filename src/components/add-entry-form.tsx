import { format } from "date-fns";
import { useEffect, useState } from "react";
import { TypeSpecificFields } from "@/components/type-specific-fields";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useStore } from "@/store/use-store";
import {
  ERROR_CATEGORIES,
  type ErrorLogEntry,
  QUESTION_TYPES,
  TEST_TYPE_LABELS,
  TEST_TYPES,
  type TestEntry,
  type TestType,
} from "@/types";

export function AddEntryForm() {
  const addEntry = useStore((s) => s.addEntry);
  const [testName, setTestName] = useState("");
  const [testType, setTestType] = useState<TestType>("listening");
  const [score, setScore] = useState("");
  const [testLink, setTestLink] = useState("");
  const [writingTask1, setWritingTask1] = useState("");
  const [writingTask2, setWritingTask2] = useState("");
  const [audioFileName, setAudioFileName] = useState("");
  const [notes, setNotes] = useState("");
  const [expanded, setExpanded] = useState(false);
  const [rawScore, setRawScore] = useState("");
  const [partScores, setPartScores] = useState<
    { label: string; score: string; max: string }[]
  >([]);

  const [errorLogOpen, setErrorLogOpen] = useState(false);
  const [pendingErrors, setPendingErrors] = useState<ErrorLogEntry[]>([]);
  const [errQuestionType, setErrQuestionType] = useState("");
  const [errCategory, setErrCategory] = useState("");
  const [errMistake, setErrMistake] = useState("");
  const [errFix, setErrFix] = useState("");

  useEffect(() => {
    if (testType === "reading") {
      setPartScores([
        { label: "Passage 1", score: "", max: "13" },
        { label: "Passage 2", score: "", max: "13" },
        { label: "Passage 3", score: "", max: "14" },
      ]);
    } else if (testType === "listening") {
      setPartScores([
        { label: "Section 1", score: "", max: "10" },
        { label: "Section 2", score: "", max: "10" },
        { label: "Section 3", score: "", max: "10" },
        { label: "Section 4", score: "", max: "10" },
      ]);
    } else {
      setPartScores([]);
    }
  }, [testType]);

  const addPendingError = () => {
    if (!errMistake.trim()) return;
    setPendingErrors((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        questionType: errQuestionType.trim(),
        category: errCategory.trim(),
        mistake: errMistake.trim(),
        fix: errFix.trim(),
      },
    ]);
    setErrQuestionType("");
    setErrCategory("");
    setErrMistake("");
    setErrFix("");
  };

  const removePendingError = (id: string) => {
    setPendingErrors((prev) => prev.filter((e) => e.id !== id));
  };

  const [copied, setCopied] = useState(false);

  const copyErrorLog = () => {
    const payload: Record<string, unknown> = {
      errors: pendingErrors.map(({ questionType, category, mistake, fix }) => ({
        questionType,
        category,
        mistake,
        fix,
      })),
    };
    if (notes.trim()) payload.notes = notes.trim();
    navigator.clipboard.writeText(JSON.stringify(payload, null, 2)).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleSubmit = () => {
    if (!testName.trim() || !score.trim()) return;

    const parsedRaw = parseInt(rawScore, 10);
    const parsedParts = partScores
      .map((p) => ({
        label: p.label,
        score: parseInt(p.score, 10),
        max: parseInt(p.max, 10),
      }))
      .filter((p) => !Number.isNaN(p.score));

    const entry: TestEntry = {
      id: crypto.randomUUID(),
      testName: testName.trim(),
      testType,
      score: parseFloat(score),
      rawScore: !Number.isNaN(parsedRaw) ? parsedRaw : undefined,
      rawMax:
        testType === "reading" || testType === "listening" ? 40 : undefined,
      partScores: parsedParts.length > 0 ? parsedParts : undefined,
      notes: notes.trim(),
      date: format(new Date(), "yyyy-MM-dd"),
      testLink: undefined,
      writingTask1: undefined,
      writingTask2: undefined,
      audioFileName: undefined,
      errorLog: pendingErrors,
    };

    if (testType === "listening" || testType === "reading") {
      entry.testLink = testLink.trim() || undefined;
    }
    if (testType === "writing") {
      entry.writingTask1 = writingTask1.trim() || undefined;
      entry.writingTask2 = writingTask2.trim() || undefined;
      entry.testLink = testLink.trim() || undefined;
    }
    if (testType === "speaking") {
      entry.audioFileName = audioFileName || undefined;
      entry.testLink = testLink.trim() || undefined;
    }

    addEntry(entry);

    setTestName("");
    setTestType("listening");
    setScore("");
    setRawScore("");
    setPartScores([]);
    setTestLink("");
    setWritingTask1("");
    setWritingTask2("");
    setAudioFileName("");
    setNotes("");
    setPendingErrors([]);
    setErrorLogOpen(false);
    setExpanded(false);
  };

  if (!expanded) {
    return (
      <Button
        className="w-full py-6 text-base"
        variant="outline"
        onClick={() => setExpanded(true)}
      >
        + Add test result
      </Button>
    );
  }

  const isValid =
    testName.trim() && score.trim() && !Number.isNaN(parseFloat(score));

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">New test result</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Input
          placeholder="Test name (e.g. Cambridge 17 Test 2)"
          value={testName}
          onChange={(e) => setTestName(e.target.value)}
        />
        <Select
          value={testType}
          onValueChange={(v) => setTestType(v as TestType)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select test type" />
          </SelectTrigger>
          <SelectContent>
            {TEST_TYPES.map((t) => (
              <SelectItem key={t} value={t}>
                {TEST_TYPE_LABELS[t]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          placeholder="Score (e.g. 7.5)"
          type="number"
          step="0.5"
          min="0"
          max="9"
          value={score}
          onChange={(e) => setScore(e.target.value)}
        />

        <TypeSpecificFields
          testType={testType}
          testLink={testLink}
          writingTask1={writingTask1}
          writingTask2={writingTask2}
          audioFileName={audioFileName}
          onTestLinkChange={setTestLink}
          onWritingTask1Change={setWritingTask1}
          onWritingTask2Change={setWritingTask2}
          onAudioFileChange={setAudioFileName}
          rawScore={rawScore}
          onRawScoreChange={setRawScore}
          partScores={partScores}
          onPartScoresChange={setPartScores}
        />

        <Textarea
          placeholder="What I learned / shortcomings..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
        />

        {/* Error Log Section */}
        <div>
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
            Error Log
            {pendingErrors.length > 0 ? ` (${pendingErrors.length})` : ""}
          </button>

          {errorLogOpen && (
            <div className="mt-2 space-y-2">
              {pendingErrors.length > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    {pendingErrors.length} pending
                  </span>
                  <button
                    type="button"
                    onClick={copyErrorLog}
                    className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2"
                  >
                    {copied ? "Copied!" : "Copy for agent"}
                  </button>
                </div>
              )}
              {pendingErrors.map((err) => (
                <div
                  key={err.id}
                  className="rounded-md border border-border bg-background p-2 space-y-1"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {err.category && (
                        <span className="text-[10px] font-medium text-muted-foreground uppercase">
                          {err.category}
                        </span>
                      )}
                      {err.questionType && (
                        <span className="text-[10px] text-muted-foreground">
                          {err.questionType}
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => removePendingError(err.id)}
                      className="text-muted-foreground hover:text-destructive"
                      aria-label="Remove error"
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
                  <p className="text-xs">{err.mistake}</p>
                  {err.fix && (
                    <p className="text-xs text-muted-foreground">→ {err.fix}</p>
                  )}
                </div>
              ))}

              <div className="space-y-2 pt-1">
                <div className="flex gap-2">
                  <Select
                    value={errQuestionType}
                    onValueChange={setErrQuestionType}
                  >
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
                  <Select value={errCategory} onValueChange={setErrCategory}>
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
                  value={errMistake}
                  onChange={(e) => setErrMistake(e.target.value)}
                  rows={2}
                  className="text-xs"
                />
                <Textarea
                  placeholder="How to fix it next time..."
                  value={errFix}
                  onChange={(e) => setErrFix(e.target.value)}
                  rows={2}
                  className="text-xs"
                />
                <Button
                  size="sm"
                  variant="secondary"
                  className="h-7 text-xs"
                  onClick={addPendingError}
                  disabled={!errMistake.trim()}
                >
                  Add to error log
                </Button>
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <Button onClick={handleSubmit} disabled={!isValid}>
            Add entry
          </Button>
          <Button variant="ghost" onClick={() => setExpanded(false)}>
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
