"use client";

import { useState } from "react";
import StatusPill from "./StatusPill";
import CompletionForm from "./CompletionForm";

const STATUS_MAP = { queued: "unstaffed", running: "attention", waiting: "attention", completed: "active", failed: "critical" };
const STATUS_LABEL = { queued: "Queued", running: "Running", waiting: "Waiting", completed: "Completed", failed: "Failed" };

// Phase 4a: dependencyContext (from lib/context.js's buildDependencyContext)
// and suggestion (from lib/suggest.js's suggestNextAction) are read-only —
// same data the CLI's get-context.mjs / suggest-next-task.mjs would show
// for this task, just rendered instead of printed.
//
// Phase 4b: Claim and Submit report are the only two actions this card can
// take, and both are thin POSTs to the existing /api/tasks/claim and
// /api/tasks/complete routes — all enforcement (validation, file-scope,
// anti-fabrication, atomic claim) still happens server-side there. This
// component holds no execution logic of its own.
export default function TaskCard({ task, dependencyContext = [], suggestion = null }) {
  const [open, setOpen] = useState(false);
  const [contextOpen, setContextOpen] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [claimResult, setClaimResult] = useState(null);
  const hasReport = task.status === "completed" || task.status === "failed";

  async function claim() {
    setClaiming(true);
    setClaimResult(null);
    const res = await fetch("/api/tasks/claim", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: task.id })
    });
    const data = await res.json();
    setClaiming(false);
    setClaimResult(res.ok ? { ok: "Claimed." } : { error: data.error });
  }
  // "not_yet" is suggestNextAction's own encoding of "queued/running,
  // nothing to suggest" — every other kind (completed, failed, waiting,
  // stop_signal, route, ...) is a real suggestion worth showing.
  const showSuggestion = suggestion && suggestion.kind !== "not_yet";

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

      {task.status === "queued" && (
        <div style={{ marginTop: 10 }}>
          <button className="console-go" onClick={claim} disabled={claiming}>{claiming ? "Claiming…" : "Claim task"}</button>
          {claimResult && <div className="console-out">{claimResult.error ? <span style={{ color: "var(--gold-400)" }}>{claimResult.error}</span> : claimResult.ok}</div>}
        </div>
      )}

      {task.status === "running" && <CompletionForm task={task} />}

      {showSuggestion && (
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
