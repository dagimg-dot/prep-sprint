import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { NoteEntry } from "@/types";

interface NotebookState {
  notes: NoteEntry[];
  activeNoteId: string | null;
  setActiveNote: (id: string | null) => void;
  upsertNote: (id: string, title: string, body: string) => void;
  deleteNote: (id: string) => void;
  createNote: () => string;
}

export const useNotebookStore = create<NotebookState>()(
  persist(
    (set) => ({
      notes: [],
      activeNoteId: null,

      setActiveNote: (id) => set({ activeNoteId: id }),

      upsertNote: (id, title, body) =>
        set((state) => {
          const existing = state.notes.find((n) => n.id === id);
          if (existing) {
            return {
              notes: state.notes.map((n) =>
                n.id === id
                  ? { ...n, title, body, updatedAt: new Date().toISOString() }
                  : n,
              ),
            };
          }
          return {
            notes: [
              ...state.notes,
              { id, title, body, updatedAt: new Date().toISOString() },
            ],
          };
        }),

      deleteNote: (id) =>
        set((state) => ({
          notes: state.notes.filter((n) => n.id !== id),
          activeNoteId:
            state.activeNoteId === id
              ? (state.notes.find((n) => n.id !== id)?.id ?? null)
              : state.activeNoteId,
        })),

      createNote: () => {
        const id = crypto.randomUUID();
        const note: NoteEntry = {
          id,
          title: "Untitled",
          body: "",
          updatedAt: new Date().toISOString(),
        };
        set((state) => ({
          notes: [...state.notes, note],
          activeNoteId: id,
        }));
        return id;
      },
    }),
    {
      name: "prepsprint-notebook",
    },
  ),
);
