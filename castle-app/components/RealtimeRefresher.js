"use client";

// Subscribes to every table the castle displays. On any change, calls
// router.refresh() — Next.js re-runs the Server Components' data fetches
// and patches the DOM, without a full page reload. This is the literal
// mechanism behind "a task is created -> mission board updates",
// "a report completes -> it appears automatically", etc. No polling: the
// subscription is push, via Supabase Realtime (Postgres logical
// replication over WebSocket).

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { browserClient } from "../lib/supabase-browser";

export default function RealtimeRefresher() {
  const router = useRouter();

  useEffect(() => {
    const supabase = browserClient();
    let channel;
    let cancelled = false;

    // postgres_changes locks in whatever auth context existed at subscribe
    // time — the session restored from the SSR cookie doesn't reach
    // realtime-js's socket auth automatically, so without this explicit
    // setAuth() every change event is silently dropped by RLS.
    supabase.auth.getSession().then(({ data }) => {
      if (cancelled) return;
      if (data?.session?.access_token) {
        supabase.realtime.setAuth(data.session.access_token);
      }
      channel = supabase
        .channel("castle-live")
        .on("postgres_changes", { event: "*", schema: "public", table: "tasks" }, () => router.refresh())
        .on("postgres_changes", { event: "*", schema: "public", table: "activity_feed" }, () => router.refresh())
        .on("postgres_changes", { event: "*", schema: "public", table: "notifications" }, () => router.refresh())
        .on("postgres_changes", { event: "*", schema: "public", table: "reports" }, () => router.refresh())
        .subscribe();
    });

    return () => {
      cancelled = true;
      if (channel) supabase.removeChannel(channel);
    };
  }, [router]);

  return null;
}
