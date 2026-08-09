import Link from "next/link";
import { getNotifications } from "../lib/data";
import { ACHIEVEMENTS } from "../lib/config";
import CommandConsole from "./CommandConsole";
import RealtimeRefresher from "./RealtimeRefresher";

export default async function HUD() {
  const notifications = await getNotifications();
  const unread = notifications.filter(n => !n.read_at).length;

  return (
    <div className="hud">
      <RealtimeRefresher />
      <div className="hud-top">
        <Link href="/" className="crest">
          <span className="glyph">🏰</span>
          <div>
            <div className="crest-title">AI-EMPIRE HQ</div>
            <div className="crest-sub">Live — reads Postgres directly, no snapshot</div>
          </div>
        </Link>
        <div className="hud-actions">
          <Link href="/feed" className="hud-btn">📰 Activity Feed</Link>
          <Link href="/notifications" className="hud-btn">
            🔔 Notifications
            {unread > 0 && <span className="badge">{unread}</span>}
          </Link>
          <Link href="/war-room" className="hud-btn war">⚔️ Call Meeting</Link>
          <Link href="/night-mode" className="hud-btn night">🌙 Night Mode</Link>
        </div>
      </div>
      <CommandConsole />
      <div className="achv-strip">
        {ACHIEVEMENTS.map(a => (
          <div key={a.name} className="achv">
            <span className="dot" />
            {a.icon} {a.name}
            <span className="prog">
              {a.threshold === 1 ? "1 / 1 ✓" : "no live revenue feed yet"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
