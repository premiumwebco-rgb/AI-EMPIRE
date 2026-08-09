import Link from "next/link";
import HUD from "../../components/HUD";
import StatusPill from "../../components/StatusPill";
import { getNotifications } from "../../lib/data";

export const dynamic = "force-dynamic";

const LEVEL_LABEL = { critical: "🔴 Critical", attention: "🟡 Watch", active: "🟢 Positive", info: "🔵 Info" };

export default async function NotificationsPage() {
  const notifications = await getNotifications();
  return (
    <>
      <HUD />
      <main>
        <Link href="/" className="backlink">← Back to the map</Link>
        <p className="eyebrow">Notification Center — Live</p>
        <h1>🔔 Notifications</h1>
        <div className="panel">
          {notifications.map(n => (
            <div key={n.id} className="feed-item">
              <div className="fdate mono">{n.date}</div>
              <div style={{ flex: 1 }}>{n.text}</div>
              <StatusPill status={n.level} label={LEVEL_LABEL[n.level] || n.level} />
            </div>
          ))}
        </div>
        <div className="panel"><div className="note">Priority levels reuse the Analytics Agent&apos;s alert framework (agents/analyticsdir/kpi-and-alerts.md) — same 🔴🟡🟢🔵 scale everywhere in the empire.</div></div>
      </main>
    </>
  );
}
