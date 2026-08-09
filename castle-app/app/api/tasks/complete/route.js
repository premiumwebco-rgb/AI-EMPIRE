// POST /api/tasks/complete
// Body: { id, status: 'completed'|'failed', report: { input_data,
//         actions_taken, outcome, reasoning, files_created, files_modified,
//         recommendations, confidence, next_action, risks } }
// Ports scripts/complete-task.mjs, upgraded to the Phase 3 universal
// report format, plus the new file-scope check: a report claiming to
// have touched a file outside its agent's data/agent-adapters.json
// file_scope is rejected, not silently accepted.

import { adminClient, requireSession } from "../../../../lib/supabase-server";
import { logActivity, notify } from "../_shared";
import { validateReport, checkFileScope, validateExecutionClaim } from "../../../../lib/validate";

const today = () => new Date().toISOString().slice(0, 10);

export async function POST(req) {
  const user = await requireSession();
  if (!user) return Response.json({ error: "Not authenticated" }, { status: 401 });

  const { id, status, report } = await req.json();
  if (!id || !status || !report) {
    return Response.json({ error: "id, status, and report are required" }, { status: 400 });
  }
  if (!["completed", "failed"].includes(status)) {
    return Response.json({ error: "status must be 'completed' or 'failed'" }, { status: 400 });
  }

  const db = adminClient();
  const { data: task } = await db.from("tasks").select("*").eq("id", id).maybeSingle();
  if (!task) return Response.json({ error: `No task ${id}.` }, { status: 404 });
  if (task.status !== "running") {
    return Response.json({ error: `Task ${id} is '${task.status}', not 'running' — claim it first.` }, { status: 409 });
  }

  const { valid, errors } = validateReport(report, { taskId: id, agent: task.agent, taskType: task.task_type });
  if (!valid) {
    return Response.json({ error: `Result not validated: ${errors.join("; ")}` }, { status: 422 });
  }

  const filesCreated = report.files_created || [];
  const filesModified = report.files_modified || [];
  const violations = checkFileScope(task.agent, filesCreated, filesModified);
  if (violations.length) {
    await logActivity(db, {
      agent: task.agent, priority: "high",
      text: `${task.agent} report rejected: claimed to touch out-of-scope file(s): ${violations.join(", ")}`,
      source: "api/tasks/complete", task_id: id
    });
    await notify(db, { level: "attention", text: `${task.agent}'s report for ${id} was rejected — out-of-scope files`, source: "api/tasks/complete" });
    return Response.json({ error: `Report rejected: ${task.agent} is not allowed to touch ${violations.join(", ")} (see data/agent-adapters.json file_scope).` }, { status: 422 });
  }

  const { valid: claimValid, error: claimError } = validateExecutionClaim(task.agent, report);
  if (!claimValid) {
    return Response.json({ error: `Result not validated: ${claimError}` }, { status: 422 });
  }

  await db.from("tasks").update({
    status,
    completed_at: today(),
    report_input_data: report.input_data,
    report_actions_taken: (report.tool_used ? `[tool_used: ${report.tool_used}] ` : "") + report.actions_taken,
    report_outcome: report.outcome,
    report_reasoning: report.reasoning,
    report_files_created: filesCreated,
    report_files_modified: filesModified,
    report_recommendations: report.recommendations || null,
    report_confidence: report.confidence,
    report_next_action: report.next_action,
    report_risks: report.risks,
    report_blockers: report.blockers,
    report_execution_state: report.execution_state || null
  }).eq("id", id);

  await logActivity(db, {
    agent: task.agent,
    priority: status === "failed" ? "high" : "medium",
    text: `${task.agent} ${status}: ${task.raw_command} — ${report.outcome}`,
    source: "api/tasks/complete", task_id: id
  });
  await notify(db, {
    level: status === "failed" ? "attention" : "info",
    text: `${status === "failed" ? "Task failed" : "Task completed"} — ${task.agent}: ${task.raw_command}`,
    source: `tasks.id=${id}`
  });

  return Response.json({ id, status });
}
