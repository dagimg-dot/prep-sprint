/**
 * Parse ielts-24day-sprint-plan.md → src/lib/ielts-plan.json
 * Run from project root: node scripts/parse-plan.mjs
 */
import { resolve, dirname } from "node:path";
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

const markdown = readFileSync(
  resolve(root, "ielts-24day-sprint-plan.md"),
  "utf-8",
);

const lines = markdown.split("\n");
const plan = { version: 1, name: "IELTS 24-Day Sprint Plan", days: [] };

let currentPhase = 0;
let currentDay = null;

for (const line of lines) {
  const phaseMatch = line.match(/^### Phase (\d+):/);
  if (phaseMatch) {
    currentPhase = Number.parseInt(phaseMatch[1], 10);
    continue;
  }

  const dayMatch = line.match(/^\*\*Day (\d+) — (.+)\*\*/);
  if (dayMatch) {
    if (currentDay) plan.days.push(currentDay);
    currentDay = {
      dayNumber: Number.parseInt(dayMatch[1], 10),
      phase: currentPhase,
      title: dayMatch[2].trim(),
      tasks: [],
    };
    continue;
  }

  if (currentDay) {
    const taskMatch = line.match(/^- \[([ x])\] (.+)$/);
    if (taskMatch) {
      currentDay.tasks.push({
        id: `task-${currentDay.dayNumber}-${currentDay.tasks.length + 1}`,
        text: taskMatch[2].trim(),
        done: taskMatch[1] === "x",
      });
    }
  }
}

if (currentDay) plan.days.push(currentDay);

const totalTasks = plan.days.reduce((s, d) => s + d.tasks.length, 0);
console.log(`Parsed ${plan.days.length} days, ${totalTasks} tasks`);

writeFileSync(
  resolve(root, "src/lib/ielts-plan.json"),
  JSON.stringify(plan, null, 2),
  "utf-8",
);
console.log("Written to src/lib/ielts-plan.json");
