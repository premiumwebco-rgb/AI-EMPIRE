import Link from "next/link";
import HUD from "../../../components/HUD";
import StatusPill from "../../../components/StatusPill";
import TaskCard from "../../../components/TaskCard";
import AgentComposer from "../../../components/AgentComposer";
import { getTasksForAgent, getTasksByIds } from "../../../lib/data";
import { ROOMS } from "../../../lib/config";
import { getAdapter } from "../../../lib/validate";
import { buildDependencyContext } from "../../../lib/context";
import { suggestNextAction } from "../../../lib/suggest";
import { notFound } from "next/navigation";
// Phase 4c: read-only mirror of data/state/missions.json — the real,
// writable file — kept here only because Vercel's Root Directory is
// castle-app/ and doesn't deploy sibling folders. Same convention as
// lib/agent-adapters.json. Re-copy this file whenever the source changes;
// nothing in the app writes to this copy.
import missions from "../../../lib/missions.json";

export const dynamic = "force-dynamic";

const QUEST_STATUS = { in_progress: "attention", not_started: "unstaffed", deferred: "info", not_yet_defined: "unstaffed" };
const QUEST_LABEL = { in_progress: "In Progress", not_started: "Not Started", deferred: "Deferred", not_yet_defined: "Not Yet Defined" };

export default async function RoomPage({ params }) {
  const room = ROOMS.find(r => r.id === params.id);
  if (!room) notFound();

  const tasks = await getTasksForAgent(room.agent);
  const adapter = getAdapter(room.agent);

  // Phase 4: resolve every dependency referenced by any task in this room
  // — a dependency can belong to a different agent's room, so this is a
  // separate fetch, not reused from `tasks` above.
  const allDepIds = [...new Set(tasks.flatMap(t => t.dependencies || []))];
  const depsById = await getTasksByIds(allDepIds);

  const taskExtras = Object.fromEntries(tasks.map(t => [
    t.id,
    {
      dependencyContext: buildDependencyContext(t, depsById),
      // suggestNextAction already encodes "nothing to suggest yet" as
      // kind: "not_yet" for queued/running tasks — TaskCard hides the
      // panel for that kind. Don't re-narrow to completed-only here, or
      // failed/waiting tasks (which the CLI does have real suggestions
      // for) silently lose theirs.
      suggestion: suggestNextAction(t)
    }
  ]));
  const current = tasks.find(t => t.status === "running" || t.status === "queued");
  const lastDone = [...tasks].reverse().find(t => t.status === "completed");

  return (
    <>
      <HUD />
      <main>
        <Link href="/" className="backlink">← Back to the map</Link>
        <p className="eyebrow">{room.name}</p>

        <div className="chamber">
          <div className="portrait-plate">
            <div className="avatar">{room.icon}</div>
            <h2>{room.agent}</h2>
            <div className="codename">{room.codename}</div>
            <StatusPill status={current ? "attention" : tasks.length ? "active" : "unstaffed"} label={current ? "Working" : tasks.length ? "Active" : "Unstaffed"} />
            <p className="role">{room.blurb}</p>
            <div className="panel" style={{ marginTop: 14, textAlign: "left" }}>
              <div><b>Current task: </b>{current ? current.raw_command : "None queued"}</div>
              <div style={{ marginTop: 6 }}><b>Last completed: </b>{lastDone ? lastDone.raw_command : "None yet"}</div>
            </div>
          </div>

          <div>
            {adapter && (
              <div className="panel">
                <h3>🧩 Agent Adapter</h3>
                <p style={{ fontSize: "0.85rem" }}><b>Accepted task types:</b> {adapter.accepted_task_types.join(", ")}</p>
                <p style={{ fontSize: "0.85rem" }}><b>File scope:</b> {adapter.file_scope.join(", ")}</p>
                <div className="note">Enforced, not just documented — see app/api/tasks/complete/route.js's file-scope check.</div>
              </div>
            )}

            {room.agent === "Ember" && (
              <div className="panel">
                <h3>📜 Mission Board</h3>
                <div className="note" style={{ marginBottom: 14 }}>
                  Read from data/state/missions.json — as of {missions.last_updated}. Not live; updated when the founder/Ember edits that file.
                </div>

                <div style={{ marginBottom: 16 }}>
                  <b>Main quest: </b>
                  {missions.main_quest.title
                    ? missions.main_quest.title
                    : <span style={{ color: "var(--stone-400)" }}>No main quest set yet</span>}
                  {missions.main_quest.note && <div className="task-meta" style={{ marginTop: 4 }}>{missions.main_quest.note}</div>}
                </div>

                {missions.side_quests.map(q => (
                  <div key={q.id} style={{ marginBottom: 14, paddingBottom: 14, borderBottom: "1px dashed var(--border)" }}>
                    <div className="task-top">
                      <div className="task-cmd">{q.title}</div>
                      <StatusPill status={QUEST_STATUS[q.status] || "unstaffed"} label={QUEST_LABEL[q.status] || q.status} />
                    </div>
                    <div className="task-meta" style={{ marginTop: 4 }}>
                      Priority: {q.priority}{q.deadline ? ` · Deadline: ${q.deadline}` : ""} · Assigned: {q.assigned_agent}
                    </div>
                    <div className="bar" style={{ marginTop: 8 }}><i style={{ width: `${q.progress_pct}%` }} /></div>
                    <div className="task-meta" style={{ marginTop: 4 }}>{q.progress_pct}% complete</div>
                    {q.note && <div style={{ marginTop: 6, fontSize: "0.85rem" }}>{q.note}</div>}
                  </div>
                ))}
              </div>
            )}

            <div className="panel">
              <h3>🗂️ Task History (live)</h3>
              {tasks.length === 0
                ? <div className="note">No requests logged yet for {room.agent}.</div>
                : tasks.map(t => (
                    <TaskCard
                      key={t.id}
                      task={t}
                      dependencyContext={taskExtras[t.id].dependencyContext}
                      suggestion={taskExtras[t.id].suggestion}
                    />
                  ))
              }
            </div>

            <AgentComposer agent={room.agent} />
          </div>
        </div>
      </main>
    </>
  );
}
