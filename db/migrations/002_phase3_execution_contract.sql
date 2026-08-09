-- Phase 3 execution contract — additive migration.
-- task_type, report_input_data, report_actions_taken, report_risks were
-- already added directly in db/schema.postgres.sql during the live-castle
-- build. This migration adds the two fields still missing, needed to
-- match the universal report format (docs/agent-feedback-loop.md +
-- data/agent-adapters.json): blockers, and an explicit execution-state
-- flag distinguishing planned/generated/executed/verified work (see
-- scripts/lib/adapters.mjs). Additive only — no drops, no rewrites,
-- existing rows are untouched (new columns default to NULL).

ALTER TABLE tasks ADD COLUMN IF NOT EXISTS report_blockers TEXT;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS report_execution_state TEXT
  CHECK (report_execution_state IS NULL OR report_execution_state IN ('planned','generated','executed','verified'));
