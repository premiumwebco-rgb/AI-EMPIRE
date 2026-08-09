// Turns the manual routing logic in docs/agent-feedback-loop.md into a
// printed suggestion. This NEVER creates a task itself — it prints the
// recommended agent/task_type and the exact create-task.mjs command to
// run, and stops. Suggestions remain suggestions; a human or Claude
// session decides whether to actually invoke it.
//
// The actual routing decision lives in scripts/lib/suggest.mjs (Phase 4),
// shared with the Castle web app's Suggested Next Action panel — this
// script is now just: fetch the task, call the shared function, print it.
//
// Usage: node scripts/suggest-next-task.mjs <task-id>

import { openDb } from "./lib/db.mjs";
import { suggestNextAction } from "./lib/suggest.mjs";

const [, , id] = process.argv;
if (!id) {
  console.error("Usage: node scripts/suggest-next-task.mjs <task-id>");
  process.exit(1);
}

const db = openDb();
const task = db.prepare("SELECT * FROM tasks WHERE id = ?").get(id);
if (!task) {
  console.error(`No task ${id}.`);
  process.exit(1);
}

console.log(`=== NEXT-ACTION SUGGESTION FOR ${id} ===`);
console.log(`Agent: ${task.agent}   Task type: ${task.task_type || "(unset)"}   Status: ${task.status}\n`);

const s = suggestNextAction(task);
console.log(`\nSUGGESTION: ${s.text}`);
if (s.command) console.log(`  To act on this: ${s.command}`);
console.log(`  (This is a suggestion only. Nothing has been created.)`);

db.close();
