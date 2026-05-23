import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AppState, TestEntry } from "@/types";

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      targetDate: null,
      entries: [],

      setTargetDate: (date) => set({ targetDate: date }),

      addEntry: (entry) =>
        set((state) => ({
          entries: [entry, ...state.entries],
        })),

      updateEntry: (entry) =>
        set((state) => ({
          entries: state.entries.map((e) => (e.id === entry.id ? entry : e)),
        })),

      removeEntry: (id) =>
        set((state) => ({
          entries: state.entries.filter((e) => e.id !== id),
        })),

      addError: (entryId, error) =>
        set((state) => ({
          entries: state.entries.map((e) =>
            e.id === entryId ? { ...e, errorLog: [...e.errorLog, error] } : e,
          ),
        })),

      removeError: (entryId, errorId) =>
        set((state) => ({
          entries: state.entries.map((e) =>
            e.id === entryId
              ? {
                  ...e,
                  errorLog: e.errorLog.filter((err) => err.id !== errorId),
                }
              : e,
          ),
        })),

      updateError: (entryId, error) =>
        set((state) => ({
          entries: state.entries.map((e) =>
            e.id === entryId
              ? {
                  ...e,
                  errorLog: e.errorLog.map((err) =>
                    err.id === error.id ? error : err,
                  ),
                }
              : e,
          ),
        })),
    }),
    {
      name: "prepsprint-storage",
      merge: (persisted, current) => {
        const p = persisted as Partial<AppState> | undefined;
        return {
          ...current,
          ...p,
          entries: (p?.entries ?? []).map((e: TestEntry) => ({
            ...e,
            errorLog: e.errorLog ?? [],
            timeSpent: e.timeSpent ?? undefined,
          })),
        };
      },
    },
  ),
);
