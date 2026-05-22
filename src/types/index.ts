export type TestType = "listening" | "reading" | "writing" | "speaking";

export const TEST_TYPES: TestType[] = [
  "listening",
  "reading",
  "writing",
  "speaking",
];

export const TEST_TYPE_LABELS: Record<TestType, string> = {
  listening: "Listening",
  reading: "Reading",
  writing: "Writing",
  speaking: "Speaking",
};

export interface TestEntry {
  id: string;
  testName: string;
  testType: TestType;
  score: number;
  date: string;

  notes: string;
  testLink?: string;
  writingTask1?: string;
  writingTask2?: string;
  audioFileName?: string;
}

export interface NoteEntry {
  id: string;
  title: string;
  body: string;
  updatedAt: string;
}

export interface AppState {
  targetDate: string | null;
  entries: TestEntry[];
  setTargetDate: (date: string | null) => void;
  addEntry: (entry: TestEntry) => void;
  removeEntry: (id: string) => void;
}
