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
  const panelCollapsed = useNotebookStore((s) => s.panelCollapsed);
  const togglePanel = useNotebookStore((s) => s.togglePanel);

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [preview, setPreview] = useState(false);
  const [readMode, setReadMode] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );

  const activeNote = notes.find((n) => n.id === activeNoteId) ?? null;

  // biome-ignore lint/correctness/useExhaustiveDependencies: sync on ID change only
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
    <Card className="flex flex-col rounded-md">
      <CardHeader className="flex-row items-center justify-between space-y-0 py-2">
        <CardTitle className="text-base">Notebook</CardTitle>
        <div className="flex items-center gap-1">
          <Button variant="outline" size="sm" onClick={handleNew}>
            + New
          </Button>
          <button
            type="button"
            onClick={togglePanel}
            className="text-muted-foreground hover:text-foreground text-lg leading-none px-1 py-1 transition-transform duration-300"
            title={panelCollapsed ? "Expand notebook" : "Collapse notebook"}
          >
            {panelCollapsed ? "\u203A" : "\u2039"}
          </button>
        </div>
      </CardHeader>
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          panelCollapsed ? "max-h-0 opacity-0" : "max-h-[2000px] opacity-100"
        }`}
      >
        <CardContent className="flex flex-col gap-3 pt-0">
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
                {readMode ? (
                  <span className="flex-1 text-sm font-medium px-1">
                    {title}
                  </span>
                ) : (
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    placeholder="Note title"
                    className="flex-1 bg-transparent border-b border-border px-1 py-0.5 text-sm font-medium outline-none focus:border-primary"
                  />
                )}
                <button
                  type="button"
                  onClick={() => setReadMode(!readMode)}
                  className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2 shrink-0"
                >
                  {readMode ? "Edit" : "Read"}
                </button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-destructive shrink-0"
                  onClick={handleDelete}
                >
                  Delete
                </Button>
              </div>

              {readMode ? (
                <div className="prose prose-sm prose-invert max-w-none flex-1 overflow-auto rounded-md border bg-background p-4">
                  <Markdown remarkPlugins={[remarkGfm]}>
                    {body || "*Empty*"}
                  </Markdown>
                </div>
              ) : (
                <>
                  <textarea
                    value={body}
                    onChange={(e) => handleBodyChange(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Tab") {
                        e.preventDefault();
                        const ta = e.currentTarget;
                        const start = ta.selectionStart;
                        const end = ta.selectionEnd;
                        const next =
                          body.slice(0, start) + "  " + body.slice(end);
                        setBody(next);
                        requestAnimationFrame(() => {
                          ta.selectionStart = ta.selectionEnd = start + 2;
                        });
                        clearTimeout(debounceRef.current);
                        debounceRef.current = setTimeout(
                          () => save(title, next),
                          300,
                        );
                      }
                    }}
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
      </div>
    </Card>
  );
}
