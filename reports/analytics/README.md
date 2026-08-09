# Analytics Reports — Output Convention

This folder holds the reports the **Analytics Agent (Tally)** generates. Tally
writes here; nothing else should.

## File naming

```
reports/analytics/<business_id>/<YYYY-MM-DD>-<period>.md
```

Examples:

```
reports/analytics/example-business/2026-08-06-daily.md
reports/analytics/example-business/2026-08-10-weekly.md
reports/analytics/example-business/2026-09-01-monthly.md
```

`business_id` matches the corresponding file in `data/metrics/`. `period` is one
of `daily`, `weekly`, `monthly`, or `adhoc` for one-off requested analysis
(e.g. "why did views spike on the 4th?").

Each report is a standalone file — reports are never overwritten or edited after
the fact. If a number needs correcting, a new report is written and the
correction is noted in it. This keeps the folder a reliable historical record.

## What goes in a report

Every report follows one of the templates in
`agents/analyticsdir/report-templates.md`. Do not hand-write reports in a
different format — consistency here is what makes month-over-month comparison
possible later without re-reading everything.

## Nothing here yet

This folder is empty until a business unit has at least one logged snapshot in
`data/metrics/` and a report is actually requested. Empty is expected — Tally is
not scheduled to run automatically yet (see the roadmap in
`agents/analyticsdir/README.md`).
