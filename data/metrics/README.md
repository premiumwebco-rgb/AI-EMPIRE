# Metrics Data — Storage Convention

This folder holds the raw performance numbers that the **Analytics Agent (Tally)** reads.
One file per business unit. Plain JSON — readable, diffable, no database required.

Tally never writes here. This folder is filled by whoever (or whatever agent) has the
numbers: the founder pasting in Etsy Stats, a specialist agent logging results after a
job, or — later — an automated pull. Tally only reads it and produces reports.

---

## File naming

```
data/metrics/<business_id>.json
```

`business_id` is a short, stable slug you choose once per business unit and never
reuse for anything else — e.g. `willowgiftworks-etsy`, `acme-shopify`,
`focusflow-saas`. It does not need to match any brand name; it's just a key.

One file per business unit, not per product and not per period. New numbers are
**appended** to the `snapshots` array inside the same file over time.

---

## Schema

```json
{
  "business_id": "example-business",
  "business_name": "Example Business",
  "platform": "Etsy | Shopify | Gumroad | Stripe | other",
  "business_type": "etsy | shopify | digital_product | saas | other",
  "launch_date": "2026-08-06",
  "currency": "USD",
  "product_categories": ["Category A", "Category B"],
  "listings": [
    {
      "listing_id": "",
      "name": "",
      "price": null,
      "status": "active | draft | inactive",
      "personalized": false
    }
  ],
  "known_costs": {
    "_comment": "Optional. Static per-unit costs, sourced from a pricing doc, used later for margin calculation. Omit any field that isn't known.",
    "production_cost_per_unit": null,
    "shipping_cost_first_item": null,
    "shipping_cost_additional_item": null,
    "source": ""
  },
  "thresholds": {
    "_comment": "Optional. Overrides the default alert thresholds in agents/analyticsdir/kpi-and-alerts.md for this business only. Omit entirely to use defaults.",
    "revenue_drop_critical_pct": 30,
    "conversion_drop_critical_pct": 40,
    "zero_activity_critical_periods": 3
  },
  "snapshots": [
    {
      "date": "2026-08-06",
      "period_type": "day",
      "revenue": 0,
      "orders": 0,
      "sessions_or_visits": 0,
      "views": 0,
      "clicks": 0,
      "favorites": 0,
      "conversion_rate": null,
      "marketing_spend": null,
      "marketing_channel_breakdown": {
        "organic_search": null,
        "paid_ads": null,
        "social": null,
        "direct": null,
        "other": null
      },
      "top_search_terms": [
        { "term": "", "impressions": null, "clicks": null }
      ],
      "products": [
        {
          "product_id": "",
          "name": "",
          "views": null,
          "favorites": null,
          "orders": null,
          "revenue": null
        }
      ],
      "notes": ""
    }
  ]
}
```

### Field notes

- **The business-profile fields** (`business_name`, `platform`, `launch_date`,
  `product_categories`, `listings[]`, `known_costs`) describe the business
  itself and rarely change. They live once at the top of the file, separate
  from `snapshots[]`, which is the time series. Don't repeat static facts
  (like a listing's price) inside every snapshot unless the fact actually
  changed that period.
- `listings[]` is the structural roster of what's for sale. A snapshot's
  `products[]` array cross-references it by `product_id` matching
  `listing_id` for that period's numbers. Populate `listings[]` with
  whatever is confirmed to exist; leave `price` or other fields `null` if
  genuinely unknown rather than guessing.
- **Every numeric field except `date` and `period_type` may be `null`.** Tally is
  required to treat `null`/missing as "no data," never as zero. See
  `agents/analyticsdir/decision-framework.md`.
- `conversion_rate` — leave `null` if you don't have it directly; Tally computes it
  from `orders / sessions_or_visits` when both are present.
- `business_type` exists so Tally can soften language for fields that don't map
  cleanly onto every business (e.g. "favorites" has no real SaaS equivalent — Tally
  will just skip it rather than force a mapping).
- `products[]` is optional per snapshot. Skip it entirely for businesses with a
  single product/offer.
- `notes` is free text for anything that explains a number — a price change, a
  policy change, a platform outage, a holiday. This is the single highest-leverage
  field for keeping Tally's trend analysis honest; an unexplained spike or drop is
  much less useful than an explained one.

### Period types

`period_type` is one of `day`, `week`, `month`. Log at whatever cadence you
actually have data for — daily is ideal but not required. Tally works with
whatever's there and says so explicitly when the cadence is inconsistent.

---

## Example

See `_example.json` in this folder for a filled-in, fully generic two-snapshot
example. It is not tied to any real business and is safe to copy as a starting
point for a new `business_id` file.
