import { DatabaseSync } from "node:sqlite";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
export const DB_PATH = join(__dirname, "..", "..", "data", "empire.db");

export function openDb() {
  return new DatabaseSync(DB_PATH);
}

export function today() {
  return new Date().toISOString().slice(0, 10);
}

// Every status change writes one activity_feed row. This is the literal
// implementation of "status changes automatically appear in the Activity
// Feed" — it isn't a habit Claude has to remember, it's built into the
// functions that change status.
export function logActivity(db, { agent, business_id = null, priority, text, source, task_id = null }) {
  db.prepare(`
    INSERT INTO activity_feed (date, agent, business_id, priority, text, source, task_id)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(today(), agent, business_id, priority, text, source, task_id);
}

export function notify(db, { level, text, source }) {
  db.prepare(`
    INSERT INTO notifications (date, level, text, source) VALUES (?, ?, ?, ?)
  `).run(today(), level, text, source);
}

// The pipeline stage vocabulary already defined in data/pipeline/README.md
// (01-research.json, 02-design.json, 03-listing.json). A dependency whose
// report_next_action is one of these explicitly said "do not build on me" —
// reusing this existing vocabulary instead of inventing a new field/status.
export const STOP_NEXT_ACTIONS = ["hold", "reject", "revise", "hold_pending_publish"];

export function isStopSignal(nextAction) {
  return STOP_NEXT_ACTIONS.includes((nextAction || "").trim());
}

// Look up a task and, if it's completed with a stop signal, return why.
// Returns null if the dependency doesn't block downstream work.
export function stopReason(db, depId) {
  const dep = db.prepare("SELECT id, status, report_next_action FROM tasks WHERE id = ?").get(depId);
  if (!dep) return `dependency ${depId} does not exist`;
  if (dep.status !== "completed") return null; // not-yet-completed is handled separately, not a stop
  if (isStopSignal(dep.report_next_action)) {
    return `dependency ${depId} completed with next_action: '${dep.report_next_action}'`;
  }
  return null;
}
