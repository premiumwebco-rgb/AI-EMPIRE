// Queries data/empire.db and prints the JSON the castle needs for its
// task/status/feed/notification panels. This is the "Real-Time State
// Architecture" connective piece: the castle no longer has this data
// hand-typed into its JS — it's generated from the same database that
// real task completions write to.
//
// This does NOT make the published Artifact live (a static Artifact
// still can't hold a DB connection — see the constraint documented in
// docs/empire-backend-architecture.md). What it does: replaces "Claude
// hand-edits an embedded JS object" with "Claude queries the DB and
// regenerates from it" — same manual-republish workflow, real source of
// truth underneath. True browser push is Phase 2+, not attempted here.
//
// Run with: node scripts/export-castle-data.mjs

import { DatabaseSync } from "node:sqlite";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DB_PATH = join(__dirname, "..", "data", "empire.db");
const db = new DatabaseSync(DB_PATH, { readOnly: true });

function parseArrays(row, fields) {
  for (const f of fields) {
    if (row[f] != null) row[f] = JSON.parse(row[f]);
  }
  return row;
}

const tasks = db.prepare(`
  SELECT id, raw_command, agent, status, queued_at, started_at, completed_at,
         dependencies, files_affected, report_outcome, report_reasoning,
         report_files_created, report_files_modified, report_recommendations,
         report_confidence, report_next_action
  FROM tasks ORDER BY queued_at ASC
`).all().map(r => parseArrays(r, ["dependencies", "files_affected", "report_files_created", "report_files_modified"]));

const agentStatus = db.prepare("SELECT * FROM agent_status").all();

const feed = db.prepare(`
  SELECT date, agent, business_id, priority, text, source
  FROM activity_feed ORDER BY date DESC, id DESC
`).all();

const notifications = db.prepare(`
  SELECT date, level, text, source FROM notifications ORDER BY date DESC, id DESC
`).all();

const output = { tasks, agent_status: agentStatus, feed, notifications, exported_at: new Date().toISOString().slice(0, 10) };

console.log(JSON.stringify(output, null, 2));

db.close();
