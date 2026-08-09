// AI-EMPIRE Phase 1 — one-time import.
// Creates data/empire.db, applies data/schema.sql, and migrates the real
// data already sitting in data/state/command-queue.json plus the same
// activity/notification facts already shown (hand-compiled, but real and
// sourced) in the castle artifact. Nothing here is invented — every row
// either comes straight from an existing file or cites the file it's
// drawn from.
//
// Run with: node scripts/phase1-import.mjs
// Safe to re-run: tasks are upserted by id; feed/notifications are only
// seeded if the tables are currently empty (won't duplicate on re-run).

import { DatabaseSync } from "node:sqlite";
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const DB_PATH = join(ROOT, "data", "empire.db");
const SCHEMA_PATH = join(ROOT, "data", "schema.sql");
const QUEUE_PATH = join(ROOT, "data", "state", "command-queue.json");

const db = new DatabaseSync(DB_PATH);
db.exec(readFileSync(SCHEMA_PATH, "utf8"));

// ---------- 1. Import tasks from the real command queue ----------
const queueData = JSON.parse(readFileSync(QUEUE_PATH, "utf8"));

const upsertTask = db.prepare(`
  INSERT INTO tasks (
    id, raw_command, agent, status, queued_at, started_at, completed_at,
    dependencies, files_affected,
    report_outcome, report_reasoning, report_files_created, report_files_modified,
    report_recommendations, report_confidence, report_next_action
  ) VALUES (
    ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
  )
  ON CONFLICT(id) DO UPDATE SET
    status=excluded.status, started_at=excluded.started_at, completed_at=excluded.completed_at,
    report_outcome=excluded.report_outcome, report_reasoning=excluded.report_reasoning,
    report_files_created=excluded.report_files_created, report_files_modified=excluded.report_files_modified,
    report_recommendations=excluded.report_recommendations, report_confidence=excluded.report_confidence,
    report_next_action=excluded.report_next_action
`);

let taskCount = 0;
for (const t of queueData.queue) {
  const r = t.completion_report || {};
  upsertTask.run(
    t.id,
    t.raw_command,
    t.agent,
    t.status,
    t.queued_at,
    t.started_at || null,
    t.completed_at || null,
    JSON.stringify(t.dependencies || []),
    JSON.stringify(t.files_affected || []),
    r.outcome || null,
    r.reasoning || null,
    JSON.stringify(r.files_created || []),
    JSON.stringify(r.files_modified || []),
    r.recommendations || null,
    r.confidence || null,
    r.next_suggested_action || null
  );
  taskCount++;
}

// ---------- 2. Seed activity_feed (only if empty) ----------
// Same real events already shown in the castle's EMPIRE.feed array.
// Each `source` cites the actual file the event is drawn from.
const feedEmpty = db.prepare("SELECT COUNT(*) AS n FROM activity_feed").get().n === 0;
let feedCount = 0;
if (feedEmpty) {
  const insertFeed = db.prepare(`
    INSERT INTO activity_feed (date, agent, business_id, priority, text, source, task_id)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  const feed = [
    { date: "2026-08-07", agent: "Ember", priority: "high", text: "Verified Printify billing checklist — 3 of 4 items confirmed live.", source: "data/state/command-queue.json (cq-003)", task_id: "cq-003" },
    { date: "2026-08-07", agent: "Ember", priority: "medium", text: "Convened the first War Room meeting.", source: "reports/war-room/2026-08-07-war-room.md", task_id: "cq-002" },
    { date: "2026-08-07", agent: "Tally", priority: "medium", text: "Reported insufficient data — no trend computable yet.", source: "reports/war-room/2026-08-07-war-room.md", task_id: "cq-002" },
    { date: "2026-08-06", agent: "Tally", priority: "medium", text: "Activated for WillowGiftWorks — launch-day baseline logged.", source: "data/metrics/willowgiftworks-etsy.json", task_id: "cq-001" },
    { date: "2026-08-06", agent: "Design", priority: "low", text: "Logged a discovery: no kid-appropriate lifestyle mockups for the current blank.", source: "data/marketplace-intel/discoveries.json", task_id: null },
    { date: "2026-08-06", agent: "Ember", priority: "medium", text: "Confirmed all 5 Halloween listings live; shop policies updated.", source: "docs/launch-monitoring-checklist.md", task_id: null }
  ];
  for (const f of feed) {
    insertFeed.run(f.date, f.agent, "willowgiftworks-etsy", f.priority, f.text, f.source, f.task_id);
    feedCount++;
  }
}

// ---------- 3. Seed notifications (only if empty) ----------
const notifEmpty = db.prepare("SELECT COUNT(*) AS n FROM notifications").get().n === 0;
let notifCount = 0;
if (notifEmpty) {
  const insertNotif = db.prepare(`
    INSERT INTO notifications (date, level, text, source) VALUES (?, ?, ?, ?)
  `);
  const notifs = [
    { date: "2026-08-07", level: "active", text: "Printify billing 3/4 verified — payment method, default payment, and Etsy connection all confirmed active.", source: "data/state/command-queue.json (cq-003)" },
    { date: "2026-08-07", level: "attention", text: "Test fulfillment path still open — deferred to the first real order by founder's choice.", source: "data/state/missions.json (sq-01)" },
    { date: "2026-08-07", level: "info", text: "First War Room meeting completed — 3 decisions logged.", source: "reports/war-room/2026-08-07-war-room.md" },
    { date: "2026-08-06", level: "info", text: "Tally activated — awaiting first daily Etsy Stats log.", source: "data/metrics/willowgiftworks-etsy.json" },
    { date: "2026-08-06", level: "attention", text: "Design gap on record — no kid-appropriate lifestyle mockups available for the current blank.", source: "data/marketplace-intel/discoveries.json" }
  ];
  for (const n of notifs) {
    insertNotif.run(n.date, n.level, n.text, n.source);
    notifCount++;
  }
}

// ---------- 4. Verify ----------
const counts = {
  tasks: db.prepare("SELECT COUNT(*) AS n FROM tasks").get().n,
  activity_feed: db.prepare("SELECT COUNT(*) AS n FROM activity_feed").get().n,
  notifications: db.prepare("SELECT COUNT(*) AS n FROM notifications").get().n,
  agent_status_rows: db.prepare("SELECT COUNT(*) AS n FROM agent_status").get().n
};

console.log("Phase 1 import complete.");
console.log("  DB file:", DB_PATH);
console.log("  Tasks upserted this run:", taskCount, "| total in table:", counts.tasks);
console.log("  Activity feed seeded this run:", feedCount, "| total in table:", counts.activity_feed);
console.log("  Notifications seeded this run:", notifCount, "| total in table:", counts.notifications);
console.log("  Distinct agents with status rows:", counts.agent_status_rows);
console.log("\nagent_status view:");
for (const row of db.prepare("SELECT * FROM agent_status").all()) {
  console.log(" ", JSON.stringify(row));
}

db.close();
