import { useCallback, useRef } from "react";
import { useNotebookStore } from "@/store/use-notebook-store";
import { useStore } from "@/store/use-store";

export function DataActions() {
  const fileRef = useRef<HTMLInputElement>(null);

  const handleExport = useCallback(() => {
    const data = {
      version: 1,
      exportedAt: new Date().toISOString(),
      testStore: {
        targetDate: useStore.getState().targetDate,
        entries: useStore.getState().entries,
      },
      notebookStore: {
        notes: useNotebookStore.getState().notes,
        activeNoteId: useNotebookStore.getState().activeNoteId,
      },
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `prepsprint-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  const handleImport = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result as string);
        if (!data.version || !data.testStore || !data.notebookStore) {
          throw new Error("Invalid backup file");
        }
        useStore.setState({
          targetDate: data.testStore.targetDate ?? null,
          entries: data.testStore.entries ?? [],
        });
        useNotebookStore.setState({
          notes: data.notebookStore.notes ?? [],
          activeNoteId: data.notebookStore.activeNoteId ?? null,
        });
      } catch {
        alert("Invalid backup file. Please select a valid PrepSprint export.");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  }, []);

  return (
    <>
      <input
        type="file"
        accept=".json"
        ref={fileRef}
        onChange={handleImport}
        className="hidden"
      />
      <button
        type="button"
        onClick={handleExport}
        className="group relative text-muted-foreground hover:text-foreground cursor-pointer"
      >
        <span className="pointer-events-none absolute top-full mt-1 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-foreground px-2 py-1 text-[11px] text-background opacity-0 transition-opacity group-hover:opacity-100">
          Export data
        </span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-label="Export data"
        >
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
      </button>
      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        className="group relative text-muted-foreground hover:text-foreground cursor-pointer"
      >
        <span className="pointer-events-none absolute top-full mt-1 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-foreground px-2 py-1 text-[11px] text-background opacity-0 transition-opacity group-hover:opacity-100">
          Import data
        </span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-label="Import data"
        >
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="17 8 12 3 7 8" />
          <line x1="12" y1="3" x2="12" y2="15" />
        </svg>
      </button>
    </>
  );
}
