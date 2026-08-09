// Shared adapter/report validation — the machine-checkable half of
// data/agent-adapters.json. Used by scripts/create-task.mjs,
// scripts/complete-task.mjs, scripts/get-context.mjs, and
// scripts/suggest-next-task.mjs so every script enforces the same
// execution contract instead of five incompatible ad-hoc checks.
//
// Mirrors castle-app/lib/validate.js (the live app's copy, used by its
// API routes) — same rules, same glob matcher, kept in sync manually
// because Vercel only deploys files inside castle-app/.

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ADAPTERS_PATH = join(__dirname, "..", "..", "data", "agent-adapters.json");

let _adapters = null;
export function loadAdapters() {
  if (!_adapters) {
    const raw = JSON.parse(readFileSync(ADAPTERS_PATH, "utf8"));
    _adapters = Object.fromEntries(Object.entries(raw).filter(([k]) => k !== "_comment"));
  }
  return _adapters;
}

export function getAdapter(agent) {
  const adapters = loadAdapters();
  return adapters[agent] || null;
}

export function knownAgents() {
  return Object.keys(loadAdapters());
}

export const EXECUTION_STATES = ["planned", "generated", "executed", "verified", "blocked"];

// The universal completion report format (Phase 3). task_id/agent/task_type
// are restated inside the report itself (not just taken from the task row)
// so complete-task.mjs can catch a report that was copy-pasted from a
// different task before it's ever written to the ledger.
export const REQUIRED_REPORT_FIELDS = [
  "task_id", "agent", "task_type",
  "input_data", "actions_taken", "outcome", "reasoning",
  "files_created", "files_modified",
  "risks", "blockers", "recommendations", "next_action",
  "confidence", "execution_state"
];

// A field counts as present if it's a non-empty string, a non-empty array,
// or explicitly the literal string "none" / "None" (agents must say "no
// risks" rather than leave the field blank — an omission and a real "none"
// answer are not the same thing).
function isFilled(value) {
  if (Array.isArray(value)) return true; // empty array is valid — "no files created" is a real answer
  if (typeof value === "string") return value.trim().length > 0;
  return value !== undefined && value !== null;
}

export function validateReport(report, { taskId, agent, taskType } = {}) {
  const errors = [];

  if (!report || typeof report !== "object") {
    return { valid: false, errors: ["report is not a JSON object"] };
  }

  const missing = REQUIRED_REPORT_FIELDS.filter(f => !isFilled(report[f]));
  if (missing.length) errors.push(`missing required field(s): ${missing.join(", ")}`);

  if (report.task_id !== undefined && taskId !== undefined && report.task_id !== taskId) {
    errors.push(`report.task_id ("${report.task_id}") does not match the task being completed ("${taskId}") — looks like a report copied from a different task`);
  }
  if (report.agent !== undefined && agent !== undefined && report.agent !== agent) {
    errors.push(`report.agent ("${report.agent}") does not match the task's assigned agent ("${agent}")`);
  }
  if (report.task_type !== undefined && taskType !== undefined && report.task_type !== taskType) {
    errors.push(`report.task_type ("${report.task_type}") does not match the task's task_type ("${taskType}")`);
  }

  if (report.execution_state !== undefined && isFilled(report.execution_state) && !EXECUTION_STATES.includes(report.execution_state)) {
    errors.push(`execution_state must be one of ${EXECUTION_STATES.join(", ")} — got "${report.execution_state}"`);
  }

  if (report.files_created !== undefined && !Array.isArray(report.files_created)) errors.push("files_created must be an array (use [] for none)");
  if (report.files_modified !== undefined && !Array.isArray(report.files_modified)) errors.push("files_modified must be an array (use [] for none)");

  return { valid: errors.length === 0, errors };
}

export function validateTaskType(agent, taskType) {
  const adapter = getAdapter(agent);
  if (!adapter) return { valid: false, error: `"${agent}" is not a known agent (see data/agent-adapters.json)` };
  if (!taskType) return { valid: false, error: "task_type is required" };
  if (!adapter.accepted_task_types.includes(taskType)) {
    return { valid: false, error: `"${taskType}" is not a task_type ${agent} accepts. Accepted: ${adapter.accepted_task_types.join(", ")}` };
  }
  return { valid: true };
}

// Minimal glob -> RegExp: '*' = any chars within a path segment,
// '**' = any depth (including across '/'). No external dependency.
export function globToRegex(glob) {
  let re = "";
  for (let i = 0; i < glob.length; i++) {
    const c = glob[i];
    if (c === "*" && glob[i + 1] === "*") {
      re += ".*";
      i++;
      if (glob[i + 1] === "/") i++;
    } else if (c === "*") {
      re += "[^/]*";
    } else if (c === "?") {
      re += "[^/]";
    } else if (".+^${}()|[]\\".includes(c)) {
      re += "\\" + c;
    } else {
      re += c;
    }
  }
  return new RegExp(`^${re}$`);
}

export function pathAllowed(path, agent) {
  const adapter = getAdapter(agent);
  if (!adapter) return false;
  return adapter.file_scope.some(pattern => globToRegex(pattern).test(path));
}

export function checkFileScope(agent, filesCreated = [], filesModified = []) {
  const violations = [];
  for (const p of [...filesCreated, ...filesModified]) {
    if (!pathAllowed(p, agent)) violations.push(p);
  }
  return violations;
}
