// Pure dependency-context logic (Phase 4). No DB access — takes an
// already-fetched task and a lookup of already-fetched dependency tasks,
// returns a structured list of what each dependency concluded. This is
// the exact selection scripts/get-context.mjs has always printed under
// "--- Dependencies ---", extracted so scripts/get-context.mjs (CLI) and
// castle-app/lib/context.js (web) share one definition of "what counts as
// dependency context" instead of two guesses. Synced manually with
// castle-app/lib/context.js — same reason as scripts/lib/suggest.mjs.
//
// task: { dependencies: string[] }  (already JSON.parsed if it came from SQLite)
// depsById: { [id]: taskRow }        (already-fetched dependency rows;
//                                      report_* array fields already
//                                      normalized to real arrays, not
//                                      JSON strings)
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
