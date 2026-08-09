"use client";

import { useState } from "react";
import adapters from "../lib/agent-adapters.json";
import { EXECUTION_STATES } from "../lib/validate";

const toList = s => s.split(",").map(x => x.trim()).filter(Boolean);

// Minimal completion report form for a 'running' task. Submits straight to
// the existing /api/tasks/complete route — every rule that route already
// enforces (required fields, task_id/agent/task_type match, file-scope,
// tool_used anti-fabrication) still runs there. Nothing here is a second
// copy of that validation; it's just field inputs plus whatever the server
// says when it rejects the POST.
export default function CompletionForm({ task }) {
  const availableTools = adapters[task.agent]?.capabilities?.available || [];
  const [status, setStatus] = useState("completed");
  const [fields, setFields] = useState({
    input_data: "", actions_taken: "", outcome: "", reasoning: "",
    files_created: "", files_modified: "",
    risks: "", blockers: "", recommendations: "", next_action: "",
    confidence: "", execution_state: "", tool_used: ""
  });
  const [result, setResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  function set(key) {
    return e => setFields(f => ({ ...f, [key]: e.target.value }));
  }

  async function submit() {
    setSubmitting(true);
    setResult(null);
    const report = {
      task_id: task.id, agent: task.agent, task_type: task.task_type,
      input_data: fields.input_data, actions_taken: fields.actions_taken,
      outcome: fields.outcome, reasoning: fields.reasoning,
      files_created: toList(fields.files_created), files_modified: toList(fields.files_modified),
      risks: fields.risks, blockers: fields.blockers,
      recommendations: fields.recommendations, next_action: fields.next_action,
      confidence: fields.confidence, execution_state: fields.execution_state || undefined,
      tool_used: fields.tool_used || undefined
    };
    const res = await fetch("/api/tasks/complete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: task.id, status, report })
    });
    const data = await res.json();
    setSubmitting(false);
    setResult(res.ok ? { ok: `Submitted — task ${data.status}.` } : { error: data.error });
  }

  return (
    <div className="report-form">
      <div className="field-row">
        <div>
          <label>Result</label>
          <select value={status} onChange={e => setStatus(e.target.value)}>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
          </select>
        </div>
        <div>
          <label>Execution state</label>
          <select value={fields.execution_state} onChange={set("execution_state")}>
            <option value="">— select —</option>
            {EXECUTION_STATES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label>Tool used {"(only if execution_state is executed/verified)"}</label>
        <select value={fields.tool_used} onChange={set("tool_used")}>
          <option value="">— none —</option>
          {availableTools.map(t => <option key={t.name} value={t.name}>{t.name}</option>)}
        </select>
      </div>

      <div><label>Input data</label><textarea value={fields.input_data} onChange={set("input_data")} /></div>
      <div><label>Actions taken</label><textarea value={fields.actions_taken} onChange={set("actions_taken")} /></div>
      <div><label>Outcome</label><textarea value={fields.outcome} onChange={set("outcome")} /></div>
      <div><label>Reasoning</label><textarea value={fields.reasoning} onChange={set("reasoning")} /></div>

      <div className="field-row">
        <div><label>Files created (comma-separated)</label><input type="text" value={fields.files_created} onChange={set("files_created")} /></div>
        <div><label>Files modified (comma-separated)</label><input type="text" value={fields.files_modified} onChange={set("files_modified")} /></div>
      </div>

      <div className="field-row">
        <div><label>Risks</label><input type="text" value={fields.risks} onChange={set("risks")} /></div>
        <div><label>Blockers</label><input type="text" value={fields.blockers} onChange={set("blockers")} /></div>
      </div>

      <div><label>Recommendations</label><input type="text" value={fields.recommendations} onChange={set("recommendations")} /></div>

      <div className="field-row">
        <div><label>Next action</label><input type="text" value={fields.next_action} onChange={set("next_action")} /></div>
        <div><label>Confidence</label><input type="text" value={fields.confidence} onChange={set("confidence")} /></div>
      </div>

      <button className="console-go" onClick={submit} disabled={submitting}>{submitting ? "Submitting…" : "Submit report"}</button>
      {result && <div className="console-out">{result.error ? <span style={{ color: "var(--gold-400)" }}>{result.error}</span> : result.ok}</div>}
    </div>
  );
}
