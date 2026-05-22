import { useStore } from "@/store/use-store";

export function StatsHeader() {
  const entries = useStore((s) => s.entries);

  if (entries.length === 0) return null;

  const avg = entries.reduce((sum, e) => sum + e.score, 0) / entries.length;
  const highest = Math.max(...entries.map((e) => e.score));
  const lowest = Math.min(...entries.map((e) => e.score));

  return (
    <div className="flex flex-wrap items-center gap-4 text-sm">
      <span>
        Avg: <strong className="text-base">{avg.toFixed(1)}</strong>
      </span>
      <span className="text-muted-foreground">/</span>
      <span>
        Highest:{" "}
        <strong className="text-base text-emerald-400">{highest}</strong>
      </span>
      <span className="text-muted-foreground">/</span>
      <span>
        Lowest: <strong className="text-base text-orange-400">{lowest}</strong>
      </span>
      <span className="text-muted-foreground">/</span>
      <span className="text-muted-foreground">
        Tests: <strong className="text-foreground">{entries.length}</strong>
      </span>
    </div>
  );
}
