// Server-side Supabase clients. Two, on purpose:
//   - sessionClient(): respects the visitor's login (RLS applies) — used
//     by Server Components for reads.
//   - adminClient(): service-role, bypasses RLS — used only inside API
//     routes, only after that route has confirmed a real session exists.
//     Never imported into anything that runs in the browser.

import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

export function sessionClient() {
  const cookieStore = cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name) {
          return cookieStore.get(name)?.value;
        }
      }
    }
  );
}

export function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { persistSession: false } }
  );
}

// Every API route that mutates data calls this first. If there's no
// authenticated session, the request is refused before any write logic
// runs — this is the "preventing unauthorized task execution" control.
export async function requireSession() {
  const supabase = sessionClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user || null;
}
