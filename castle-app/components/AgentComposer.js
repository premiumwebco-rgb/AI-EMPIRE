"use client";

import { useState } from "react";
import adapters from "../lib/agent-adapters.json";

export default function AgentComposer({ agent }) {
  const [text, setText] = useState("");
  const [result, setResult] = useState(null);

  async function submit() {
    if (!text.trim()) return;
    const id = `cq-${Date.now()}`;
    const task_type = adapters[agent]?.accepted_task_types?.[0];
    const res = await fetch("/api/tasks/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, agent, raw_command: `${agent}: ${text.trim()}`, task_type })
    });
    const data = await res.json();
    setResult(res.ok ? { ok: `Queued as ${id}.` } : { error: data.error });
    if (res.ok) setText("");
  }

  return (
    <div className="panel">
      <h3>💬 Request for {agent}</h3>
      <div className="composer">
        <input
          type="text"
          placeholder={`What should ${agent} do?`}
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter") submit(); }}
        />
        <button className="console-go" onClick={submit}>Send</button>
      </div>
      <p style={{ fontSize: "0.76rem", color: "var(--stone-400)", marginTop: 8 }}>
        Queues a real row. Execution still happens in a Claude Code session — this app doesn&apos;t run agents itself (see Phase 3: manual runtime by design).
      </p>
      {result && <div className="console-out">{result.error ? <span style={{ color: "var(--gold-400)" }}>{result.error}</span> : result.ok}</div>}
    </div>
  );
}
