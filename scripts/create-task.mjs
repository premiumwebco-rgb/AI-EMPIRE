// Create a new task in the queue.
//
// Usage:
//   node scripts/create-task.mjs <id> <agent> "<raw command>" --type=<task_type> [--depends=id1,id2] [--files=path1,path2]
//
// Example:
//   node scripts/create-task.mjs res-01 Scout "Research the trend for X" --type=research_trend

import { openDb, today, logActivity, notify, stopReason } from "./lib/db.mjs";
import { getAdapter, validateTaskType } from "./lib/adapters.mjs";

const [, , id, agent, rawCommand, ...rest] = process.argv;

if (!id || !agent || !rawCommand) {
  console.error("Usage: node scripts/create-task.mjs <id> <agent> \"<raw command>\" --type=<task_type> [--depends=id1,id2] [--files=a,b]");
  process.exit(1);
}

const opts = Object.fromEntries(
  rest.filter(a => a.startsWith("--")).map(a => {
    const [k, v] = a.slice(2).split("=");
    return [k, v || ""];
  })
);

const dependencies = opts.depends ? opts.depends.split(",") : [];
const filesAffected = opts.files ? opts.files.split(",") : [];

const adapter = getAdapter(agent);
if (!adapter) {
  console.error(`"${agent}" is not a known agent. See data/agent-adapters.json for the valid list.`);
  process.exit(1);
}
const typeCheck = validateTaskType(agent, opts.type);
if (!typeCheck.valid) {
  console.error(`Refusing to create ${id}: ${typeCheck.error}`);
  process.exit(1);
}

const db = openDb();

const existing = db.prepare("SELECT id FROM tasks WHERE id = ?").get(id);
if (existing) {
  console.error(`Task ${id} already exists. Choose a different id.`);
  process.exit(1);
}

// Gate 1: if any dependency already completed with a stop signal
// (hold/reject/revise/hold_pending_publish — the vocabulary already
// defined in data/pipeline/README.md), refuse to create this task at
// all. Prevents planning real work on top of a stage that explicitly
// said not to proceed.
//
// Exception: Ember is exempt. Ember's whole job (task_types route,
// summarize, verify, war_room) is to consume a stopped/blocked
// dependency's report and decide what happens next — that is the
// opposite of "building on top of it," and blocking Ember from ever
// being tasked to review a stopped result would make the routing loop
// in docs/agent-feedback-loop.md impossible to actually run.
for (const depId of agent === "Ember" ? [] : dependencies) {
  const reason = stopReason(db, depId);
  if (reason) {
    console.error(`Refusing to create ${id}: ${reason}. Downstream work should not be planned on a stopped pipeline stage.`);
    logActivity(db, {
      agent,
      priority: "high",
      text: `Task creation blocked: ${rawCommand} — ${reason}`,
      source: "scripts/create-task.mjs",
      task_id: null
    });
    notify(db, {
      level: "attention",
      text: `Blocked task creation for ${agent}: ${reason}`,
      source: "scripts/create-task.mjs"
    });
    db.close();
    process.exit(1);
  }
}

// Handoff check: if this task depends on others that simply haven't
// finished yet (not stopped, just not done), it can still be created so
// a chain can be planned up front — its real readiness is reflected in
// its status once claim-task.mjs is run.
const unmetDeps = dependencies.filter(depId => {
  const dep = db.prepare("SELECT status FROM tasks WHERE id = ?").get(depId);
  return !dep || dep.status !== "completed";
});

db.prepare(`
  INSERT INTO tasks (id, raw_command, agent, task_type, status, queued_at, dependencies, files_affected)
  VALUES (?, ?, ?, ?, 'queued', ?, ?, ?)
`).run(id, rawCommand, agent, opts.type, today(), JSON.stringify(dependencies), JSON.stringify(filesAffected));

logActivity(db, {
  agent,
  priority: "medium",
  text: `Task queued: ${rawCommand}`,
  source: "scripts/create-task.mjs",
  task_id: id
});

console.log(`Created task ${id} for ${agent} (type: ${opts.type}) — status: queued`);
if (unmetDeps.length) {
  console.log(`  Note: depends on ${unmetDeps.join(", ")}, which ${unmetDeps.length === 1 ? "is" : "are"} not completed yet. It cannot be claimed until those finish.`);
}

db.close();
