"use client";

import { useState } from "react";
import StatusPill from "./StatusPill";

const STATUS_MAP = { queued: "unstaffed", running: "attention", waiting: "attention", completed: "active", failed: "critical" };
const STATUS_LABEL = { queued: "Queued", running: "Running", waiting: "Waiting", completed: "Completed", failed: "Failed" };

export default function TaskCard({ task }) {
  const [open, setOpen] = useState(false);
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
