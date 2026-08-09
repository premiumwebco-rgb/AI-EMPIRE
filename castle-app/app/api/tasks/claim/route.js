// POST /api/tasks/claim
// Body: { id }
// Ports scripts/claim-task.mjs — refuses if dependencies aren't
// completed, or if a completed dependency carries a stop signal (in
// which case this task moves to 'waiting', recorded, not silently dropped).

import { adminClient, requireSession } from "../../../../lib/supabase-server";
import { stopReasonFor, logActivity, notify } from "../_shared";

const today = () => new Date().toISOString().slice(0, 10);

export async function POST(req) {
  const user = await requireSession();
  if (!user) return Response.json({ error: "Not authenticated" }, { status: 401 });

  const { id } = await req.json();
  if (!id) return Response.json({ error: "id is required" }, { status: 400 });

  const db = adminClient();
  const { data: task } = await db.from("tasks").select("*").eq("id", id).maybeSingle();
  if (!task) return Response.json({ error: `No task ${id}.` }, { status: 404 });
  if (task.status !== "queued") {
    return Response.json({ error: `Task ${id} is '${task.status}', not 'queued' — cannot claim.` }, { status: 409 });
  }

  const deps = task.dependencies || [];

  // Ember is exempt from the stop-signal block: reviewing a stopped/blocked
  // dependency is Ember's job (route/summarize/verify/war_room), not a
  // violation of it. See scripts/claim-task.mjs's Gate 2 for the same rule.
  for (const depId of task.agent === "Ember" ? [] : deps) {
    const reason = await stopReasonFor(db, depId);
    if (reason) {
      await db.from("tasks").update({ status: "waiting" }).eq("id", id);
      await logActivity(db, { agent: task.agent, priority: "high", text: `${task.agent} blocked: ${task.raw_command} — ${reason}`, source: "api/tasks/claim", task_id: id });
      await notify(db, { level: "attention", text: `${task.agent} blocked on ${id}: ${reason}`, source: "api/tasks/claim" });
      return Response.json({ error: `Task ${id} moved to 'waiting': ${reason}` }, { status: 422 });
    }
  }

  const unmet = [];
  for (const depId of deps) {
    const { data: dep } = await db.from("tasks").select("status").eq("id", depId).maybeSingle();
    if (!dep || dep.status !== "completed") unmet.push(depId);
  }
  if (unmet.length) {
    return Response.json({ error: `Cannot claim ${id}: depends on ${unmet.join(", ")}, not completed yet.` }, { status: 409 });
  }

  await db.from("tasks").update({ status: "running", started_at: today() }).eq("id", id);
  await logActivity(db, { agent: task.agent, priority: "medium", text: `${task.agent} started: ${task.raw_command}`, source: "api/tasks/claim", task_id: id });

  return Response.json({ id, status: "running" });
}
