"use client";

import { useState } from "react";
import StatusPill from "./StatusPill";

export default function ActivityFeedView({ feed }) {
  const [agentFilter, setAgentFilter] = useState("all");
  const [prioFilter, setPrioFilter] = useState("all");
  const agents = ["all", ...new Set(feed.map(f => f.agent))];
  const prios = ["all", "high", "medium", "low"];

  const filtered = feed.filter(f =>
    (agentFilter === "all" || f.agent === agentFilter) &&
    (prioFilter === "all" || f.priority === prioFilter)
  );

  return (
    <>
      <div className="filter-row">
        <span className="console-label">Agent</span>
        {agents.map(a => (
          <button key={a} className={`filter-btn${a === agentFilter ? " active" : ""}`} onClick={() => setAgentFilter(a)}>{a}</button>
        ))}
      </div>
      <div className="filter-row">
        <span className="console-label">Priority</span>
        {prios.map(p => (
          <button key={p} className={`filter-btn${p === prioFilter ? " active" : ""}`} onClick={() => setPrioFilter(p)}>{p}</button>
        ))}
      </div>
      <div className="panel">
        {filtered.length === 0
          ? <p className="chat-empty">No activity matches this filter.</p>
          : filtered.map(f => (
              <div key={f.id} className="feed-item">
                <div className="fdate mono">{f.date}</div>
                <div style={{ flex: 1 }}>
                  <div><span className="fagent">{f.agent}</span> — {f.text}</div>
                  <div className="fsrc">Source: {f.source}</div>
                </div>
                <StatusPill status={f.priority === "high" ? "attention" : f.priority === "low" ? "unstaffed" : "info"} label={f.priority} />
              </div>
            ))
        }
      </div>
    </>
  );
}
