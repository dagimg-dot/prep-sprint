import { useCallback, useEffect, useRef, useState } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNotebookStore } from "@/store/use-notebook-store";

export function NotebookPanel() {
  const notes = useNotebookStore((s) => s.notes);
  const activeNoteId = useNotebookStore((s) => s.activeNoteId);
  const setActiveNote = useNotebookStore((s) => s.setActiveNote);
  const upsertNote = useNotebookStore((s) => s.upsertNote);
  const deleteNote = useNotebookStore((s) => s.deleteNote);
  const createNote = useNotebookStore((s) => s.createNote);

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [preview, setPreview] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );

  const activeNote = notes.find((n) => n.id === activeNoteId) ?? null;

  // biome-ignore lint/correctness/useExhaustiveDependencies: only sync on ID change, not notes array edits
  useEffect(() => {
    if (activeNote) {
      setTitle(activeNote.title);
      setBody(activeNote.body);
    } else {
      setTitle("");
      setBody("");
    }
  }, [activeNoteId]);

  const save = useCallback(
    (newTitle: string, newBody: string) => {
      if (!activeNoteId) return;
      upsertNote(activeNoteId, newTitle, newBody);
    },
    [activeNoteId, upsertNote],
  );

  const handleTitleChange = (val: string) => {
    setTitle(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => save(val, body), 300);
  };

  const handleBodyChange = (val: string) => {
    setBody(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => save(title, val), 300);
  };

  useEffect(() => {
    return () => clearTimeout(debounceRef.current);
  }, []);

  const handleNew = () => {
    createNote();
  };

  const handleDelete = () => {
    if (activeNoteId) deleteNote(activeNoteId);
  };

  const noteList = [...notes].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  );

  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="pb-3 flex-row items-center justify-between space-y-0">
        <CardTitle className="text-base">Notebook</CardTitle>
        <div className="flex gap-1">
          <Button variant="outline" size="sm" onClick={handleNew}>
            + New
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-3 min-h-0">
        {noteList.length > 0 && (
          <div className="flex gap-1 flex-wrap">
            {noteList.map((n) => (
              <button
                key={n.id}
                type="button"
                onClick={() => setActiveNote(n.id)}
                className={`text-xs px-2 py-1 rounded-md border transition-colors ${
                  n.id === activeNoteId
                    ? "border-primary bg-primary/10 text-foreground"
                    : "border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                {n.title}
              </button>
            ))}
          </div>
        )}

        {activeNote ? (
          <>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="Note title"
                className="flex-1 bg-transparent border-b border-border px-1 py-0.5 text-sm font-medium outline-none focus:border-primary"
              />
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-destructive shrink-0"
                onClick={handleDelete}
              >
                Delete
              </Button>
            </div>

            <textarea
              value={body}
              onChange={(e) => handleBodyChange(e.target.value)}
              placeholder="Write in markdown..."
              className="flex-1 w-full resize-none rounded-md border border-input bg-background p-3 text-sm outline-none focus:border-primary min-h-[200px]"
            />

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPreview(!preview)}
                className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2"
              >
                {preview ? "Hide preview" : "Show preview"}
              </button>
              {!preview && (
                <span className="text-[10px] text-muted-foreground">
                  (auto-saves)
                </span>
              )}
            </div>

            {preview && (
              <div className="prose prose-sm prose-invert max-w-none rounded-md border bg-background p-3 overflow-auto max-h-80">
                <Markdown remarkPlugins={[remarkGfm]}>
                  {body || "*Empty*"}
                </Markdown>
              </div>
            )}
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-sm text-muted-foreground">
              No notes yet.{" "}
              <button
                type="button"
                onClick={handleNew}
                className="underline underline-offset-2 hover:text-foreground"
              >
                Create one
              </button>
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
