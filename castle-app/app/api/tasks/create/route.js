// POST /api/tasks/create
// Body: { id, agent, raw_command, task_type?, dependencies?: [], files_affected?: [] }
// Ports scripts/create-task.mjs — same gate: refuse if a dependency
// already completed with a stop signal (data/agent-adapters.json /
// lib/validate.js STOP_NEXT_ACTIONS).

import { adminClient, requireSession } from "../../../../lib/supabase-server";
import { stopReasonFor, logActivity, notify } from "../_shared";
import { getAdapter } from "../../../../lib/validate";

export async function POST(req) {
  const user = await requireSession();
  if (!user) return Response.json({ error: "Not authenticated" }, { status: 401 });

  const body = await req.json();
  const { id, agent, raw_command, task_type, dependencies = [], files_affected = [] } = body;

  if (!id || !agent || !raw_command) {
    return Response.json({ error: "id, agent, and raw_command are required" }, { status: 400 });
  }

  const adapter = getAdapter(agent);
  if (!adapter) {
    return Response.json({ error: `Unknown agent '${agent}'. See data/agent-adapters.json for the recognized set.` }, { status: 400 });
  }
  if (!task_type || !adapter.accepted_task_types.includes(task_type)) {
    return Response.json({
      error: `${agent} does not accept task_type '${task_type || "(none given)"}'. Accepted: ${adapter.accepted_task_types.join(", ")}`
    }, { status: 400 });
  }

  const db = adminClient();

  const { data: existing } = await db.from("tasks").select("id").eq("id", id).maybeSingle();
  if (existing) {
    return Response.json({ error: `Task ${id} already exists.` }, { status: 409 });
  }

  // Gate: refuse creation if any dependency already stopped the pipeline.
  // Ember is exempt — see scripts/create-task.mjs's Gate 1 for why.
  for (const depId of agent === "Ember" ? [] : dependencies) {
    const reason = await stopReasonFor(db, depId);
    if (reason) {
      await logActivity(db, { agent, priority: "high", text: `Task creation blocked: ${raw_command} — ${reason}`, source: "api/tasks/create", task_id: null });
      await notify(db, { level: "attention", text: `Blocked task creation for ${agent}: ${reason}`, source: "api/tasks/create" });
      return Response.json({ error: `Refusing to create ${id}: ${reason}` }, { status: 422 });
    }
  }

  const today = new Date().toISOString().slice(0, 10);
  const { error: insertError } = await db.from("tasks").insert({
    id, raw_command, agent, task_type: task_type || null,
    status: "queued", queued_at: today,
    dependencies, files_affected
  });
  if (insertError) return Response.json({ error: insertError.message }, { status: 500 });

  await logActivity(db, { agent, priority: "medium", text: `Task queued: ${raw_command}`, source: "api/tasks/create", task_id: id });

  return Response.json({ id, status: "queued" });
}
