// Additive schema migration for data/empire.db — Phase 3 execution
// contract fields. Safe to re-run (checks existing columns first, only
// adds what's missing). Never drops or rewrites existing data.
//
// Usage: node scripts/migrate-schema.mjs

import { openDb } from "./lib/db.mjs";

const db = openDb();

const existing = db.prepare("PRAGMA table_info(tasks)").all().map(c => c.name);

// [column, DDL fragment]
const REQUIRED_COLUMNS = [
  ["task_type", "TEXT"],
  ["report_input_data", "TEXT"],
  ["report_actions_taken", "TEXT"],
  ["report_risks", "TEXT"],
  ["report_blockers", "TEXT"],
  ["report_execution_state", "TEXT"]
];

let added = 0;
for (const [name, ddl] of REQUIRED_COLUMNS) {
  if (existing.includes(name)) {
    console.log(`  already present: ${name}`);
    continue;
  }
  db.exec(`ALTER TABLE tasks ADD COLUMN ${name} ${ddl}`);
  console.log(`  added column: ${name} ${ddl}`);
  added++;
}

console.log(`\nMigration complete. ${added} column(s) added, ${REQUIRED_COLUMNS.length - added} already present.`);
console.log("No rows were modified or deleted.");

db.close();
