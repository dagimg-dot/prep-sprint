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

export const READING_QUESTION_TYPES = [
  "True/False/Not Given",
  "Yes/No/Not Given",
  "Matching Headings",
  "Matching Information",
  "Matching Features",
  "Multiple Choice",
  "Sentence Completion",
  "Summary Completion",
  "Table/Note/Flowchart/Diagram Completion",
  "Short Answer",
] as const;

export const LISTENING_QUESTION_TYPES = [
  "Form/Note Completion",
  "Table Completion",
  "Multiple Choice",
  "Short Answer",
  "Sentence Completion",
  "Map/Plan Labelling",
  "Diagram Labelling",
  "Matching",
] as const;

export const WRITING_QUESTION_TYPES = ["Task 1", "Task 2"] as const;
export const SPEAKING_QUESTION_TYPES = ["Part 1", "Part 2", "Part 3"] as const;

export const QUESTION_TYPES: Record<TestType, readonly string[]> = {
  reading: READING_QUESTION_TYPES,
  listening: LISTENING_QUESTION_TYPES,
  writing: WRITING_QUESTION_TYPES,
  speaking: SPEAKING_QUESTION_TYPES,
};

export const READING_ERROR_CATEGORIES = [
  "keyword-matching",
  "tfng-logic",
  "paraphrase",
  "time-management",
  "skimming-scanning",
  "detail-miss",
  "grammar-misread",
  "word-limit",
  "instruction-miss",
  "assumption",
  "transfer-error",
  "other",
] as const;

export const LISTENING_ERROR_CATEGORIES = [
  "spelling",
  "number-confusion",
  "distractor",
  "speed",
  "signpost-miss",
  "focus-drift",
  "prediction",
  "homophone",
  "plural-miss",
  "direction-language",
  "speaker-confusion",
  "instruction-miss",
  "transfer-error",
  "other",
] as const;

export const GENERIC_ERROR_CATEGORIES = [
  "vocabulary",
  "grammar",
  "timing",
  "misread",
  "comprehension",
  "structure",
  "other",
] as const;

export const ERROR_CATEGORIES: Record<TestType, readonly string[]> = {
  reading: READING_ERROR_CATEGORIES,
  listening: LISTENING_ERROR_CATEGORIES,
  writing: GENERIC_ERROR_CATEGORIES,
  speaking: GENERIC_ERROR_CATEGORIES,
};

export interface ErrorLogEntry {
  id: string;
  questionType: string;
  category: string;
  mistake: string;
  fix: string;
}

export interface PartScore {
  label: string;
  score: number;
  max: number;
}

export interface TestEntry {
  id: string;
  testName: string;
  testType: TestType;
  score: number;
  date: string;

  rawScore?: number;
  rawMax?: number;
  partScores?: PartScore[];

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
  updateEntry: (entry: TestEntry) => void;
  removeEntry: (id: string) => void;
  addError: (entryId: string, error: ErrorLogEntry) => void;
  removeError: (entryId: string, errorId: string) => void;
  updateError: (entryId: string, error: ErrorLogEntry) => void;
}
