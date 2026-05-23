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
  const [zenMode, setZenMode] = useState(false);
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

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === "E" || e.key === "e")) {
        e.preventDefault();
        setReadMode((r) => !r);
      }
      if (e.key === "Escape") {
        setZenMode(false);
      }
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === "Z" || e.key === "z")) {
        e.preventDefault();
        setZenMode((z) => !z);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const handleNew = () => {
    if (panelCollapsed) togglePanel();
    createNote();
  };

  const handleDelete = () => {
    if (activeNoteId) deleteNote(activeNoteId);
  };

  const cardRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const zenContentRef = useRef<HTMLDivElement>(null);
  const [contentMaxH, setContentMaxH] = useState<number | null>(null);

  useEffect(() => {
    const update = () => {
      if (!cardRef.current || !headerRef.current) return;
      const cardTop = cardRef.current.getBoundingClientRect().top;
      const headerH = headerRef.current.offsetHeight;
      const available = window.innerHeight - cardTop - headerH - 64;
      setContentMaxH(Math.max(100, available));
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  // biome-ignore lint/correctness/useExhaustiveDependencies: readMode needed as dep to re-size on return from read mode
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = `${ta.scrollHeight}px`;
  }, [body, readMode]);

  const noteList = [...notes].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  );

  useEffect(() => {
    if (!zenMode) return;
    const handler = (e: MouseEvent) => {
      if (zenContentRef.current && !zenContentRef.current.contains(e.target as Node)) {
        setZenMode(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [zenMode]);

  return (
    <>
    <Card ref={cardRef} className="flex flex-col rounded-md">
      <CardHeader
        ref={headerRef}
        className="flex-row items-center justify-between space-y-0 py-2 shrink-0"
      >
        <CardTitle className="text-base">Notebook</CardTitle>
        <div className="flex items-center gap-1">
          <Button variant="outline" size="sm" onClick={handleNew}>
            + New
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={togglePanel}
            title={panelCollapsed ? "Expand notebook" : "Collapse notebook"}
          >
            {panelCollapsed ? "\u2193" : "\u2191"}
          </Button>
        </div>
      </CardHeader>
      <div
        className={`transition-all duration-300 ease-in-out ${
          panelCollapsed ? "max-h-0 opacity-0" : "opacity-100"
        }`}
        style={panelCollapsed ? { overflow: "hidden" } : undefined}
      >
        <div
          className="overflow-y-auto scrollbar-none"
          style={contentMaxH !== null ? { maxHeight: contentMaxH } : undefined}
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
                    title={`${readMode ? "Edit" : "Read"} (Ctrl+Shift+E)`}
                  >
                    {readMode ? "Edit" : "Read"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setZenMode(true)}
                    className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2 shrink-0"
                    title="Zen view (Ctrl+Shift+Z)"
                  >
                    Zen
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
                      ref={textareaRef}
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
                      className="w-full resize-none scrollbar-none rounded-md border border-input bg-background p-3 text-sm outline-none focus:border-primary min-h-[120px]"
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
      </div>
    </Card>

      {zenMode && activeNote && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 backdrop-blur-2xl">
          <div
            ref={zenContentRef}
            className="relative w-full max-w-3xl mx-auto mt-12 mb-12 p-8"
          >
            <button
              type="button"
              onClick={() => setZenMode(false)}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setZenMode(false); }}
              className="absolute top-2 right-2 text-muted-foreground hover:text-foreground text-lg leading-none w-8 h-8 flex items-center justify-center rounded-full hover:bg-muted transition-colors"
              aria-label="Close zen view"
            >
              ✕
            </button>
            <h2 className="text-xl font-semibold mb-6 text-foreground">
              {title}
            </h2>
            <div className="prose prose-sm prose-invert max-w-none">
              <Markdown remarkPlugins={[remarkGfm]}>
                {body || "*Empty*"}
              </Markdown>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
