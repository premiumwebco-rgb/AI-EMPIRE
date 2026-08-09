// Formal context assembly (Phase 3). Prints everything an agent needs to
// read before executing a claimed task: the task itself, its adapter
// (spec pointer, responsibilities, capabilities, file scope), every
// dependency's full completion report (not just its status), and recent
// activity for that agent — so an executing session isn't re-deriving
// context that already exists in the ledger.
//
// This does not execute anything. It's a read-only briefing.
//
// Usage: node scripts/get-context.mjs <task-id>

import { openDb } from "./lib/db.mjs";
import { getAdapter } from "./lib/adapters.mjs";
import { formatToolRegistry } from "./lib/tools.mjs";
import { buildDependencyContext } from "./lib/context.mjs";

const [, , id] = process.argv;
if (!id) {
  console.error("Usage: node scripts/get-context.mjs <task-id>");
  process.exit(1);
}

const db = openDb();
const task = db.prepare("SELECT * FROM tasks WHERE id = ?").get(id);
if (!task) {
  console.error(`No task ${id}.`);
  process.exit(1);
}

const adapter = getAdapter(task.agent);
const deps = JSON.parse(task.dependencies || "[]");

function printReport(r) {
  const lines = [
    `    outcome:        ${r.outcome || "(none)"}`,
    `    reasoning:      ${r.reasoning || "(none)"}`,
    `    files_created:  ${r.files_created.join(", ") || "(none)"}`,
    `    files_modified: ${r.files_modified.join(", ") || "(none)"}`,
    `    risks:          ${r.risks || "(none)"}`,
    `    blockers:       ${r.blockers || "(none)"}`,
    `    next_action:    ${r.next_action || "(none)"}`,
    `    execution_state:${r.execution_state || "(none)"}`
  ];
  return lines.join("\n");
}

console.log(`=== CONTEXT FOR ${id} ===\n`);
console.log(`Agent:      ${task.agent}`);
console.log(`Task type:  ${task.task_type || "(not set — this task predates task_type or was created without one)"}`);
console.log(`Status:     ${task.status}`);
console.log(`Command:    ${task.raw_command}`);
console.log(`Queued:     ${task.queued_at}`);

console.log(`\n--- Agent adapter (${task.agent}) ---`);
if (!adapter) {
  console.log(`  WARNING: "${task.agent}" has no entry in data/agent-adapters.json. This task cannot be validated against a contract.`);
} else {
  console.log(`  Spec:            ${adapter.spec}`);
  console.log(`  Responsibilities:`);
  for (const r of adapter.responsibilities) console.log(`    - ${r}`);
  console.log(`  Accepted task types: ${adapter.accepted_task_types.join(", ")}`);
  console.log(`  Required context:    ${(adapter.required_context || []).join("; ") || "(none stated)"}`);
  console.log(`  Tool registry:`);
  console.log(formatToolRegistry(task.agent));
  console.log(`  File scope (only paths you may create/modify): ${adapter.file_scope.join(", ")}`);
  console.log(`  Forbidden: ${adapter.forbidden.join("; ")}`);
  console.log(`  Escalation conditions: ${(adapter.escalation_conditions || []).join("; ")}`);
}

const depsById = {};
for (const depId of deps) {
  const dep = db.prepare("SELECT * FROM tasks WHERE id = ?").get(depId);
  if (dep) depsById[depId] = dep;
}
const dependencyContext = buildDependencyContext(task, depsById);

console.log(`\n--- Dependencies (${dependencyContext.length}) ---`);
if (dependencyContext.length === 0) {
  console.log("  (none — this task has no upstream input to review)");
}
for (const d of dependencyContext) {
  if (!d.exists) {
    console.log(`  ${d.id}: DOES NOT EXIST`);
    continue;
  }
  console.log(`  ${d.id} (${d.agent}, ${d.status}): ${d.raw_command}`);
  if (d.hasReport) {
    console.log(printReport(d.report));
  }
  console.log("");
}

console.log(`--- Recent activity for ${task.agent} (last 10) ---`);
const recent = db.prepare(
  "SELECT date, text, priority FROM activity_feed WHERE agent = ? ORDER BY id DESC LIMIT 10"
).all(task.agent);
if (recent.length === 0) console.log("  (no prior activity)");
for (const r of recent) console.log(`  [${r.date}] (${r.priority}) ${r.text}`);

console.log(`\n--- Next step ---`);
console.log(`  This is a read-only briefing. To execute: do the work described in ${adapter?.spec || "the agent's spec"},`);
console.log(`  then write a report matching REQUIRED_REPORT_FIELDS in scripts/lib/adapters.mjs, then run:`);
console.log(`  node scripts/complete-task.mjs ${id} --status=completed --report=<path-to-report.json>`);

db.close();
