# AI-EMPIRE HQ — Live Castle

Replaces the generated-snapshot Artifact with a real app that queries
Postgres directly. See `docs/empire-backend-architecture.md` for the full
design; this is Phase 1 of that plan, built now because the castle
specifically needed it.

**What changed vs. the old castle:** no embedded JSON, no manual
regenerate-and-republish. Every page is a live query. Realtime
subscriptions push changes to the browser without a refresh.

**What didn't change:** the visual design (same CSS, same rooms, same
information), the task lifecycle rules (dependency gating, stop-signal
blocking, universal report format — all ported from `scripts/*.mjs`
unchanged), and the manual-execution model (this app lets you view state
and queue requests; actually doing the work still happens in a real
Claude Code session — see Phase 3, unaffected by this build).

---

## Setup — the two things I can't do for you

### 1. Create a Supabase project (~3 minutes)

1. Go to [supabase.com](https://supabase.com) → New project (free tier).
2. Once it's ready, open the **SQL Editor** and paste in the entire
   contents of `db/schema.postgres.sql` (one level up from this folder).
   Run it.
3. Go to **Authentication → Users** → Add user → create yourself an
   email/password login. This app doesn't self-register accounts on
   purpose (single-founder system).
4. Go to **Settings → API** and copy: Project URL, `anon` `public` key,
   and `service_role` key (keep this one secret).

### 2. Local setup + migrate your real data

```bash
cd castle-app
npm install
cp .env.local.example .env.local
# paste in the 3 values from Supabase step 1.4

node --env-file=.env.local scripts/migrate-to-postgres.mjs
```

This moves everything real that already exists — every task, activity
feed entry, and notification from `data/empire.db`, plus the actual War
Room and Morning Briefing content from `reports/*.md` — into Postgres.
Nothing is invented; it's a direct copy.

### 3. Run it locally to check

```bash
npm run dev
```

Open `http://localhost:3000`, log in with the account from step 1.3.

### 4. Deploy (permanent URL)

1. Push this repo to GitHub (if not already).
2. Go to [vercel.com](https://vercel.com) → New Project → import the repo
   → set **Root Directory** to `castle-app`.
3. Add the same 3 environment variables from `.env.local` in Vercel's
   project settings.
4. Deploy. Vercel gives you a permanent URL and auto-deploys on every
   push from here on — that's "updates deploy automatically" satisfied
   for the *app code*; the *data* updates live, with no deploy needed at
   all, the moment a row changes in Postgres.

---

## What's in here

| Path | Purpose |
|---|---|
| `app/page.js` | The map/overview — live agent status per room |
| `app/room/[id]/page.js` | One agent's room — task history, adapter, request composer |
| `app/war-room/page.js`, `app/night-mode/page.js` | Read the latest row from the new `reports` table |
| `app/feed/page.js`, `app/notifications/page.js` | Live, filterable |
| `app/api/tasks/{create,claim,complete}/route.js` | Ported from `scripts/*.mjs` — same validation, same gating, now HTTP endpoints |
| `middleware.js` | Auth gate — every route but `/login` requires a real session |
| `lib/agent-adapters.json` | **Synced copy** of `data/agent-adapters.json` — Vercel only deploys files inside this folder, so this has to be duplicated here. If the adapters change, update both. |
| `scripts/migrate-to-postgres.mjs` | One-time (safe to re-run) data migration |

## Known limitation

`lib/agent-adapters.json` is a manual sync point — see the table above.
Everything else genuinely reads live from Postgres; this one file is the
exception, and it's small/rare-to-change enough that automating the sync
isn't worth it yet.
