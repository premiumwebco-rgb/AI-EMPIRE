// Move a task from queued -> running. This is what "an agent receives
// work" means in the manual runtime: Claude, in a real session, runs
// this immediately before actually doing the work.
//
// Refuses to claim a task whose dependencies aren't completed yet —
// this is what makes a handoff a real constraint instead of a suggestion.
//
// Usage: node scripts/claim-task.mjs <id>

import { openDb, today, logActivity, notify, stopReason } from "./lib/db.mjs";

const [, , id] = process.argv;
if (!id) {
  console.error("Usage: node scripts/claim-task.mjs <id>");
  process.exit(1);
}

const db = openDb();
const task = db.prepare("SELECT * FROM tasks WHERE id = ?").get(id);

if (!task) {
  console.error(`No task ${id}.`);
  process.exit(1);
}
if (task.status !== "queued") {
  console.error(`Task ${id} is '${task.status}', not 'queued' — cannot claim.`);
  process.exit(1);
}

const deps = JSON.parse(task.dependencies || "[]");

// Gate 2: the task may have been created before its dependency's outcome
// was known (e.g. a whole chain planned up front). If that dependency has
// since completed with a stop signal, this task is genuinely blocked —
// not just "not ready yet." Record that as a real status, not a silent
// CLI error, so it's visible in the ledger.
//
// Exception: Ember, same reasoning as create-task.mjs's Gate 1 — Ember
// reviewing a stopped dependency is its job, not a violation of the gate.
for (const depId of task.agent === "Ember" ? [] : deps) {
  const reason = stopReason(db, depId);
  if (reason) {
    db.prepare("UPDATE tasks SET status = 'waiting' WHERE id = ?").run(id);
    logActivity(db, {
      agent: task.agent,
      priority: "high",
      text: `${task.agent} blocked: ${task.raw_command} — ${reason}`,
      source: "scripts/claim-task.mjs",
      task_id: id
    });
    notify(db, {
      level: "attention",
      text: `${task.agent} blocked on ${id}: ${reason}`,
      source: "scripts/claim-task.mjs"
    });
    console.error(`Task ${id} moved to 'waiting': ${reason}. This is recorded, not silently dropped.`);
    db.close();
    process.exit(1);
  }
}

const unmet = deps.filter(depId => {
  const dep = db.prepare("SELECT status FROM tasks WHERE id = ?").get(depId);
  return !dep || dep.status !== "completed";
});
if (unmet.length) {
  console.error(`Cannot claim ${id}: depends on ${unmet.join(", ")}, which ${unmet.length === 1 ? "isn't" : "aren't"} completed yet.`);
  process.exit(1);
}

db.prepare("UPDATE tasks SET status = 'running', started_at = ? WHERE id = ?").run(today(), id);

logActivity(db, {
  agent: task.agent,
  priority: "medium",
  text: `${task.agent} started: ${task.raw_command}`,
  source: "scripts/claim-task.mjs",
  task_id: id
});

console.log(`Task ${id} claimed by ${task.agent} — status: running`);
console.log(`  Run: node scripts/get-context.mjs ${id}   (assembles full context before you execute)`);
db.close();
