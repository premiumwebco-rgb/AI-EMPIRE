import Link from "next/link";
import HUD from "../../components/HUD";
import ActivityFeedView from "../../components/ActivityFeedView";
import { getActivityFeed } from "../../lib/data";

export const dynamic = "force-dynamic";

export default async function FeedPage() {
  const feed = await getActivityFeed({ limit: 200 });
  return (
    <>
      <HUD />
      <main>
        <Link href="/" className="backlink">← Back to the map</Link>
        <p className="eyebrow">Empire-Wide — Live</p>
        <h1>Activity Feed</h1>
        <p>Every entry is a real, traceable event, queried directly from Postgres — this list grows the moment a new row is inserted, with no redeploy.</p>
        <ActivityFeedView feed={feed} />
      </main>
    </>
  );
}
