import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { TestType } from "@/types";

interface PartScoreInput {
  label: string;
  score: string;
  max: string;
}

interface TimeSpentInput {
  label: string;
  minutes: string;
}

interface TypeSpecificFieldsProps {
  testType: TestType;
  testLink: string;
  writingTask1: string;
  writingTask2: string;
  audioFileName: string;
  onTestLinkChange: (v: string) => void;
  onWritingTask1Change: (v: string) => void;
  onWritingTask2Change: (v: string) => void;
  onAudioFileChange: (name: string) => void;
  rawScore?: string;
  onRawScoreChange?: (v: string) => void;
  partScores?: PartScoreInput[];
  onPartScoresChange?: (scores: PartScoreInput[]) => void;
  timeSpentInputs: TimeSpentInput[];
  onTimeSpentInputsChange: (time: TimeSpentInput[]) => void;
}

export function TypeSpecificFields(props: TypeSpecificFieldsProps) {
  switch (props.testType) {
    case "listening":
    case "reading":
      return <LinkFields {...props} />;
    case "writing":
      return <WritingFields {...props} />;
    case "speaking":
      return <SpeakingFields {...props} />;
  }
}

function LinkFields({
  testLink,
  onTestLinkChange,
  rawScore,
  onRawScoreChange,
  partScores,
  onPartScoresChange,
  timeSpentInputs,
  onTimeSpentInputsChange,
}: TypeSpecificFieldsProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-end gap-2">
        <div className="flex-1">
          <p className="text-xs text-muted-foreground mb-1">Raw score</p>
          <Input
            placeholder="0"
            type="number"
            min="0"
            max="40"
            value={rawScore ?? ""}
            onChange={(e) => onRawScoreChange?.(e.target.value)}
          />
        </div>
        <span className="text-sm text-muted-foreground pb-2">/ 40</span>
      </div>

      {partScores && onPartScoresChange && partScores.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">Per-part breakdown</p>
          <div className="grid grid-cols-2 gap-2">
            {partScores.map((part, i) => (
              <div key={part.label} className="flex items-end gap-1.5">
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] text-muted-foreground mb-0.5 truncate">
                    {part.label}
                  </p>
                  <Input
                    placeholder="0"
                    type="number"
                    min="0"
                    value={part.score}
                    onChange={(e) => {
                      const next = [...partScores];
                      next[i] = { ...next[i], score: e.target.value };
                      onPartScoresChange(next);
                    }}
                    className="h-7 text-xs"
                  />
                </div>
                <span className="text-xs text-muted-foreground pb-1.5 shrink-0">
                  / {part.max}
                </span>
                <Input
                  type="number"
                  min="0"
                  placeholder="min"
                  className="h-7 text-xs w-16"
                  value={timeSpentInputs[i]?.minutes ?? ""}
                  onChange={(e) => {
                    const next = [...timeSpentInputs];
                    next[i] = { ...next[i], minutes: e.target.value };
                    onTimeSpentInputsChange(next);
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      <Input
        placeholder="Test link (URL)"
        type="url"
        value={testLink}
        onChange={(e) => onTestLinkChange(e.target.value)}
      />
    </div>
  );
}

function WritingFields({
  writingTask1,
  writingTask2,
  testLink,
  onWritingTask1Change,
  onWritingTask2Change,
  onTestLinkChange,
  timeSpentInputs,
  onTimeSpentInputsChange,
}: TypeSpecificFieldsProps) {
  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <p className="text-sm font-medium text-muted-foreground">
          Task 1{" "}
          <span className="text-xs">(150+ words — describe the visual)</span>
        </p>
        <Textarea
          placeholder="Paste or type your Task 1 response..."
          value={writingTask1}
          onChange={(e) => onWritingTask1Change(e.target.value)}
          rows={6}
        />
      </div>
      <div className="space-y-1.5">
        <p className="text-sm font-medium text-muted-foreground">
          Task 2 <span className="text-xs">(250+ words — essay)</span>
        </p>
        <Textarea
          placeholder="Paste or type your Task 2 response..."
          value={writingTask2}
          onChange={(e) => onWritingTask2Change(e.target.value)}
          rows={8}
        />
      </div>
      <div className="space-y-1.5">
        <p className="text-xs text-muted-foreground">Time spent</p>
        {timeSpentInputs.map((t, i) => (
          <div key={t.label} className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground w-12">{t.label}</span>
            <Input
              type="number"
              min="0"
              placeholder="min"
              className="h-7 text-xs w-16"
              value={t.minutes}
              onChange={(e) => {
                const next = [...timeSpentInputs];
                next[i] = { ...next[i], minutes: e.target.value };
                onTimeSpentInputsChange(next);
              }}
            />
            <span className="text-xs text-muted-foreground">min</span>
          </div>
        ))}
      </div>
      <Input
        placeholder="Link to prompt (optional)"
        type="url"
        value={testLink}
        onChange={(e) => onTestLinkChange(e.target.value)}
      />
    </div>
  );
}

function SpeakingFields({
  audioFileName,
  testLink,
  onAudioFileChange,
  onTestLinkChange,
  timeSpentInputs,
  onTimeSpentInputsChange,
}: TypeSpecificFieldsProps) {
  const handleClick = () => {
    const fakeName = `speaking-recording-${Date.now()}.webm`;
    onAudioFileChange(fakeName);
    console.log("[upload stub]", fakeName);
  };

  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <p className="text-sm font-medium text-muted-foreground">
          Audio recording
        </p>
        <p className="text-xs text-muted-foreground">
          Record yourself answering the questions (all 3 parts in one file).
        </p>
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={handleClick}
        >
          {audioFileName ? <>Replace recording...</> : <>Upload recording...</>}
        </Button>
        {audioFileName && (
          <p className="text-xs text-emerald-400">Uploaded: {audioFileName}</p>
        )}
      </div>
      <div className="space-y-1.5">
        <p className="text-xs text-muted-foreground">Time spent</p>
        {timeSpentInputs.map((t, i) => (
          <div key={t.label} className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground w-12">{t.label}</span>
            <Input
              type="number"
              min="0"
              placeholder="min"
              className="h-7 text-xs w-16"
              value={t.minutes}
              onChange={(e) => {
                const next = [...timeSpentInputs];
                next[i] = { ...next[i], minutes: e.target.value };
                onTimeSpentInputsChange(next);
              }}
            />
            <span className="text-xs text-muted-foreground">min</span>
          </div>
        ))}
      </div>
      <Input
        placeholder="Test link (URL)"
        type="url"
        value={testLink}
        onChange={(e) => onTestLinkChange(e.target.value)}
      />
    </div>
  );
}
