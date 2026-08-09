# Report Templates

Part of the Analytics Agent (Tally) spec — see `README.md`. These are the only
three report shapes Tally produces (plus an ad-hoc variant for direct
questions, noted at the end). Fill in every section; write "No data" or
"Nothing notable this period" rather than deleting a section that has
nothing to report — an empty-looking report is still informative if it's
structurally complete.

`{{placeholders}}` are filled in per business/period. Nothing in this file
should ever be replaced with real content — only the generated report files
in `reports/analytics/` contain real numbers.

---

## Daily Report

Use for a single logged day. Lightest-weight template — this is a pulse
check, not a deep dive.

```markdown
# Daily Report — {{business_id}} — {{date}}

## Snapshot
| Metric | Today | Yesterday | Change |
|---|---|---|---|
| Revenue | {{}} | {{}} | {{}} |
| Orders | {{}} | {{}} | {{}} |
| Views | {{}} | {{}} | {{}} |
| Clicks | {{}} | {{}} | {{}} |
| Favorites | {{}} | {{}} | {{}} |
| Conversion rate | {{}} | {{}} | {{}} |

## Alerts
{{list any 🔴/🟡/🟢/🔵 alerts fired today, or "None today."}}

## Notable
{{one or two sentences, plain English — what actually happened today, if
anything. It is fine and expected for this to be "Nothing notable" on most
days.}}

## Carried-forward items
{{any unresolved alert or recommendation from a prior report that still
applies}}
```

---

## Weekly Report

Use for a 7-day period. This is the primary operating report — most
decisions should be made off this one, not the daily.

```markdown
# Weekly Report — {{business_id}} — week of {{start_date}} to {{end_date}}

## Snapshot
| Metric | This week | Last week | Change | Trend (3-wk) |
|---|---|---|---|---|
| Revenue | {{}} | {{}} | {{}} | {{up/flat/down}} |
| Orders | {{}} | {{}} | {{}} | {{up/flat/down}} |
| Conversion rate | {{}} | {{}} | {{}} | {{up/flat/down}} |
| Traffic / sessions | {{}} | {{}} | {{}} | {{up/flat/down}} |
| Average order value | {{}} | {{}} | {{}} | {{up/flat/down}} |
| Favorites-to-views | {{}} | {{}} | {{}} | {{up/flat/down}} |

## Alerts
{{full alert list per kpi-and-alerts.md, most severe first, or "None this
week."}}

## Top performers
{{top 3 products and/or top 3 search terms this week, with their numbers}}

## Bottom performers
{{bottom performers worth naming — only if there's a specific concern, not
just "the smallest number"}}

## Marketing performance
{{channel breakdown and efficiency (CPA/ROAS) if spend data exists;
otherwise "No marketing spend logged this period."}}

## Search-term performance
{{what's driving discovery this week — new terms, rising terms, or "No
search-term data logged this period."}}

## Recommendations
{{each formatted per decision-framework.md's recommendation format, ordered
most important first}}

## Data gaps
{{anything that would have made this report better if it had been logged —
be specific so the next week's logging can close the gap}}
```

---

## Monthly Report

Use for a calendar month or 28–31 day period. This is the strategic
check-in — it should read like something you'd hand to a business partner,
not like a stats dump.

```markdown
# Monthly Report — {{business_id}} — {{month}} {{year}}

## Executive summary
{{3–5 sentences, plain English: how did the business do this month, what
drove it, and what's the single most important thing to do next month}}

## Snapshot
| Metric | This month | Last month | Change | Trend (3-mo) |
|---|---|---|---|---|
| Revenue | {{}} | {{}} | {{}} | {{up/flat/down}} |
| Orders | {{}} | {{}} | {{}} | {{up/flat/down}} |
| Net margin | {{}} | {{}} | {{}} | {{up/flat/down}} |
| Conversion rate | {{}} | {{}} | {{}} | {{up/flat/down}} |
| Traffic / sessions | {{}} | {{}} | {{}} | {{up/flat/down}} |
| Average order value | {{}} | {{}} | {{}} | {{up/flat/down}} |

## Alerts raised this month
{{summarized, not a re-listing of every daily/weekly alert — group by root
cause}}

## Product performance
{{full ranked breakdown from products[] across the month; call out any
product that changed rank significantly from last month}}

## Marketing performance
{{month-level channel mix and efficiency; compare to prior month if data
exists}}

## Search-term performance
{{trends in buyer language across the month — new high performers, terms
that faded, gaps between current tags/keywords and what's actually
converting, if that context is available}}

## Growth assessment
{{is this business growing, flat, or shrinking on Tier 1 KPIs over the
trailing 3 months? State it plainly in one sentence, then support it.}}

## Recommendations
{{each formatted per decision-framework.md's recommendation format —
monthly recommendations should skew strategic (pricing, positioning,
resourcing) rather than tactical (this week's tag tweak)}}

## Data gaps
{{same as weekly — be specific}}
```

---

## Launch Report (new business, no sales yet)

Use this instead of the Daily template for the first report(s) after a
business goes live, for as long as `orders` is `0` across every logged
snapshot. Its job is different from a normal daily report: there's no
trend to detect yet, so it focuses on confirming setup is correct and
telling the founder exactly what's still unmeasured. Switch to the normal
Daily template the moment the first order lands.

```markdown
# Launch Report — {{business_id}} — {{date}}

## Status
{{business_name}} launched on {{launch_date}} on {{platform}}.
{{count}} listing(s)/product(s) live. {{days_since_launch}} day(s) since
launch. No sales yet — this is expected and not itself a signal at this
stage. See "When zero sales becomes a signal" below.

## Confirmed at launch
{{bullet list of what's been directly verified — e.g. listings published,
shipping/pricing correct, personalization working, policies in place —
pulled from the metrics file's launch snapshot notes}}

## Not yet measured
{{every KPI field that is null in every snapshot so far, listed plainly —
e.g. "Views, clicks, traffic, favorites, conversion rate, and search-term
performance have not been logged yet." This section exists so the founder
knows exactly what to start pulling from platform stats, not just that
"data is missing."}}

## What to log next
{{point to the business's daily logging workflow — e.g.
businesses/<business_id>/daily-analytics-workflow.md if one exists,
otherwise a reminder to log views/clicks/traffic/favorites at the next
available check-in}}

## When zero sales becomes a signal
Zero sales in the first few days is normal, especially with no ad spend and
new-shop search visibility still building. It becomes a 🟡 Watch-level
concern per `kpi-and-alerts.md`'s zero-activity trigger only once there are
{{zero_activity_critical_periods from thresholds}} consecutive periods of
zero orders *with traffic data present showing views/clicks are
happening* — that combination (traffic but no conversion) is the real
signal, not the absence of sales alone. Do not raise an alert on sales
alone while traffic is still unmeasured.
```

---

## Ad-hoc

For a direct question ("why did views spike on the 4th?", "which product is
actually most profitable?") that doesn't map to a full periodic report:

```markdown
# Ad-hoc — {{business_id}} — {{date}} — {{one-line question}}

## Answer
{{direct answer, plain English, leading with the conclusion}}

## Evidence
{{the specific numbers and evidence tier supporting the answer, or "Not
enough logged data to answer this yet" if that's the honest answer}}

## Related
{{anything else the data surfaced while answering this that's worth
flagging, or "Nothing else notable."}}
```

Save an ad-hoc report to `reports/analytics/<business_id>/` only if the
answer is worth keeping as a historical record; a quick clarifying question
can just be answered inline without a saved file.
