import { create } from "zustand";
import { persist } from "zustand/middleware";
import defaultPlan from "@/lib/ielts-plan.json";
import type { StudyPlan } from "@/types";

interface StudyPlanState {
  plan: StudyPlan | null;
  setPlan: (plan: StudyPlan) => void;
  clearPlan: () => void;
  toggleTask: (dayNumber: number, taskId: string) => void;
}

export const useStudyPlanStore = create<StudyPlanState>()(
  persist(
    (set) => ({
      plan: defaultPlan as StudyPlan,
      setPlan: (plan) => set({ plan }),
      clearPlan: () => set({ plan: null }),
      toggleTask: (dayNumber, taskId) =>
        set((state) => {
          if (!state.plan) return state;
          return {
            plan: {
              ...state.plan,
              days: state.plan.days.map((day) =>
                day.dayNumber === dayNumber
                  ? {
                      ...day,
                      tasks: day.tasks.map((task) =>
                        task.id === taskId
                          ? { ...task, done: !task.done }
                          : task,
                      ),
                    }
                  : day,
              ),
            },
          };
        }),
    }),
    {
      name: "prepsprint-study-plan",
      partialize: (state) => ({
        plan: state.plan,
      }),
    },
  ),
);
