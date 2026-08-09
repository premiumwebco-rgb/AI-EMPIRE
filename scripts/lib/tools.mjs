// Shared tool abstraction (Agent Runtime layer). Reads the AVAILABLE /
// UNAVAILABLE declarations already carried in each agent's
// data/agent-adapters.json entry and exposes them as a queryable
// interface, plus the one rule that actually enforces honesty: a report
// cannot claim execution_state "executed" or "verified" without naming a
// real, registered tool that did it.

import { getAdapter } from "./adapters.mjs";

export function getToolRegistry(agent) {
  const adapter = getAdapter(agent);
  if (!adapter) return null;
  return {
    available: adapter.capabilities?.available || [],
    unavailable: adapter.capabilities?.unavailable || []
  };
}

export function findTool(agent, toolName) {
  const registry = getToolRegistry(agent);
  if (!registry) return null;
  return registry.available.find(t => t.name === toolName) || null;
}

// The core anti-fabrication check. Called by scripts/complete-task.mjs
// (and mirrored in castle-app/lib/validate.js for the live app) as an
// extra gate beyond the universal-fields check: claiming a real-world
// action happened requires naming which registered tool actually
// performed it. No tool_used, or a tool_used that isn't in this agent's
// capabilities.available -> rejected, task stays running.
export function validateExecutionClaim(agent, report) {
  const state = report.execution_state;
  if (state !== "executed" && state !== "verified") {
    return { valid: true }; // planned/generated/blocked make no execution claim to check
  }
  if (!report.tool_used) {
    return { valid: false, error: `execution_state "${state}" claims a real action happened but no tool_used is named. Name the registered tool that actually did it, or use execution_state: planned/generated instead.` };
  }
  const tool = findTool(agent, report.tool_used);
  if (!tool) {
    const registry = getToolRegistry(agent);
    const known = (registry?.available || []).map(t => t.name).join(", ") || "(none registered)";
    return { valid: false, error: `tool_used "${report.tool_used}" is not a registered tool for ${agent}. Registered: ${known}. An agent may not claim execution_state "${state}" via a tool it doesn't actually have.` };
  }
  return { valid: true };
}

// Human-readable printout for scripts/get-context.mjs.
export function formatToolRegistry(agent) {
  const registry = getToolRegistry(agent);
  if (!registry) return `  (no tool registry — "${agent}" has no adapter entry)`;
  const lines = [];
  lines.push("  AVAILABLE (real tools this agent may claim executed/verified through):");
  if (registry.available.length === 0) lines.push("    (none)");
  for (const t of registry.available) {
    lines.push(`    - ${t.name}: ${t.description}`);
    lines.push(`        in:  ${JSON.stringify(t.input_schema)}`);
    lines.push(`        out: ${JSON.stringify(t.output_schema)}`);
  }
  lines.push("  UNAVAILABLE (report planned/generated/blocked instead — never executed/verified):");
  if (registry.unavailable.length === 0) lines.push("    (none)");
  for (const c of registry.unavailable) {
    lines.push(`    - ${c.capability}: ${c.why}`);
    lines.push(`        report instead: ${c.report_instead}`);
  }
  return lines.join("\n");
}
