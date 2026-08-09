import Link from "next/link";
import HUD from "../../components/HUD";
import { getLatestReport } from "../../lib/data";
import { AGENT_ICON } from "../../lib/config";

export const dynamic = "force-dynamic";

export default async function WarRoomPage() {
  const report = await getLatestReport("war_room");

  return (
    <>
      <HUD />
      <main>
        <Link href="/" className="backlink">← Back to the map</Link>
        {!report ? (
          <>
            <p className="eyebrow">War Room</p>
            <h1>The Council Convenes</h1>
            <div className="panel"><div className="note">No War Room report exists in the database yet. Convene one in a real Claude Code session and insert it into the `reports` table (type: war_room) — it will appear here immediately, no redeploy.</div></div>
          </>
        ) : (
          <WarRoomView report={report} />
        )}
      </main>
    </>
  );
}

function WarRoomView({ report }) {
  const c = report.content;
  const all = [...(c.attendees || []), ...(c.empty_seats || [])];
  const radius = 118, cx = 160, cy = 160;

  return (
    <>
      <p className="eyebrow">War Room · {report.date}</p>
      <h1>{report.title}</h1>
      <div className="table-wrap">
        <div className="round-table">
          {all.map((name, i) => {
            const angle = (i / all.length) * 2 * Math.PI - Math.PI / 2;
            const x = cx + radius * Math.cos(angle) - 37;
            const y = cy + radius * Math.sin(angle) - 30;
            const isEmpty = (c.empty_seats || []).includes(name);
            return (
              <div key={name} className={`seat${isEmpty ? " empty" : ""}`} style={{ left: x + 37, top: y + 30 }}>
                <div className="avatar">{AGENT_ICON[name] || "🪨"}</div>
                <div className="label">{name}</div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="panel">
        <h3>📜 Transcript</h3>
        <div className="transcript">
          {(c.transcript || []).map((line, i) => (
            <div key={i} className="line"><span className="who">{line.who}: </span>{line.text}</div>
          ))}
        </div>
      </div>

      <h2>War Room Report</h2>
      <div className="report-grid">
        <ReportCol title="🎯 Goals" items={c.report?.goals} />
        <ReportCol title="⚠️ Problems" items={c.report?.problems} />
        <ReportCol title="⚖️ Decisions" items={c.report?.decisions} />
        <ReportCol title="✅ Next Actions" items={c.report?.next_actions} />
      </div>
    </>
  );
}

function ReportCol({ title, items = [] }) {
  return (
    <div className="panel">
      <h3>{title}</h3>
      <ul className="plain">{items.map((i, idx) => <li key={idx}>{i}</li>)}</ul>
    </div>
  );
}
