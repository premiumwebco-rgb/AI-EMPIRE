# Pipeline Data — Storage Convention

This folder holds the handoff artifacts that connect Research → Design →
Listing → Marketing → Analytics → Master into one loop. See
`docs/agent-feedback-loop.md` for the full workflow this data supports —
this file is just the schema reference, matching how `data/metrics/README.md`
relates to `agents/analyticsdir/README.md`.

Plain JSON. No database. Each agent writes its own stage's file and never
edits another stage's file after the fact — if a stage needs redoing (per
the repair loop in `docs/agent-feedback-loop.md` §7), write a new version
(`02-design-v2.json`) rather than overwriting the original, so the history
of what was tried stays intact.

---

## File naming

```
data/pipeline/<collection_id>/01-research.json
data/pipeline/<collection_id>/02-design.json
data/pipeline/<collection_id>/03-listing.json
data/pipeline/<collection_id>/04-marketing.json
data/pipeline/<collection_id>/05-analytics-feedback.json
data/pipeline/<collection_id>/decisions.md
```

`collection_id` is a short, stable slug chosen the first time Research
starts on it — e.g. `2026-fallgifts-mugs`, `focusflow-onboarding`. A
variation spawned from a winner (see feedback-loop doc §6) gets its own new
`collection_id`; it is a new folder, not a new file inside the original.

## Schemas

### `01-research.json`

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

### `02-design.json`

```json
{
  "collection_id": "",
  "stage": "design",
  "date": "",
  "based_on": "01-research.json",
  "concepts": [{ "concept_id": "", "name": "", "description": "" }],
  "chosen_concepts": [""],
  "design_files": [""],
  "qa_status": "pending | passed | failed",
  "qa_notes": "",
  "next_action": "proceed_to_listing | revise | reject"
}
```

`qa_status` may only be `passed` after a render-verified safe-zone check
against the real print area — see `docs/agent-feedback-loop.md` §3, Stage 2.

### `03-listing.json`

```json
{
  "collection_id": "",
  "stage": "listing",
  "date": "",
  "based_on": "02-design.json",
  "listings": [{ "product_ref": "", "title": "", "tags": [""], "price": null }],
  "pricing_model_ref": "",
  "published": false,
  "listing_ids": [""],
  "next_action": "proceed_to_marketing | hold_pending_publish"
}
```

### `04-marketing.json`

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

`next_action: begin_tracking` is the signal that a `business_id` entry
should exist in `data/metrics/` — this stage hands off directly into the
Analytics Agent's normal, already-documented tracking, not a separate one.

### `05-analytics-feedback.json`

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

Only written by Tally when evidence reaches Tier 3+
(`agents/analyticsdir/decision-framework.md`). Absence of this file for a
collection simply means nothing conclusive has happened yet — that's the
normal state for most of a collection's early life.

### `decisions.md`

Free-form markdown, append-only. One entry per loop-back decision:

```markdown
## 2026-08-07 — winner_expansion opened

Verdict: winner (Tier 4, 3 consecutive weeks 2x+ collection average).
Decision: opened new collection `<new-collection-id>` via winner_expansion.
Carried forward: [specific search terms / price point / design attributes].
```

---

## Example

See `_example-collection/` in this folder for a fully generic, filled set
of all five stage files plus a `decisions.md`, showing one full pass
through the pipeline including a winner-expansion loop-back. Not tied to
any real business — safe to copy as a starting point.
