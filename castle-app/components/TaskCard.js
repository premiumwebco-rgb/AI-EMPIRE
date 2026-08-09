"use client";

import { useState } from "react";
import StatusPill from "./StatusPill";

const STATUS_MAP = { queued: "unstaffed", running: "attention", waiting: "attention", completed: "active", failed: "critical" };
const STATUS_LABEL = { queued: "Queued", running: "Running", waiting: "Waiting", completed: "Completed", failed: "Failed" };

// Phase 4: dependencyContext (from lib/context.js's buildDependencyContext)
// and suggestion (from lib/suggest.js's suggestNextAction) are both
// read-only — this component never creates, claims, or completes
// anything. Same data the CLI's get-context.mjs / suggest-next-task.mjs
// would show for this task, just rendered instead of printed.
export default function TaskCard({ task, dependencyContext = [], suggestion = null }) {
  const [open, setOpen] = useState(false);
  const [contextOpen, setContextOpen] = useState(false);
  const hasReport = task.status === "completed" || task.status === "failed";

  return (
    <div className="task-card">
      <div className="task-top">
        <div>
          <div className="task-cmd">{task.raw_command}</div>
          <div className="task-meta">
            Queued {task.queued_at}{task.completed_at ? ` · Completed ${task.completed_at}` : ""}
            {task.report_next_action ? ` · next_action: ${task.report_next_action}` : ""}
          </div>
        </div>
        <StatusPill status={STATUS_MAP[task.status]} label={STATUS_LABEL[task.status]} />
      </div>

      {suggestion && (
        <div className="note" style={{ marginTop: 10 }}>
          <b>Suggested next action:</b> {suggestion.text}
          {suggestion.command && <div className="mono" style={{ marginTop: 6 }}>{suggestion.command}</div>}
        </div>
      )}

      {dependencyContext.length > 0 && (
        <>
          <button className="task-toggle" onClick={() => setContextOpen(!contextOpen)}>
            {contextOpen ? "Hide context" : `View context (${dependencyContext.length})`}
          </button>
          {contextOpen && (
            <div className="task-detail">
              {dependencyContext.map(d => (
                <div key={d.id} style={{ marginBottom: 10 }}>
                  {!d.exists ? (
                    <div><b>{d.id}</b> — does not exist</div>
                  ) : (
                    <>
                      <div><b>{d.id}</b> ({d.agent}, {d.status}) — {d.raw_command}</div>
                      {d.hasReport && (
                        <dl>
                          <dt>Outcome</dt><dd>{d.report.outcome || "—"}</dd>
                          <dt>Reasoning</dt><dd>{d.report.reasoning || "—"}</dd>
                          <dt>Files Created</dt><dd className="mono">{d.report.files_created.join(", ") || "None"}</dd>
                          <dt>Files Modified</dt><dd className="mono">{d.report.files_modified.join(", ") || "None"}</dd>
                          <dt>Risks</dt><dd>{d.report.risks || "—"}</dd>
                          <dt>Blockers</dt><dd>{d.report.blockers || "—"}</dd>
                          <dt>Next Action</dt><dd>{d.report.next_action || "—"}</dd>
                          <dt>Execution State</dt><dd>{d.report.execution_state || "—"}</dd>
                        </dl>
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {hasReport && (
        <>
          <button className="task-toggle" onClick={() => setOpen(!open)}>{open ? "Hide report" : "View report"}</button>
          {open && (
            <div className="task-detail">
              <dl>
                <dt>Input Data</dt><dd>{task.report_input_data || "—"}</dd>
                <dt>Actions Taken</dt><dd>{task.report_actions_taken || "—"}</dd>
                <dt>Findings</dt><dd>{task.report_outcome || "—"}</dd>
                <dt>Reasoning</dt><dd>{task.report_reasoning || "—"}</dd>
                <dt>Files Created</dt><dd className="mono">{(task.report_files_created || []).join(", ") || "None"}</dd>
                <dt>Files Modified</dt><dd className="mono">{(task.report_files_modified || []).join(", ") || "None"}</dd>
                <dt>Confidence</dt><dd>{task.report_confidence || "—"}</dd>
                <dt>Next Action</dt><dd>{task.report_next_action || "—"}</dd>
                <dt>Risks</dt><dd>{task.report_risks || "—"}</dd>
              </dl>
            </div>
          )}
        </>
      )}
    </div>
  );
}
