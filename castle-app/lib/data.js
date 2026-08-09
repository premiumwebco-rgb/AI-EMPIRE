// Server-side data access — every page reads through here, live from
// Postgres. No embedded snapshot, no hand-typed JS object: this replaces
// what used to be the EMPIRE object hard-coded into the published Artifact.

import { sessionClient } from "./supabase-server";

export async function getTasks() {
  const supabase = sessionClient();
  const { data, error } = await supabase.from("tasks").select("*").order("queued_at", { ascending: true });
  if (error) throw error;
  return data;
}

export async function getAgentStatus() {
  const supabase = sessionClient();
  const { data, error } = await supabase.from("agent_status").select("*").order("agent");
  if (error) throw error;
  return data;
}

export async function getActivityFeed({ limit = 100 } = {}) {
  const supabase = sessionClient();
  const { data, error } = await supabase
    .from("activity_feed")
    .select("*")
    .order("id", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data;
}

export async function getNotifications() {
  const supabase = sessionClient();
  const { data, error } = await supabase.from("notifications").select("*").order("id", { ascending: false });
  if (error) throw error;
  return data;
}

export async function getLatestReport(type) {
  const supabase = sessionClient();
  const { data, error } = await supabase
    .from("reports")
    .select("*")
    .eq("type", type)
    .order("date", { ascending: false })
    .order("id", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data;
}

// Phase 4: fetch a set of tasks by id, regardless of which agent they
// belong to — used to resolve dependency reports for the Context panel
// (a Design task's dependency might be a Scout task, outside the room
// being viewed). Returns { [id]: taskRow }.
export async function getTasksByIds(ids) {
  if (!ids || ids.length === 0) return {};
  const supabase = sessionClient();
  const { data, error } = await supabase.from("tasks").select("*").in("id", ids);
  if (error) throw error;
  return Object.fromEntries(data.map(t => [t.id, t]));
}

export async function getTasksForAgent(agent) {
  const supabase = sessionClient();
  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("agent", agent)
    .order("queued_at", { ascending: true });
  if (error) throw error;
  return data;
}
