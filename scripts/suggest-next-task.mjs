// Turns the manual routing logic in docs/agent-feedback-loop.md into a
// printed suggestion. This NEVER creates a task itself — it prints the
// recommended agent/task_type and the exact create-task.mjs command to
// run, and stops. Suggestions remain suggestions; a human or Claude
// session decides whether to actually invoke it.
//
// Usage: node scripts/suggest-next-task.mjs <task-id>

import { openDb, STOP_NEXT_ACTIONS } from "./lib/db.mjs";

const [, , id] = process.argv;
if (!id) {
  console.error("Usage: node scripts/suggest-next-task.mjs <task-id>");
  process.exit(1);
}

const db = openDb();
const task = db.prepare("SELECT * FROM tasks WHERE id = ?").get(id);
if (!task) {
  console.error(`No task ${id}.`);
  process.exit(1);
}

function suggest(text, command) {
  console.log(`\nSUGGESTION: ${text}`);
  if (command) console.log(`  To act on this: ${command}`);
  console.log(`  (This is a suggestion only. Nothing has been created.)`);
}

console.log(`=== NEXT-ACTION SUGGESTION FOR ${id} ===`);
console.log(`Agent: ${task.agent}   Task type: ${task.task_type || "(unset)"}   Status: ${task.status}\n`);

if (task.status === "waiting") {
  suggest(
    `This task is blocked on a dependency that stopped. Review the blocking task's report_next_action and report_risks/report_blockers, then either fix the upstream issue and re-run scripts/claim-task.mjs ${id}, or escalate to Ember (task_type: route) for a founder decision.`
  );
  db.close();
  process.exit(0);
}

if (task.status === "failed") {
  suggest(
    `Task failed. Do not retry automatically. Escalate to Ember: create a "route" task summarizing the failure (report_risks/report_blockers) for founder review. If this is the second consecutive failure at this stage for the same objective, stop entirely — do not attempt a third time.`,
    `node scripts/create-task.mjs <new-id> Ember "Review failure of ${id}" --type=route --depends=${id}`
  );
  db.close();
  process.exit(0);
}

if (task.status !== "completed") {
  console.log(`Task is '${task.status}' — no suggestion until it completes, fails, or is blocked.`);
  db.close();
  process.exit(0);
}

const nextAction = (task.report_next_action || "").trim();

if (STOP_NEXT_ACTIONS.includes(nextAction)) {
  suggest(`This task completed with a stop signal (next_action: "${nextAction}"). Nothing should build on it. Review report_reasoning/report_risks and, if a fix is needed, address it at this same stage before re-attempting.`);
  db.close();
  process.exit(0);
}

// Routing table generalized from docs/agent-feedback-loop.md §5/§8, keyed
// by agent + next_action rather than a fixed 5-stage POD pipeline.
const ROUTES = {
  "Scout|proceed_to_design":     { agent: "Design",    type: "design_concept",   why: "Research found a viable opportunity — hand off for concept generation." },
  "Design|proceed_to_listing":   { agent: "Listing",   type: "listing_create",   why: "Design passed QA — hand off for listing copy and pricing." },
  "Listing|proceed_to_marketing":{ agent: "Marketing", type: "marketing_strategy", why: "Listing copy/pricing is drafted — hand off for marketing strategy. Marketing must independently verify this listing is actually live (published: true) before starting real strategy; proceed_to_marketing does not itself guarantee that." },
  "Marketing|begin_tracking":    { agent: "Tally",     type: "analyze_performance", why: "Marketing launch is confirmed — begin/continue tracking performance." },
  "Printify|fulfillment_setup":  { agent: "Listing",   type: "listing_create",   why: "Fulfillment is confirmed ready — safe to proceed with listing." }
};

const routeKey = `${task.agent}|${nextAction}`;
if (ROUTES[routeKey]) {
  const r = ROUTES[routeKey];
  suggest(r.why, `node scripts/create-task.mjs <new-id> ${r.agent} "<command>" --type=${r.type} --depends=${id}`);
  db.close();
  process.exit(0);
}

// Tally verdicts drive the growth/repair loop (§5-§7).
if (task.agent === "Tally") {
  const outcome = (task.report_outcome || "").toLowerCase();
  if (outcome.includes("winner")) {
    suggest(
      `Tally reported a winner verdict. Open a winner_expansion research brief for a variation batch (new collection_id, source_collection_id pointing back to this one).`,
      `node scripts/create-task.mjs <new-id> Scout "winner_expansion brief based on ${id}" --type=research_opportunity --depends=${id}`
    );
  } else if (outcome.includes("underperform") || outcome.includes("failing")) {
    suggest(
      `Tally reported underperforming/failing. Per docs/agent-feedback-loop.md §5, route back to whichever stage owns the likely_cause named in the report (creative -> Design, copy_seo/pricing -> Listing, demand_channel -> Marketing) — do not restart from Research. Read report_reasoning to find the stated likely_cause before creating the task.`
    );
  } else if (outcome.includes("insufficient")) {
    suggest(`Insufficient data — no action. Keep logging metrics until evidence reaches Tier 3+.`);
  } else {
    suggest(`Tally completed but the outcome text doesn't match a known verdict pattern (winner/underperforming/failing/insufficient_data). Route to Ember (task_type: route) for manual review.`);
  }
  db.close();
  process.exit(0);
}

if (task.agent === "Ember") {
  suggest(`Ember task completed. No automatic downstream action — review report_reasoning for what Ember recommended and, if it names a next agent/task_type, create that task manually.`);
  db.close();
  process.exit(0);
}

suggest(`No routing rule matches ${task.agent} with next_action "${nextAction}". Route to Ember (task_type: route) for manual review rather than guessing.`);
db.close();
