import Link from "next/link";
import HUD from "../components/HUD";
import StatusPill from "../components/StatusPill";
import { getAgentStatus } from "../lib/data";
import { ROOMS } from "../lib/config";

export const dynamic = "force-dynamic"; // always query live, never cache a snapshot

export default async function MapPage() {
  const statuses = await getAgentStatus();
  const statusByAgent = Object.fromEntries(statuses.map(s => [s.agent, s]));

  return (
    <>
      <HUD />
      <main>
        <div className="map-head">
          <p className="eyebrow">Empire Overview — Live</p>
          <h1>AI-EMPIRE HQ</h1>
          <p>Every room below queries Postgres directly. Click a room to step inside, or use the Command Console above to queue a real request.</p>
        </div>
        <div className="floorplan">
          <div className="rooms-grid">
            {ROOMS.map(r => {
              const st = statusByAgent[r.agent];
              const staffed = Boolean(st);
              const pillStatus = !staffed ? "unstaffed" : st.current_task ? "attention" : "active";
              const pillLabel = !staffed ? "Unstaffed" : st.current_task ? "Working" : "Active";
              const currentLine = !staffed
                ? "No formal spec staffed yet"
                : st.current_task || st.last_completed_task || "No task history yet";
              return (
                <Link key={r.id} href={`/room/${r.id}`} className="room-card">
                  <div className="icon">{r.icon}</div>
                  <StatusPill status={pillStatus} label={pillLabel} />
                  <h3>{r.name}</h3>
                  <div className="agent-name">{r.agent} — {r.codename}</div>
                  <p className="blurb">{r.blurb}</p>
                  <div className="mission-line"><b>Current: </b>{currentLine}</div>
                </Link>
              );
            })}
          </div>
        </div>
      </main>
    </>
  );
}
