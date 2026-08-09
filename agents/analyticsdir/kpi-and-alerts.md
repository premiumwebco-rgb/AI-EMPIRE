# KPI Framework & Alert Framework

Part of the Analytics Agent (Tally) spec — see `README.md` for how this fits
into the overall workflow. Generic across any business type; nothing here
names a specific business, product, or platform.

---

## KPI Framework

KPIs are organized into three tiers by how directly they connect to money.
Report on all three tiers every time, but weight the narrative toward Tier 1.

### Tier 1 — North Star

The numbers that answer "is this business making money and growing."

| KPI | Definition | Notes |
|---|---|---|
| **Revenue** | Total sales value for the period | The single most important number in every report |
| **Orders** | Count of completed transactions | Revenue ÷ Orders gives Average Order Value |
| **Net margin** | Revenue minus known costs | Only if cost data exists in the metrics file or linked pricing docs; otherwise omit and say why |

### Tier 2 — Health

The numbers that explain *why* Tier 1 is moving.

| KPI | Definition | Notes |
|---|---|---|
| **Conversion rate** | Orders ÷ Sessions/Visits | Computed if not supplied directly |
| **Traffic / sessions** | `sessions_or_visits` field | Split by channel if `marketing_channel_breakdown` is present |
| **Average order value (AOV)** | Revenue ÷ Orders | Rising AOV with flat traffic is a distinct, valuable signal |
| **Favorites / saves rate** | Favorites ÷ Views | Interest-without-purchase signal; skip for business types where it doesn't apply (e.g. SaaS) |

### Tier 3 — Diagnostic

The numbers that explain *where* to intervene.

| KPI | Definition | Notes |
|---|---|---|
| **Views** | Raw impressions/page views | Top of funnel |
| **Clicks** | Click-throughs from search/listing/ad | Views → Clicks is CTR |
| **Click-through rate (CTR)** | Clicks ÷ Views | |
| **Product-level performance** | Per-item breakdown from `products[]` | Ranks winners and losers within the same period |
| **Search-term performance** | From `top_search_terms[]` | Highest-value diagnostic field — reveals both what's working and buyer language you didn't anticipate |
| **Marketing efficiency** | Spend ÷ Orders attributable to marketing (CPA); Revenue ÷ Spend (ROAS) | Only if `marketing_spend` is populated |

### Growth layer (applies across all tiers)

- **Period-over-period % change** for every Tier 1 and Tier 2 KPI: current
  period vs. the immediately preceding period of equal length.
- **Trend direction**: compare the last 3 available periods of the same
  `period_type`. Classify as `up`, `flat` (within ±5%), or `down`. Never
  call a single period a trend — see the decision framework.

---

## Alert Framework

Alerts are computed automatically from the KPI tiers above and placed at the
top of every report, most severe first. Thresholds below are **defaults**,
expressed as relative change so they work regardless of business size. A
business's `thresholds` block in its metrics file overrides any of these
per-business.

| Level | Meaning | Default trigger |
|---|---|---|
| 🔴 **Critical** | Something is actively going wrong; likely needs a decision now | Revenue drops ≥30% period-over-period, OR conversion rate drops ≥40% period-over-period, OR a previously active product/listing shows zero orders *and* zero views for 3+ consecutive logged periods |
| 🟡 **Watch** | Not an emergency, but worth a human's attention this week | Favorites-to-views ratio declining for 2+ consecutive periods, OR traffic increasingly concentrated in a single channel (>80% of sessions from one source where a breakdown exists), OR conversion rate below its own trailing 3-period average by >15% |
| 🟢 **Positive** | A real opportunity, not just "things are fine" | A product or search term outperforms the period's average by 2x+, OR a KPI shows 3 consecutive up periods |
| 🔵 **Info** | Notable but not actionable on its own | New data point logged with a `notes` entry describing an external event (price change, policy change, platform change) |

### Rules for firing alerts

- An alert requires the comparison data to actually exist. If there's no
  prior period to compare against, do not fire a change-based alert — note
  "baseline period, no comparison yet" instead.
- Never fire more than one alert for the same underlying cause. If revenue
  and orders both crashed together, that's one 🔴 alert about revenue, not
  two.
- Every alert must name the specific KPI and the specific number that
  triggered it. "Revenue is down" is not an alert; "Revenue down 34%
  week-over-week ($412 → $272)" is.
- Zero-activity thresholds only apply to a product/listing that had prior
  activity. A brand-new listing with no orders yet is not an alert — it's
  expected.
