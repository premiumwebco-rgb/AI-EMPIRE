-- Agent Runtime layer — adds 'blocked' as a 5th execution_state value
-- (planned/generated/executed/verified/blocked), per the tool-abstraction
-- work in scripts/lib/tools.mjs. Postgres enforces this via a CHECK
-- constraint (SQLite validates the same enum at the app layer only, so it
-- needed no equivalent migration). Additive in effect — widens what's
-- allowed, drops nothing, touches no existing rows.

ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_report_execution_state_check;
ALTER TABLE tasks ADD CONSTRAINT tasks_report_execution_state_check
  CHECK (report_execution_state IS NULL OR report_execution_state IN ('planned','generated','executed','verified','blocked'));
