# PrepSprint

Test preparation dashboard for tracking practice sessions across Listening, Reading, Writing, and Speaking sections.

## Features

- **Practice Log** -- Add and track test entries with scores, notes, and section types
- **Focus Timer** -- Countdown timer per section type (30m Listening, 60m Reading, 60m Writing, 14m Speaking) with pause and progress tracking
- **Notebook** -- Markdown note editor with auto-save, read mode, and expandable panel
- **Streak Calendar** -- Visual activity heatmap showing practice frequency across your sprint
- **Exam Countdown** -- Target date banner with days remaining
- **Stats Overview** -- Streak badge and summary statistics
- **Data Management** -- Import/export your data as JSON

## Stack

- React 19 + TypeScript
- Vite
- Tailwind CSS v4
- Zustand (state management with localStorage persistence)
- date-fns
- React Markdown + remark-gfm
- Biome (linting + formatting)
- shadcn/ui component primitives

## Getting Started

```bash
pnpm install
pnpm dev
```

```bash
pnpm build    # type-check + production build
pnpm lint     # biome check
pnpm format   # biome format
```
