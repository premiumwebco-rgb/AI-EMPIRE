-- AI-EMPIRE Phase 1 Backend Schema
-- SQLite (via Node's built-in node:sqlite). See docs/empire-backend-architecture.md
-- for the full system design; this implements only the Phase 1 slice of it.
--
-- Design rule carried over from every file-based convention in this project:
-- never store a fabricated value. NULL means "not known," not zero/empty.

-- ============================================================
-- tasks — the Task Queue AND (with activity_feed) the Empire Ledger.
-- Rows are never deleted, including failed/completed ones — the full
-- history is the audit trail. Maps 1:1 onto the schema already defined
-- in data/state/README.md / data/state/command-queue.json.
-- ============================================================
CREATE TABLE IF NOT EXISTS tasks (
  id                      TEXT PRIMARY KEY,
  raw_command             TEXT NOT NULL,
  agent                   TEXT NOT NULL,
  task_type               TEXT,   -- Phase 3: validated against data/agent-adapters.json
  status                  TEXT NOT NULL CHECK (status IN ('queued','running','waiting','completed','failed')),
  queued_at               TEXT NOT NULL,
  started_at              TEXT,
  completed_at            TEXT,
  dependencies            TEXT,   -- JSON array of task ids, e.g. '["cq-001"]'
  files_affected          TEXT,   -- JSON array of file paths
  -- completion_report fields (NULL until status is completed/failed) —
  -- universal report format, Phase 3. See scripts/lib/adapters.mjs.
  report_input_data       TEXT,
  report_actions_taken    TEXT,
  report_outcome          TEXT,
  report_reasoning        TEXT,
  report_files_created    TEXT,   -- JSON array
  report_files_modified   TEXT,   -- JSON array
  report_recommendations  TEXT,
  report_confidence       TEXT,
  report_next_action      TEXT,
  report_risks            TEXT,
  report_blockers         TEXT,
  report_execution_state  TEXT CHECK (report_execution_state IS NULL OR report_execution_state IN ('planned','generated','executed','verified'))
);

-- ============================================================
-- activity_feed — append-only. Every row here is a real, sourced event;
-- "source" must name the file or task id the event is traceable to,
-- same rule the castle's Activity Feed view already enforces.
-- ============================================================
CREATE TABLE IF NOT EXISTS activity_feed (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  date        TEXT NOT NULL,
  agent       TEXT NOT NULL,
  business_id TEXT,
  priority    TEXT NOT NULL CHECK (priority IN ('high','medium','low')),
  text        TEXT NOT NULL,
  source      TEXT NOT NULL,
  task_id     TEXT REFERENCES tasks(id)
);

-- ============================================================
-- notifications — reuses agents/analyticsdir/kpi-and-alerts.md's alert
-- scale (🔴 critical / 🟡 attention / 🟢 active / 🔵 info) so the same
-- four levels mean the same thing everywhere in the empire.
-- ============================================================
CREATE TABLE IF NOT EXISTS notifications (
  id        INTEGER PRIMARY KEY AUTOINCREMENT,
  date      TEXT NOT NULL,
  level     TEXT NOT NULL CHECK (level IN ('critical','attention','active','info')),
  text      TEXT NOT NULL,
  source    TEXT,
  read_at   TEXT
);

-- ============================================================
-- agent_status — a VIEW, not a table. Agent status is fully derivable
-- from tasks; storing it separately would create a second source of
-- truth that could drift from the first. This is the same query the
-- castle's renderRoom() already runs client-side, now expressible in SQL.
-- ============================================================
CREATE VIEW IF NOT EXISTS agent_status AS
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
