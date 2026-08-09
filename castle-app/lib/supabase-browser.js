// Browser-side Supabase client — used for login, and for the realtime
// subscriptions that make the castle update without a refresh. Uses the
// anon key only; RLS (db/schema.postgres.sql) is what actually restricts
// what an unauthenticated visitor could ever see or change.

"use client";

import { createBrowserClient } from "@supabase/ssr";

let client;

export function browserClient() {
  if (!client) {
    client = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
  }
  return client;
}
