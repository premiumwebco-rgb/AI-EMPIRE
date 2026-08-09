# State Data — Storage Convention

This folder holds persistent, current-state facts about the empire that
aren't a time series (that's `data/metrics/`) and aren't a one-time handoff
record (that's `data/pipeline/`). Currently: `missions.json` (the mission
board) and `command-queue.json` (the founder's request queue — this file).

---

## `command-queue.json` — what it actually is

This is **not** a live task runner. Nothing in this repository executes
queue entries automatically — there is no scheduler, no background process,
no way for a request to move from `queued` to `running` on its own. See
`docs/agent-feedback-loop.md` and the Analytics Agent docs for why: this
project deliberately runs on manual invocation until a real need justifies
automation, and — separately — a browser-published page (like AI-EMPIRE HQ)
has no way to reach this file or invoke Claude on its own; it can only be
written to from inside an actual Claude Code session.

**How a request actually gets executed:**
1. The founder composes a request (in the castle's Command Console, or
   directly in chat) — e.g. *"Scout: research profitable hockey niches."*
2. It's added here with `status: "queued"`.
3. In a real Claude Code session, the founder (or Claude, checking the
   queue) picks it up. Status moves to `running`, then `completed` or
   `failed`, with a real `completion_report` filled in from what actually
   happened.
4. The castle artifact is regenerated and republished to reflect it.

If you open the castle and it shows a `queued` item that's been sitting for
days, that's accurate — it means nobody has brought it to a session yet,
not that something is broken.

## `empire.db` — the Phase 1 backend (added 2026-08-07)

As of `docs/empire-backend-architecture.md` Phase 1, `command-queue.json`
is no longer the live source of truth for the queue — **`data/empire.db`
(SQLite) is.** This file stays in the repo as the historical record of
how the queue looked at the time it was written, and as the seed data
`scripts/phase1-import.mjs` migrated into the database — it is not
updated going forward. New tasks go into `empire.db` directly.

`empire.db` also holds `activity_feed` and `notifications` (new tables —
no prior file equivalent existed) and an `agent_status` **view**, derived
entirely from `tasks` rather than stored separately, so status can never
drift out of sync with the task history that produces it.

- Schema: `data/schema.sql`
- One-time import from this file: `scripts/phase1-import.mjs` (idempotent — safe to re-run)
- Query for the castle: `scripts/export-castle-data.mjs`

This does not make the published castle Artifact live — a static Artifact
still can't hold a database connection. What changed is that regenerating
the castle now means running a real query against real data instead of
hand-editing an embedded JavaScript object. True browser push (no
regenerate step at all) is Phase 2+, described in the architecture doc.

## Schema (of `command-queue.json`, for historical reference)

```json
{
  "id": "cq-001",
  "raw_command": "Ember: convene War Room to assess WillowGiftWorks launch status",
  "agent": "Ember",
  "status": "queued | running | waiting | completed | failed",
  "queued_at": "2026-08-07",
  "started_at": null,
  "completed_at": null,
  "dependencies": [],
  "files_affected": [],
  "completion_report": {
    "task": "",
    "outcome": "",
    "reasoning": "",
    "files_created": [],
    "files_modified": [],
    "recommendations": "",
    "confidence": "",
    "next_suggested_action": ""
  }
}
```

`completion_report` is `null` until `status` reaches `completed` or
`failed`. Every field in it must describe something that actually
happened — no field is filled in speculatively ahead of the real work.

## Rule carried over from every other data file in this project

Same discipline as `data/metrics/README.md`: don't invent a number, a
status, or a completion report. `queued` with nothing else filled in is a
complete and honest record of "asked for, not yet done."
