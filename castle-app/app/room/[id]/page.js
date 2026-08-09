import Link from "next/link";
import HUD from "../../../components/HUD";
import StatusPill from "../../../components/StatusPill";
import TaskCard from "../../../components/TaskCard";
import AgentComposer from "../../../components/AgentComposer";
import { getTasksForAgent } from "../../../lib/data";
import { ROOMS } from "../../../lib/config";
import { getAdapter } from "../../../lib/validate";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function RoomPage({ params }) {
  const room = ROOMS.find(r => r.id === params.id);
  if (!room) notFound();

  const tasks = await getTasksForAgent(room.agent);
  const adapter = getAdapter(room.agent);
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

            <div className="panel">
              <h3>🗂️ Task History (live)</h3>
              {tasks.length === 0
                ? <div className="note">No requests logged yet for {room.agent}.</div>
                : tasks.map(t => <TaskCard key={t.id} task={t} />)
              }
            </div>

            <AgentComposer agent={room.agent} />
          </div>
        </div>
      </main>
    </>
  );
}
