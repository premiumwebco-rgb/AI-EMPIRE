// Move a task from running -> completed or failed, writing the
// completion report and propagating it to activity_feed + notifications.
//
// Phase 3: this is the real "Result validated" step, not a non-empty
// check. It rejects: incomplete reports (missing any universal field),
// invalid task_type, agent/task mismatches, files outside the agent's
// allowed scope, and malformed execution_state. A rejected report leaves
// the task in 'running' — nothing is written, nothing is corrupted.
//
// Usage:
//   node scripts/complete-task.mjs <id> --status=completed --report=<path-to-report.json>
//   node scripts/complete-task.mjs <id> --status=failed --report=<path-to-report.json>
//
// report.json must contain every field in REQUIRED_REPORT_FIELDS
// (scripts/lib/adapters.mjs) — see that file for the exact list and
// data/agent-adapters.json for what each agent may write to.

import { readFileSync } from "node:fs";
import { openDb, today, logActivity, notify } from "./lib/db.mjs";
import { getAdapter, validateReport, checkFileScope } from "./lib/adapters.mjs";
import { validateExecutionClaim } from "./lib/tools.mjs";

const [, , id, ...rest] = process.argv;
const opts = Object.fromEntries(
  rest.filter(a => a.startsWith("--")).map(a => {
    const [k, v] = a.slice(2).split("=");
    return [k, v || ""];
  })
);

if (!id || !opts.status || !opts.report) {
  console.error("Usage: node scripts/complete-task.mjs <id> --status=completed|failed --report=<path.json>");
  process.exit(1);
}
if (!["completed", "failed"].includes(opts.status)) {
  console.error("--status must be 'completed' or 'failed'.");
  process.exit(1);
}

const db = openDb();
const task = db.prepare("SELECT * FROM tasks WHERE id = ?").get(id);
if (!task) {
  console.error(`No task ${id}.`);
  db.close();
  process.exit(1);
}
if (task.status !== "running") {
  console.error(`Task ${id} is '${task.status}', not 'running' — cannot complete. Claim it first.`);
  db.close();
  process.exit(1);
}

let report;
try {
  report = JSON.parse(readFileSync(opts.report, "utf8"));
} catch (e) {
  console.error(`Could not read/parse report at ${opts.report}: ${e.message}`);
  db.close();
  process.exit(1);
}

// --- Validation gate. Every check runs before anything is written. ---
const problems = [];

const adapter = getAdapter(task.agent);
if (!adapter) {
  problems.push(`"${task.agent}" has no entry in data/agent-adapters.json — cannot validate this report against a contract.`);
}

if (task.task_type && adapter && !adapter.accepted_task_types.includes(task.task_type)) {
  problems.push(`task_type "${task.task_type}" is not valid for ${task.agent} (accepted: ${adapter.accepted_task_types.join(", ")}). The task itself was created with a bad type — this needs founder attention, not a report fix.`);
}

const { valid: reportValid, errors: reportErrors } = validateReport(report, {
  taskId: id, agent: task.agent, taskType: task.task_type
});
if (!reportValid) problems.push(...reportErrors);

if (adapter && Array.isArray(report.files_created) && Array.isArray(report.files_modified)) {
  const violations = checkFileScope(task.agent, report.files_created, report.files_modified);
  if (violations.length) {
    problems.push(`file(s) outside ${task.agent}'s allowed scope (${adapter.file_scope.join(", ")}): ${violations.join(", ")}`);
  }
}

const { valid: claimValid, error: claimError } = validateExecutionClaim(task.agent, report);
if (!claimValid) problems.push(claimError);

if (problems.length) {
  console.error(`Result NOT validated. Task ${id} remains 'running'. Fix the report and re-run.\n`);
  for (const p of problems) console.error(`  - ${p}`);
  db.close();
  process.exit(1);
}

// --- Write. Only reached if every check above passed. ---
db.prepare(`
  UPDATE tasks SET
    status = ?, completed_at = ?,
    report_input_data = ?, report_actions_taken = ?,
    report_outcome = ?, report_reasoning = ?,
    report_files_created = ?, report_files_modified = ?,
    report_recommendations = ?, report_confidence = ?, report_next_action = ?,
    report_risks = ?, report_blockers = ?, report_execution_state = ?
  WHERE id = ?
`).run(
  opts.status, today(),
  typeof report.input_data === "string" ? report.input_data : JSON.stringify(report.input_data),
  (report.tool_used ? `[tool_used: ${report.tool_used}] ` : "") + (typeof report.actions_taken === "string" ? report.actions_taken : JSON.stringify(report.actions_taken)),
  report.outcome, report.reasoning,
  JSON.stringify(report.files_created || []),
  JSON.stringify(report.files_modified || []),
  report.recommendations || null, report.confidence, report.next_action,
  typeof report.risks === "string" ? report.risks : JSON.stringify(report.risks),
  typeof report.blockers === "string" ? report.blockers : JSON.stringify(report.blockers),
  report.execution_state || null,
  id
);

logActivity(db, {
  agent: task.agent,
  priority: opts.status === "failed" ? "high" : "medium",
  text: `${task.agent} ${opts.status}: ${task.raw_command} — ${report.outcome}`,
  source: "scripts/complete-task.mjs",
  task_id: id
});

notify(db, {
  level: opts.status === "failed" ? "attention" : "info",
  text: `${opts.status === "failed" ? "Task failed" : "Task completed"} — ${task.agent}: ${task.raw_command}`,
  source: `data/empire.db tasks.id=${id}`
});

console.log(`Result validated. Task ${id} marked ${opts.status}. Activity feed and notifications updated.`);
console.log(`  Run: node scripts/suggest-next-task.mjs ${id}   (see the suggested next action)`);
db.close();
