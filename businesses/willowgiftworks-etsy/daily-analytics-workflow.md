# Daily Analytics Workflow — WillowGiftWorks (Etsy)

What to do each day (or whenever you check in — daily is ideal, not
mandatory) to feed the Analytics Agent (Tally) real data. Takes under two
minutes once you've done it a few times.

This is specific to this business. The reusable version of Tally itself
lives in `agents/analyticsdir/`; this file just tells you where to click and
what to copy for **this** shop.

---

## Step 1 — Open Etsy Stats

Etsy Shop Manager → **Stats**. Set the date range to "Today" (or "Yesterday"
if you're logging in the morning for the prior day — pick one and be
consistent, and note which in the entry).

## Step 2 — Read off these numbers

| What you need | Where in Etsy Stats | Maps to schema field |
|---|---|---|
| Visits | Stats overview | `sessions_or_visits` |
| Views | Stats overview | `views` |
| Orders | Stats overview | `orders` |
| Revenue | Stats overview | `revenue` |
| Conversion rate | Stats overview (Etsy computes it) | `conversion_rate` |
| Favorites | Shop Manager → Listings — sum the heart-count across the 5 active listings | `favorites` |

## Step 3 — Weekly only (not required daily)

These move slowly enough that once a week is enough:

| What you need | Where | Maps to schema field |
|---|---|---|
| Traffic sources | Stats → Traffic → "Where buyers found you" | `marketing_channel_breakdown` |
| Search terms | Stats → Traffic → search terms that led to a visit | `top_search_terms[]` |
| Offsite Ads status | Shop Manager → Settings → Offsite Ads — confirm still opted out | note it in `notes` if it changed |
| Etsy Ads spend (if ever turned on) | Marketing → Etsy Ads | `marketing_spend` |

## Step 4 — Log it

Two ways to do this — use whichever is faster for you:

**A. Tell Claude.** Open a Claude Code session in this project and say
something like: *"Log today's WillowGiftWorks numbers: 42 visits, 61 views,
1 order, $25.99 revenue, 3 favorites."* Claude appends a new snapshot to
`data/metrics/willowgiftworks-etsy.json` in the correct format. This is the
recommended path — it's fast and you can't get the JSON syntax wrong.

**B. Edit the file yourself.** Open `data/metrics/willowgiftworks-etsy.json`
and add a new object to the `snapshots` array, copying the shape of the most
recent entry. Use `null` for anything you didn't check that day — never
enter `0` unless you actually confirmed the number is zero (an unmeasured
number and a confirmed zero are different facts; see
`data/metrics/README.md`).

## Step 5 — Note anything unusual

If anything happened that could explain a number — a price change, a
listing edit, a sale/promo, an Etsy outage, a slow personalization
turnaround — add one sentence to that snapshot's `notes` field. This is the
single most useful thing you can do to make later reports accurate; an
unexplained spike or dip is much less useful to Tally than an explained one.

---

## When to ask for a report

- **Any day:** ask a direct question — *"How's WillowGiftWorks doing?"* —
  and Tally answers ad-hoc from whatever's logged so far.
- **After 7 days logged:** ask for the first real Weekly Report.
- **After ~30 days:** ask for the first Monthly Report.
- **Before then, if there are still zero sales:** Tally uses the Launch
  Report format instead (see `agents/analyticsdir/report-templates.md`) —
  it won't try to compute a fake trend from launch-day zeros.

## What NOT to do

- Don't log a `0` for anything you haven't actually checked. Leave it
  `null`.
- Don't skip logging just because "nothing happened" — a day of zero
  activity is still a real data point once traffic numbers exist; it's
  only meaningless before you've ever pulled Stats.
- Don't ask for a Weekly/Monthly report before there's a real week/month of
  data — Tally will say so if asked too early, per
  `agents/analyticsdir/decision-framework.md`, but it saves a step to just
  wait.
