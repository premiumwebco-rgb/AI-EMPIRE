# Launch — 30-Day Tracking Checklist — WillowGiftWorks (Etsy)

**Launch date: 2026-08-06.** This checklist drives the daily habit of
feeding Tally real data for the first 30 days, so there's enough history
for the first genuinely trustworthy Weekly and Monthly reports.

This is the day-by-day logging companion. For what the numbers *mean* once
they exist — decision triggers, what not to do, where to pull each stat —
see the existing `docs/launch-monitoring-checklist.md`, which still applies
and isn't replaced by this file.

---

## Week 1 (Days 1–7) — Establish baseline

No trend exists yet. The only job this week is logging consistently.

| Day | Date | Logged? | Notes |
|---|---|---|---|
| 1 | 2026-08-06 | ✅ (launch-day baseline already in the metrics file) | 0 sales confirmed; views/traffic not yet pulled |
| 2 | 2026-08-07 | ☐ | |
| 3 | 2026-08-08 | ☐ | |
| 4 | 2026-08-09 | ☐ | |
| 5 | 2026-08-10 | ☐ | |
| 6 | 2026-08-11 | ☐ | |
| 7 | 2026-08-12 | ☐ | **First Weekly Report due today** |

**End of week 1:** ask Tally for the first Weekly Report. With only one
week logged there's no prior week to compare against — expect the report to
say so plainly rather than inventing a trend. That's correct behavior, not
a bug.

## Week 2 (Days 8–14) — First real comparison

| Day | Date | Logged? | Notes |
|---|---|---|---|
| 8 | 2026-08-13 | ☐ | |
| 9 | 2026-08-14 | ☐ | |
| 10 | 2026-08-15 | ☐ | |
| 11 | 2026-08-16 | ☐ | |
| 12 | 2026-08-17 | ☐ | |
| 13 | 2026-08-18 | ☐ | |
| 14 | 2026-08-19 | ☐ | **Second Weekly Report due today** |

**End of week 2:** this is the first week Tally can compute a real
week-over-week % change. This is also the point the existing pricing-model
decision triggers (offsite ads, discount floor, one-change-at-a-time) start
to matter in practice — see `docs/launch-monitoring-checklist.md`.

## Week 3 (Days 15–21)

| Day | Date | Logged? | Notes |
|---|---|---|---|
| 15 | 2026-08-20 | ☐ | |
| 16 | 2026-08-21 | ☐ | |
| 17 | 2026-08-22 | ☐ | |
| 18 | 2026-08-23 | ☐ | |
| 19 | 2026-08-24 | ☐ | |
| 20 | 2026-08-25 | ☐ | |
| 21 | 2026-08-26 | ☐ | **Third Weekly Report due today** |

**End of week 3:** first point a 3-period trend line becomes possible
(per `kpi-and-alerts.md`'s Growth layer) — Tally can now say "up / flat /
down" with Tier 3 evidence instead of just reporting raw deltas.

## Week 4 + change (Days 22–30) — First Monthly Report

| Day | Date | Logged? | Notes |
|---|---|---|---|
| 22 | 2026-08-27 | ☐ | |
| 23 | 2026-08-28 | ☐ | |
| 24 | 2026-08-29 | ☐ | |
| 25 | 2026-08-30 | ☐ | |
| 26 | 2026-08-31 | ☐ | |
| 27 | 2026-09-01 | ☐ | |
| 28 | 2026-09-02 | ☐ | |
| 29 | 2026-09-03 | ☐ | |
| 30 | 2026-09-04 | ☐ | **First Monthly Report due today** |

---

## Milestones (log the moment they happen, don't wait for the daily check-in)

- ☐ **First view/click logged** — the day Etsy Stats first shows nonzero
  traffic. Log it immediately even if it's not your usual check-in time —
  this is the moment the Launch Report template can retire in favor of the
  normal Daily template's alert logic.
- ☐ **First sale.** Log the exact numbers that day, and add a `notes` entry
  naming which listing and, if visible in Stats, which search term or
  traffic source drove it. This single data point is disproportionately
  valuable — it's the first real signal about which design is working.
- ☐ **First favorite.**
- ☐ **First returning visitor / repeat customer**, if Etsy Stats surfaces
  it.
- ☐ **Any policy or listing change** (price, tags, photos, shipping) — note
  the date and what changed, even outside the daily log, so Tally can
  correlate it with whatever happens to the numbers afterward.

## After day 30

Switch fully to the normal cadence: daily logging via
`daily-analytics-workflow.md`, Weekly Reports every 7 days, Monthly Reports
every calendar month. This checklist's job is done — it exists only to
carry the business from zero data to a real trend line.
