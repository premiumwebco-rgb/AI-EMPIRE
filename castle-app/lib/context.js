// Pure dependency-context logic (Phase 4) — synced copy of
// scripts/lib/context.mjs. No DB access. Bundled here because Vercel only
// deploys files inside castle-app/. If this logic changes, update both
// files — same sync-point convention as lib/agent-adapters.json.
//
// task: { dependencies: string[] }   (Supabase JSONB arrives already parsed)
// depsById: { [id]: taskRow }         (already-fetched Supabase rows)
//
// Returns: array of
//   { id, exists, agent, status, raw_command, hasReport,
//     report: { outcome, reasoning, files_created, files_modified,
//               risks, blockers, next_action, execution_state } | null }

function toArray(v) {
  if (Array.isArray(v)) return v;
  if (typeof v === "string") { try { return JSON.parse(v); } catch { return []; } }
  return [];
}

export function buildDependencyContext(task, depsById) {
  const depIds = toArray(task.dependencies);
  return depIds.map(id => {
    const dep = depsById[id];
    if (!dep) return { id, exists: false, agent: null, status: null, raw_command: null, hasReport: false, report: null };

    const hasReport = dep.status === "completed" || dep.status === "failed";
    return {
      id,
      exists: true,
      agent: dep.agent,
      status: dep.status,
      raw_command: dep.raw_command,
      hasReport,
      report: hasReport ? {
        outcome: dep.report_outcome || null,
        reasoning: dep.report_reasoning || null,
        files_created: toArray(dep.report_files_created),
        files_modified: toArray(dep.report_files_modified),
        risks: dep.report_risks || null,
        blockers: dep.report_blockers || null,
        next_action: dep.report_next_action || null,
        execution_state: dep.report_execution_state || null
      } : null
    };
  });
}
