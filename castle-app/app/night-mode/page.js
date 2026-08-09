import Link from "next/link";
import HUD from "../../components/HUD";
import { getLatestReport } from "../../lib/data";

export const dynamic = "force-dynamic";

export default async function NightModePage() {
  const report = await getLatestReport("morning_briefing");

  return (
    <>
      <HUD />
      <main>
        <Link href="/" className="backlink">← Back to the map</Link>
        <p className="eyebrow">Morning Intelligence Report{report ? ` · ${report.date}` : ""}</p>
        <h1>🌙 Night Mode</h1>
        <div className="brief-note">
          Read from the database, live — not a bundled snapshot. Still generated on request during a real session, not from unattended overnight execution; that remains a separate, later decision (see docs/empire-backend-architecture.md §4.4).
        </div>
        {!report ? (
          <div className="panel"><div className="note">No Morning Briefing exists in the database yet.</div></div>
        ) : (
          <>
            <div className="panel"><h3>🧭 Overall Status</h3><p>Empire health: {report.content.health}.</p></div>
            <Section title="💰 Money" items={report.content.money} />
            <Section title="⚠️ Threats" items={report.content.threats} />
            <Section title="🔎 Discoveries" items={report.content.discoveries} />
            <Section title="🎯 Today's Missions" items={report.content.missions_today} />
            <Section title="🤖 Agent Activity" items={report.content.activity} />
          </>
        )}
      </main>
    </>
  );
}

function Section({ title, items = [] }) {
  return (
    <div className="panel">
      <h3>{title}</h3>
      <ul className="plain">{items.map((i, idx) => <li key={idx}>{i}</li>)}</ul>
    </div>
  );
}
