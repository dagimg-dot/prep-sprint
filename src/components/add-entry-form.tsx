import { format } from "date-fns";
import { useState } from "react";
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

  const handleSubmit = () => {
    if (!testName.trim() || !score.trim()) return;

    const entry: TestEntry = {
      id: crypto.randomUUID(),
      testName: testName.trim(),
      testType,
      score: parseFloat(score),
      notes: notes.trim(),
      date: format(new Date(), "yyyy-MM-dd"),
      testLink: undefined,
      writingTask1: undefined,
      writingTask2: undefined,
      audioFileName: undefined,
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
    setTestLink("");
    setWritingTask1("");
    setWritingTask2("");
    setAudioFileName("");
    setNotes("");
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
        />

        <Textarea
          placeholder="What I learned / shortcomings..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
        />
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
