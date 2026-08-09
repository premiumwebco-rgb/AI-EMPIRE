// Shared helpers for the task API routes. Underscore-prefixed file: Next.js
// excludes it from routing, same convention as a private lib module.

import { isStopSignal } from "../../../lib/validate";

const today = () => new Date().toISOString().slice(0, 10);

export async function stopReasonFor(db, depId) {
  const { data: dep } = await db.from("tasks").select("id, status, report_next_action").eq("id", depId).maybeSingle();
  if (!dep) return `dependency ${depId} does not exist`;
  if (dep.status !== "completed") return null; // not finished yet is a different (non-stop) state
  if (isStopSignal(dep.report_next_action)) {
    return `dependency ${depId} completed with next_action: '${dep.report_next_action}'`;
  }
  return null;
}

export async function logActivity(db, { agent, business_id = null, priority, text, source, task_id = null }) {
  await db.from("activity_feed").insert({ date: today(), agent, business_id, priority, text, source, task_id });
}

export async function notify(db, { level, text, source }) {
  await db.from("notifications").insert({ date: today(), level, text, source });
}
