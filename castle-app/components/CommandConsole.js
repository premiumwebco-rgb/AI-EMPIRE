"use client";

import { useState } from "react";
import adapters from "../lib/agent-adapters.json";

const AGENTS = ["Ember", "Scout", "Design", "Listing", "Marketing", "Tally", "Printify"];

export default function CommandConsole() {
  const [value, setValue] = useState("");
  const [result, setResult] = useState(null);

  async function submit() {
    const raw = value.trim();
    if (!raw) return;
    const match = raw.match(/^(Ember|Scout|Design|Listing|Marketing|Tally|Printify)\s*[:\-]\s*(.+)$/i);
    if (!match) {
      setResult({ error: `Start with an agent name, e.g. "Scout: research profitable hockey niches". Recognized: ${AGENTS.join(", ")}.` });
      return;
    }
    const agent = match[1][0].toUpperCase() + match[1].slice(1).toLowerCase();
    const id = `cq-${Date.now()}`;
    // The Console is a free-text quick-queue, not a typed form — default to
    // the agent's first accepted task_type rather than adding a picker.
    const task_type = adapters[agent]?.accepted_task_types?.[0];
    const res = await fetch("/api/tasks/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, agent, raw_command: raw, task_type })
    });
    const data = await res.json();
    if (!res.ok) {
      setResult({ error: data.error });
    } else {
      setResult({ ok: `Queued as ${id} for ${agent}. It's real now — visible in ${agent}'s room and the Activity Feed immediately, no refresh needed. Actual execution still happens in a Claude Code session, per the manual-runtime design.` });
      setValue("");
    }
  }

  return (
    <div className="console">
      <span className="console-label">⌘ Command Console</span>
      <input
        type="text"
        placeholder="Scout: research profitable hockey niches"
        value={value}
        onChange={e => setValue(e.target.value)}
        onKeyDown={e => { if (e.key === "Enter") submit(); }}
      />
      <button className="console-go" onClick={submit}>Queue</button>
      {result && (
        <div className="console-out">
          {result.error ? <p style={{ margin: 0, color: "var(--gold-400)" }}>{result.error}</p> : <p style={{ margin: 0 }}>{result.ok}</p>}
        </div>
      )}
    </div>
  );
}
