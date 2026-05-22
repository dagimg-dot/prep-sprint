import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AppState } from '@/types'

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

      removeEntry: (id) =>
        set((state) => ({
          entries: state.entries.filter((e) => e.id !== id),
        })),
    }),
    {
      name: 'prepsprint-storage',
    },
  ),
)
