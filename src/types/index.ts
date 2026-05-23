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

export interface ErrorLogEntry {
  id: string;
  questionType: string;
  category: string;
  mistake: string;
  fix: string;
}

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
  errorLog: ErrorLogEntry[];
}

export interface NoteEntry {
  id: string;
  title: string;
  body: string;
  updatedAt: string;
}

export interface StudyTask {
  id: string;
  text: string;
  done: boolean;
}

export interface StudyDay {
  dayNumber: number;
  phase: number;
  title: string;
  tasks: StudyTask[];
}

export interface StudyPlan {
  version: number;
  name: string;
  days: StudyDay[];
}

export interface AppState {
  targetDate: string | null;
  entries: TestEntry[];
  setTargetDate: (date: string | null) => void;
  addEntry: (entry: TestEntry) => void;
  removeEntry: (id: string) => void;
  addError: (entryId: string, error: ErrorLogEntry) => void;
  removeError: (entryId: string, errorId: string) => void;
  updateError: (entryId: string, error: ErrorLogEntry) => void;
}
