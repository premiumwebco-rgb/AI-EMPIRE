-- AI-EMPIRE Live Castle — Postgres schema (Supabase).
-- Ported from data/schema.sql (SQLite, Phase 1). Same tables, same
-- columns, same rules — only the storage engine changes. See
-- docs/empire-backend-architecture.md for the full system design.
--
-- Differences from the SQLite version, and why:
--   - INTEGER PRIMARY KEY AUTOINCREMENT -> GENERATED ALWAYS AS IDENTITY
--   - JSON-as-TEXT columns -> JSONB (native type, queryable, same data)
--   - Row Level Security added (SQLite has no equivalent — this is new,
--     not a port, and exists specifically for the live app's Security
--     requirement: the browser never gets unrestricted table access)
--
-- Design rule carried over unchanged: never store a fabricated value.
-- NULL means "not known," not zero/empty.

-- ============================================================
-- tasks — the Task Queue AND (with activity_feed) the Empire Ledger.
-- Rows are never deleted, including failed/completed ones.
-- ============================================================
CREATE TABLE IF NOT EXISTS tasks (
  id                      TEXT PRIMARY KEY,
  raw_command             TEXT NOT NULL,
  agent                   TEXT NOT NULL,
  task_type               TEXT,   -- Phase 3: validated against data/agent-adapters.json when present
  status                  TEXT NOT NULL CHECK (status IN ('queued','running','waiting','completed','failed')),
  queued_at               DATE NOT NULL,
  started_at              DATE,
  completed_at            DATE,
  dependencies            JSONB NOT NULL DEFAULT '[]',
  files_affected          JSONB NOT NULL DEFAULT '[]',
  -- universal completion report (Phase 3 format) — NULL until completed/failed
  report_input_data       TEXT,
  report_actions_taken    TEXT,
  report_outcome          TEXT,   -- serves the "Findings" role
  report_reasoning        TEXT,
  report_files_created    JSONB NOT NULL DEFAULT '[]',
  report_files_modified   JSONB NOT NULL DEFAULT '[]',
  report_recommendations  TEXT,
  report_confidence       TEXT,
  report_next_action      TEXT,
  report_risks            TEXT,
  report_blockers         TEXT,   -- Phase 3: db/migrations/002_phase3_execution_contract.sql
  report_execution_state  TEXT CHECK (report_execution_state IS NULL OR report_execution_state IN ('planned','generated','executed','verified')),
  created_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- activity_feed — append-only.
-- ============================================================
CREATE TABLE IF NOT EXISTS activity_feed (
  id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  date        DATE NOT NULL,
  agent       TEXT NOT NULL,
  business_id TEXT,
  priority    TEXT NOT NULL CHECK (priority IN ('high','medium','low')),
  text        TEXT NOT NULL,
  source      TEXT NOT NULL,
  task_id     TEXT REFERENCES tasks(id),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- notifications — same 4-level scale as agents/analyticsdir/kpi-and-alerts.md.
-- ============================================================
CREATE TABLE IF NOT EXISTS notifications (
  id         BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  date       DATE NOT NULL,
  level      TEXT NOT NULL CHECK (level IN ('critical','attention','active','info')),
  text       TEXT NOT NULL,
  source     TEXT,
  read_at    TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- reports — NEW, not a straight port. War Room transcripts and Morning
-- Briefings were markdown files (reports/war-room/*.md,
-- reports/morning-briefing/*.md) — fine for the old regenerate-and-
-- republish castle, but a live app reading from a bundled copy would
-- need a redeploy for every new report, defeating the point of this
-- build. Structured content (transcript, goals/problems/decisions) goes
-- in JSONB so the War Room / Night Mode pages stay queries, not code.
-- The .md files remain the git-committed narrative archive per
-- docs/empire-backend-architecture.md §0.1 — this table doesn't replace
-- them, it's what the live app reads instead of a bundled snapshot.
-- ============================================================
CREATE TABLE IF NOT EXISTS reports (
  id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  type        TEXT NOT NULL CHECK (type IN ('war_room','morning_briefing','weekly','monthly','launch','adhoc')),
  business_id TEXT,
  date        DATE NOT NULL,
  title       TEXT NOT NULL,
  content     JSONB NOT NULL,
  source_file TEXT,   -- the .md file this was also committed to, if any
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "authenticated read reports" ON reports FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "authenticated write reports" ON reports FOR INSERT WITH CHECK (auth.role() = 'authenticated');
ALTER PUBLICATION supabase_realtime ADD TABLE reports;

-- ============================================================
-- agent_status — a VIEW, not a table, same reasoning as the SQLite version:
-- status is fully derivable from tasks, so storing it separately would
-- create a second source of truth that could drift from the first.
-- ============================================================
CREATE OR REPLACE VIEW agent_status AS
SELECT
  agent,
  (SELECT raw_command FROM tasks t2
     WHERE t2.agent = t.agent AND t2.status IN ('queued','running')
     ORDER BY t2.queued_at DESC LIMIT 1)              AS current_task,
  (SELECT status FROM tasks t2b
     WHERE t2b.agent = t.agent AND t2b.status IN ('queued','running')
     ORDER BY t2b.queued_at DESC LIMIT 1)              AS current_task_status,
  (SELECT raw_command FROM tasks t3
     WHERE t3.agent = t.agent AND t3.status = 'completed'
     ORDER BY t3.completed_at DESC LIMIT 1)             AS last_completed_task,
  (SELECT completed_at FROM tasks t4
     WHERE t4.agent = t.agent AND t4.status = 'completed'
     ORDER BY t4.completed_at DESC LIMIT 1)             AS last_completed_at,
  (SELECT COUNT(*) FROM tasks t5
     WHERE t5.agent = t.agent AND t5.status = 'completed') AS completed_count,
  (SELECT COUNT(*) FROM tasks t6
     WHERE t6.agent = t.agent AND t6.status = 'failed')    AS failed_count
FROM (SELECT DISTINCT agent FROM tasks) t;

-- ============================================================
-- Row Level Security — new for the live app. Single-founder system:
-- only an authenticated session may read or write anything. The browser
-- never holds direct table credentials (see lib/supabase.js) — this is
-- the backstop if that boundary is ever misconfigured.
-- ============================================================
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_feed ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "authenticated read tasks" ON tasks FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "authenticated write tasks" ON tasks FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "authenticated update tasks" ON tasks FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "authenticated read activity_feed" ON activity_feed FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "authenticated write activity_feed" ON activity_feed FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "authenticated read notifications" ON notifications FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "authenticated write notifications" ON notifications FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Enable Realtime on the tables the castle subscribes to. This is what
-- makes "no refresh" real — Supabase streams row changes on these
-- tables to any subscribed client over WebSocket.
ALTER PUBLICATION supabase_realtime ADD TABLE tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE activity_feed;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
