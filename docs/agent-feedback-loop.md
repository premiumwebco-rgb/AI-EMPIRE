# AGENT FEEDBACK LOOP — OPERATING SYSTEM

**What this is:** the workflow and data contracts that connect every agent
into one cycle, so a result at the end (Analytics) changes what happens at
the beginning (Research) — instead of six agents that each run once and stop.

**What this is not:** automation. Nothing in this document runs on a
schedule or moves data by itself. Every handoff below is triggered by a
person (or a Claude Code session acting on their behalf) invoking the next
agent. The document defines the *logical* trigger condition for each
handoff so that when scheduling is eventually built (see
`docs/system-upgrade-plan.md`, Phase 5), it has an exact spec to automate
against — not so it can be automated today.

This extends, rather than replaces, two things that already exist:
- `prompts/master-agent-prompt.md` (Ember) — its existing STEP 1–5 workflow
  *is* stages 1–5 below. This document adds the data contracts between
  those steps and a STEP 6 that closes the loop.
- `agents/analyticsdir/` (Tally) — its KPI tiers, alert levels, evidence
  tiers, and recommendation format are reused here unchanged, not
  reinvented. This document adds one new thing on top: a **verdict**
  classification that turns a report into a routing decision.

---

## 1. Pipeline overview

```
                 ┌────────────────────────────────────────────────────┐
                 │                                                    │
                 ▼                                                    │
   ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐
   │ RESEARCH │──▶│  DESIGN  │──▶│ LISTING  │──▶│MARKETING │──▶│ANALYTICS │
   │  Scout   │   │  Quill   │   │  Maple   │   │  Hazel   │   │  Tally   │
   └──────────┘   └──────────┘   └──────────┘   └──────────┘   └────┬─────┘
                                                                     │
                                                                     ▼
                                                              ┌──────────┐
                                                              │  MASTER  │
                                                              │  Ember   │
                                                              └────┬─────┘
                                                                   │
                        ┌──────────────────────┬───────────────────┤
                        ▼                      ▼                   ▼
                    WINNER               UNDERPERFORMING         FAILING
              → new Research brief    → re-enter at the       → retire,
                (variation loop,      agent that owns the      log decision,
                 §6)                   likely cause (§7)        no further loop
```

Five agents already map to five folders + codenames established in
`docs/system-upgrade-plan.md`. Nothing here renames or moves them:

| Stage | Agent | Codename | Folder | Spec status |
|---|---|---|---|---|
| 1 | Research | Scout | `agents/research/` | ✅ exists |
| 2 | Design | Quill | `agents/pod-design/` | ⚠️ empty — not yet backfilled |
| 3 | Listing | Maple | `agents/etsy-listing/` | ⚠️ empty — not yet backfilled |
| 4 | Marketing | Hazel | `agents/ads/` | ⚠️ empty — not yet backfilled |
| 5 | Analytics | Tally | `agents/analyticsdir/` | ✅ exists |
| 6 | Master | Ember | `prompts/master-agent-prompt.md` | ✅ exists |

The data contracts below work regardless of whether an agent's own prompt
spec has been written yet — a contract defines what goes *in* and *out*,
independent of the implementation. Three agents still need their
`README.md` written (see `docs/system-upgrade-plan.md` Phase 4); that's
tracked as a known gap, not blocking this document.

---

## 2. Shared concepts

### `collection_id`

Every unit of work moving through the pipeline — a product, a small batch
of products, a service offering — gets a short stable slug the first time
Research starts work on it, e.g. `2026-halloween-totes`,
`focusflow-onboarding-flow`. It never changes for that unit of work, even
across multiple loop iterations. A **variation** spawned from a winner gets
its own new `collection_id` and references the original via
`source_collection_id` (§6) — it is not the same collection.

### `data/pipeline/<collection_id>/`

Where every stage writes its handoff artifact. One folder per collection,
one file per stage, plus a running decision log:

```
data/pipeline/<collection_id>/
├── 01-research.json
├── 02-design.json
├── 03-listing.json
├── 04-marketing.json
├── 05-analytics-feedback.json
└── decisions.md
```

Numbered filenames make the pipeline's progress readable at a glance from
the file listing alone — `ls data/pipeline/<collection_id>/` tells you
which stage a collection has reached. See `data/pipeline/README.md` for the
full schema of each file and a filled generic example.

Once a collection reaches stage 4 (Marketing) and goes live, its ongoing
performance is tracked the normal way: `data/metrics/<business_id>.json`,
per `agents/analyticsdir/README.md`. Stage 5 below is the bridge between
that ongoing tracking and this pipeline — Tally does not maintain two
separate data stores for the same numbers.

### `decisions.md`

Append-only, human-readable log of every loop-back decision made for this
collection: what verdict was reached, what was decided, why, and by whom
(Ember acting alone in solo mode, or the founder overriding Ember). This is
scoped to one collection. A future global decision log
(`data/state/decisions.json`, planned in `docs/system-upgrade-plan.md`
Phase 1.4 but not yet built) can later aggregate across collections; this
file doesn't wait on that.

---

## 3. Stage-by-stage contracts

Each stage: what triggers it, what it consumes, what it produces, where the
output lives, and what triggers the handoff onward.

### Stage 1 — Research (Scout)

- **Triggered by:** Ember, on one of: a founder request for a new
  opportunity; a `winner_expansion` brief from §6; a scheduled
  `research_cycle` (future, per system-upgrade-plan U3 — not active today).
- **Consumes:** a goal statement (niche to explore, or the source
  collection to expand on).
- **Produces:** `01-research.json`, matching the OUTPUT FORMAT already
  defined in `agents/research/README.md` field-for-field:

```json
{
  "collection_id": "",
  "stage": "research",
  "date": "",
  "trigger_reason": "new_opportunity | winner_expansion | seasonal | competitive_gap",
  "source_collection_id": null,
  "niche": "",
  "target_customer": "",
  "why_this_niche": "",
  "product_ideas": [""],
  "keywords": [""],
  "competition_level": "",
  "marketing_angles": [""],
  "next_action": "proceed_to_design | hold | reject"
}
```

- **Hands off when:** `next_action` is set to `proceed_to_design`. This is
  a human/Ember judgment call today, not an automatic pass — Research
  finding something doesn't mean it's automatically worth building.

### Stage 2 — Design (Quill)

- **Triggered by:** `01-research.json` present with
  `next_action: proceed_to_design`.
- **Consumes:** `01-research.json` (niche, product ideas, target customer).
- **Produces:** `02-design.json`:

```json
{
  "collection_id": "",
  "stage": "design",
  "date": "",
  "based_on": "01-research.json",
  "concepts": [
    { "concept_id": "", "name": "", "description": "" }
  ],
  "chosen_concepts": [""],
  "design_files": [""],
  "qa_status": "pending | passed | failed",
  "qa_notes": "",
  "next_action": "proceed_to_listing | revise | reject"
}
```

- **QA gate (required, not optional):** every design must pass the
  render-verified check before `qa_status` can be `passed` — headless
  render + measured safe-zone check against the actual print area, not an
  estimate. This method already caught six real defects across two
  collections before this document existed; it is promoted here to a
  required stage rather than an informal habit. A design with
  `qa_status: failed` cannot proceed to Listing.
- **Hands off when:** `qa_status: passed` and `next_action:
  proceed_to_listing`.

### Stage 3 — Listing (Maple)

- **Triggered by:** `02-design.json` present with `qa_status: passed` and
  `next_action: proceed_to_listing`.
- **Consumes:** `02-design.json` (chosen concepts, design files).
- **Produces:** `03-listing.json`:

```json
{
  "collection_id": "",
  "stage": "listing",
  "date": "",
  "based_on": "02-design.json",
  "listings": [
    { "product_ref": "", "title": "", "tags": [""], "price": null }
  ],
  "pricing_model_ref": "",
  "published": false,
  "listing_ids": [""],
  "next_action": "proceed_to_marketing | hold_pending_publish"
}
```

- **Hands off when:** `published: true` and `listing_ids[]` is populated
  with real platform IDs (confirmed live, not just drafted).

### Stage 4 — Marketing (Hazel)

- **Triggered by:** `03-listing.json` present with `published: true`.
- **Consumes:** `03-listing.json` (live listing IDs, pricing).
- **Produces:** `04-marketing.json`:

```json
{
  "collection_id": "",
  "stage": "marketing",
  "date": "",
  "based_on": "03-listing.json",
  "strategy": "organic_only | paid_test | offsite_ads_opt_in",
  "ad_concepts": [""],
  "test_budget": null,
  "channels": [""],
  "launch_confirmed_date": "",
  "next_action": "begin_tracking"
}
```

- **Hands off when:** `next_action: begin_tracking` — this is the exact
  moment a `business_id` entry should exist (or be created) in
  `data/metrics/`, per `agents/analyticsdir/README.md`. Stage 5 does not
  start a new tracking system; it's the continuation of the same metrics
  file this triggers.

### Stage 5 — Analytics (Tally)

- **Triggered by:** the normal Analytics Agent cadence
  (`businesses/<business_id>/daily-analytics-workflow.md` if one exists,
  or an ad-hoc request) — same trigger as always. Nothing changes about
  how Tally operates day to day.
- **Consumes:** `data/metrics/<business_id>.json` (as always) plus, for
  pipeline-tracked collections specifically, `04-marketing.json` for
  context on what was tried.
- **Produces two things:**
  1. The normal report in `reports/analytics/`, unchanged from
     `agents/analyticsdir/report-templates.md`.
  2. **New:** when — and only when — evidence reaches Tier 3 or higher
     (per `decision-framework.md`'s evidence tiers) for a pipeline-tracked
     collection, also write `05-analytics-feedback.json`:

```json
{
  "collection_id": "",
  "stage": "analytics-feedback",
  "date": "",
  "evidence_tier": 3,
  "verdict": "winner | underperforming | failing | insufficient_data",
  "verdict_basis": "",
  "likely_cause": "creative | copy_seo | pricing | demand_channel | too_early | unclear",
  "recommendation": {
    "text": "",
    "based_on": "",
    "reversibility": "easy | moderate | hard",
    "recheck_at": ""
  }
}
```

  See §5 for exactly how `verdict` and `likely_cause` are determined — both
  are derived mechanically from frameworks that already exist, not judged
  freshly each time.

- **Hands off when:** `verdict` is anything other than
  `insufficient_data`. An `insufficient_data` verdict is a valid, common
  output — it means "keep logging, nothing to route yet," and Ember takes
  no action on it.

### Stage 6 — Master (Ember)

- **Triggered by:** `05-analytics-feedback.json` present with a verdict.
- **Consumes:** the feedback file plus the full pipeline history in
  `data/pipeline/<collection_id>/`.
- **Produces:** an entry in `decisions.md` recording what was decided, and
  — depending on verdict — a new trigger into one of the earlier stages
  (§6, §7) or a retirement decision.
- **This is the loop-closing step.** Full routing logic in §5–§7 below.

---

## 4. How Tally sends recommendations back to Ember

Two channels, both already-defined formats — nothing new invented for the
handoff itself:

1. **Every normal report** (`reports/analytics/`) already contains a
   `Recommendations` section using the format defined in
   `agents/analyticsdir/decision-framework.md`. Ember (or the founder
   reading as Ember) can act on any of these at any time, for any business
   — this channel isn't limited to pipeline-tracked collections and isn't
   new.
2. **`05-analytics-feedback.json`** (new, §3 Stage 5) is the
   pipeline-specific channel: a structured, machine-readable verdict that
   exists *specifically* to trigger a routing decision, only fires at
   Tier 3+ evidence, and is scoped to one `collection_id`. This is what
   turns "here's a report" into "here's a decision to make."

Ember's job on receiving a feedback file is entirely mechanical dispatch,
not fresh analysis — the harder analytical work already happened in Tally.
Ember reads `verdict`, looks it up in §5's routing table, and acts.

---

## 5. Verdict → routing table

Reuses `agents/analyticsdir/kpi-and-alerts.md`'s alert levels and
`decision-framework.md`'s evidence tiers directly — no new thresholds are
defined here.

| Verdict | Basis (existing framework) | Ember's action |
|---|---|---|
| `winner` | 🟢 Positive alert sustained 3+ periods, or 2x+ outperformance vs. collection average, at evidence Tier 4 | Open a `winner_expansion` Research brief (§6) |
| `underperforming` | 🟡 Watch alert, or below-average performance with a specific identifiable cause, at evidence Tier 3+ | Route back to the specific stage per `likely_cause` (§7) |
| `failing` | 🔴 Critical alert (revenue/conversion collapse, or sustained zero activity with traffic present) | If this is the **first** failing verdict for this collection → route to §7 like underperforming. If it's failing again **after** an improvement attempt already logged in `decisions.md` → retire (§7, "second failure") |
| `insufficient_data` | Evidence Tier 1–2 | No action. Keep logging. |

`likely_cause` (set by Tally, informed by which KPIs moved together — see
`kpi-and-alerts.md`'s "never fire more than one alert for the same
underlying cause" rule, applied here to root-causing instead of alerting):

| `likely_cause` | Signal pattern | Routes to |
|---|---|---|
| `creative` | Low favorites-to-views ratio; views present but low engagement | Stage 2 — Design |
| `copy_seo` | Low views relative to comparable listings, or search-term data shows low impression share | Stage 3 — Listing |
| `pricing` | High views/clicks, low conversion, no other explanation in `notes` | Stage 3 — Listing (price is part of that agent's scope) |
| `demand_channel` | Traffic concentrated in one channel and that channel is weak, or overall traffic too low across all channels | Stage 4 — Marketing |
| `too_early` | Any pattern where the underlying `notes` field explains it as external (platform issue, holiday, logged too few periods) | No stage — treat as `insufficient_data` instead, re-tier |
| `unclear` | Pattern doesn't cleanly match the above | Ember reviews manually before routing; do not guess |

---

## 6. Winning products → variations (the growth loop)

1. Tally writes `verdict: winner` with supporting evidence.
2. Ember opens a **new** `collection_id` for the variation batch and
   starts a fresh Stage 1 (Research) with:
   - `trigger_reason: winner_expansion`
   - `source_collection_id`: the original winner's ID
   - The research brief carries forward what specifically worked: the
     winning search terms from `top_search_terms[]`, the price point, and
     the design attributes named in the winner's `02-design.json` —
     Research's job here is narrower than a cold-start ("find more like
     this," not "find something new").
3. The new collection runs the full pipeline (§1) like any other — a
   variation is not fast-tracked or exempted from the Design QA gate or
   the Listing publish step. Being related to a winner reduces research
   risk; it doesn't reduce execution risk.
4. Ember logs the decision in the **original** winner's `decisions.md`
   (linking forward to the new `collection_id`) and starts a new
   `decisions.md` for the variation batch.
5. The variation batch is tracked independently from stage 5 onward —
   its own `verdict`, not inherited from the original. A variation can
   fail even when the original that inspired it is still winning.

## 7. Failing/underperforming products → improvement (the repair loop)

1. Tally writes `verdict: underperforming` or a first-time `failing`, with
   a `likely_cause`.
2. Ember re-enters the pipeline **at the stage that owns the cause**, per
   §5's table — not from Stage 1. The whole point of root-causing is to
   avoid re-doing work that wasn't the problem.
3. That stage produces a **new version** of its artifact
   (`02-design.json` → revise in place with a version note, or write
   `02-design-v2.json` if keeping both for comparison is useful) —
   subsequent stages that weren't the cause are re-run only as needed to
   propagate the fix (e.g. a listing copy fix doesn't require re-doing
   Design).
4. Ember logs the decision in `decisions.md`: what was diagnosed, what
   changed, and the re-check date.
5. Tracking continues on the same `data/metrics/<business_id>.json` —
   improvement is measured against the same history, not a fresh start,
   so the "before" is preserved for comparison.
6. **If it's still `failing` after one full improvement cycle** (verdict
   recomputed after the `recheck_at` date from the original
   recommendation): retire. Log the final decision and the reason in
   `decisions.md`. Do not attempt a second improvement cycle without an
   explicit, new reason — this is the same "test before scaling, don't
   throw good money after bad" rule already in
   `prompts/master-agent-prompt.md`'s Decision Rules, applied to sunk
   design/listing effort instead of ad spend.

---

## 8. Trigger reference (all stages, one table)

| From → To | Trigger condition | Automatic today? |
|---|---|---|
| (start) → Research | Founder/Ember opens a new goal, or §6 winner_expansion | No — manual invocation |
| Research → Design | `01-research.json.next_action == proceed_to_design` | No |
| Design → Listing | `02-design.json.qa_status == passed` and `next_action == proceed_to_listing` | No |
| Listing → Marketing | `03-listing.json.published == true` | No |
| Marketing → Analytics | `04-marketing.json.next_action == begin_tracking` | No — but this *is* the existing Tally trigger, unchanged |
| Analytics → Master | `05-analytics-feedback.json` written with `verdict != insufficient_data` | No |
| Master → Research (§6) | `verdict == winner` | No |
| Master → Design/Listing/Marketing (§7) | `verdict == underperforming`, or first `failing` | No |
| Master → retire (§7) | Second consecutive `failing` verdict after an improvement cycle | No |

Every row in this table is a candidate for automation later
(`docs/system-upgrade-plan.md` U3/U7 — named job cycles, scheduling). None
of them are wired to anything today. The value of writing this table now,
manual as it is, is that it's the exact spec that automation would need —
nothing about the trigger logic has to be re-derived later.

---

## 9. What's still missing

- `agents/pod-design/README.md`, `agents/etsy-listing/README.md`,
  `agents/ads/README.md` — three agent specs referenced by this document
  don't exist yet. The data contracts here don't require them to exist to
  be useful (a contract is agent-independent), but a person manually
  playing the role of Design/Listing/Marketing needs *some* spec to work
  from. Backfill these per `docs/system-upgrade-plan.md` Phase 4 when
  next building a collection.
- No existing collection (including the currently-live one) has pipeline
  artifacts under `data/pipeline/` — that collection was built before this
  system existed, in ad hoc conversation, not through these file
  contracts. Reconstructing its `01-research.json` etc. after the fact
  would mean inventing data that was never actually captured in this
  structured form, which this project's own conventions (see
  `data/metrics/README.md`'s null-vs-invented-zero rule) explicitly
  reject. **Start the next new collection through this pipeline from
  Stage 1** rather than retrofitting the current one.
- The verdict/routing logic in §5–§7 has never been exercised against
  real data — there isn't a Tier 3+ evidence pipeline-tracked verdict yet
  for any collection. Treat the specific thresholds as a first draft to
  be sanity-checked once one actually fires.
