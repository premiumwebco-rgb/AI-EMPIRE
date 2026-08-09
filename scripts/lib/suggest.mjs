// Pure next-action routing logic (Phase 4). No DB access, no console
// output — takes an already-fetched task object, returns a structured
// suggestion. scripts/suggest-next-task.mjs (CLI) and
// castle-app/lib/suggest.js (web) both call this; the two files are kept
// in sync manually (same reason data/agent-adapters.json <->
// castle-app/lib/agent-adapters.json are — Vercel only deploys
// castle-app/, so a literal cross-directory import isn't possible in
// production). If this logic changes, update castle-app/lib/suggest.js
// too.
//
// Input shape (works whether it came from SQLite or Postgres, as long as
// the caller has already normalized JSON-string fields into real arrays):
//   { id, agent, task_type, status, report_next_action, report_outcome }
//
// Output shape:
//   { kind: string, text: string, command: string|null }
// kind is a machine-readable tag for callers that want to style the
// suggestion differently (e.g. a "blocked" tag vs a "route" tag); text
// and command are exactly what the CLI has always printed.

const STOP_NEXT_ACTIONS = ["hold", "reject", "revise", "hold_pending_publish"];

// Routing table generalized from docs/agent-feedback-loop.md §5/§8, keyed
// by agent + next_action rather than a fixed 5-stage POD pipeline.
const ROUTES = {
  "Scout|proceed_to_design":     { agent: "Design",    type: "design_concept",   why: "Research found a viable opportunity — hand off for concept generation." },
  "Design|proceed_to_listing":   { agent: "Listing",   type: "listing_create",   why: "Design passed QA — hand off for listing copy and pricing." },
  "Listing|proceed_to_marketing":{ agent: "Marketing", type: "marketing_strategy", why: "Listing copy/pricing is drafted — hand off for marketing strategy. Marketing must independently verify this listing is actually live (published: true) before starting real strategy; proceed_to_marketing does not itself guarantee that." },
  "Marketing|begin_tracking":    { agent: "Tally",     type: "analyze_performance", why: "Marketing launch is confirmed — begin/continue tracking performance." },
  "Printify|fulfillment_setup":  { agent: "Listing",   type: "listing_create",   why: "Fulfillment is confirmed ready — safe to proceed with listing." }
};

export function suggestNextAction(task) {
  if (task.status === "waiting") {
    return {
      kind: "waiting",
      text: `This task is blocked on a dependency that stopped. Review the blocking task's report_next_action and report_risks/report_blockers, then either fix the upstream issue and re-run scripts/claim-task.mjs ${task.id}, or escalate to Ember (task_type: route) for a founder decision.`,
      command: null
    };
  }

  if (task.status === "failed") {
    return {
      kind: "failed",
      text: `Task failed. Do not retry automatically. Escalate to Ember: create a "route" task summarizing the failure (report_risks/report_blockers) for founder review. If this is the second consecutive failure at this stage for the same objective, stop entirely — do not attempt a third time.`,
      command: `node scripts/create-task.mjs <new-id> Ember "Review failure of ${task.id}" --type=route --depends=${task.id}`
    };
  }

  if (task.status !== "completed") {
    return {
      kind: "not_yet",
      text: `Task is '${task.status}' — no suggestion until it completes, fails, or is blocked.`,
      command: null
    };
  }

  const nextAction = (task.report_next_action || "").trim();

  if (STOP_NEXT_ACTIONS.includes(nextAction)) {
    return {
      kind: "stop_signal",
      text: `This task completed with a stop signal (next_action: "${nextAction}"). Nothing should build on it. Review report_reasoning/report_risks and, if a fix is needed, address it at this same stage before re-attempting.`,
      command: null
    };
  }

  const routeKey = `${task.agent}|${nextAction}`;
  if (ROUTES[routeKey]) {
    const r = ROUTES[routeKey];
    return {
      kind: "route",
      text: r.why,
      command: `node scripts/create-task.mjs <new-id> ${r.agent} "<command>" --type=${r.type} --depends=${task.id}`
    };
  }

  // Tally verdicts drive the growth/repair loop (§5-§7).
  if (task.agent === "Tally") {
    const outcome = (task.report_outcome || "").toLowerCase();
    if (outcome.includes("winner")) {
      return {
        kind: "tally_winner",
        text: `Tally reported a winner verdict. Open a winner_expansion research brief for a variation batch (new collection_id, source_collection_id pointing back to this one).`,
        command: `node scripts/create-task.mjs <new-id> Scout "winner_expansion brief based on ${task.id}" --type=research_opportunity --depends=${task.id}`
      };
    }
    if (outcome.includes("underperform") || outcome.includes("failing")) {
      return {
        kind: "tally_underperforming",
        text: `Tally reported underperforming/failing. Per docs/agent-feedback-loop.md §5, route back to whichever stage owns the likely_cause named in the report (creative -> Design, copy_seo/pricing -> Listing, demand_channel -> Marketing) — do not restart from Research. Read report_reasoning to find the stated likely_cause before creating the task.`,
        command: null
      };
    }
    if (outcome.includes("insufficient")) {
      return { kind: "tally_insufficient", text: `Insufficient data — no action. Keep logging metrics until evidence reaches Tier 3+.`, command: null };
    }
    return {
      kind: "tally_unclear",
      text: `Tally completed but the outcome text doesn't match a known verdict pattern (winner/underperforming/failing/insufficient_data). Route to Ember (task_type: route) for manual review.`,
      command: null
    };
  }

  if (task.agent === "Ember") {
    return {
      kind: "ember",
      text: `Ember task completed. No automatic downstream action — review report_reasoning for what Ember recommended and, if it names a next agent/task_type, create that task manually.`,
      command: null
    };
  }

  return {
    kind: "no_rule",
    text: `No routing rule matches ${task.agent} with next_action "${nextAction}". Route to Ember (task_type: route) for manual review rather than guessing.`,
    command: null
  };
}
