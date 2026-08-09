# HALLOWEEN COLLECTION — 14-DAY LAUNCH MONITORING CHECKLIST
**Collection 01 · WillowGiftWorks · 5 listings live**

> **Superseded for day-to-day logging:** daily/weekly tracking now runs
> through the Analytics Agent (Tally) — see
> `businesses/willowgiftworks-etsy/daily-analytics-workflow.md` for what to
> log each day and `businesses/willowgiftworks-etsy/launch-30-day-checklist.md`
> for the day-by-day schedule. The **decision triggers** and **what-not-to-do**
> sections below still apply as-is; only the manual "spreadsheet or notes"
> logging instruction is replaced.

---

## PRE-LAUNCH VERIFICATION — completed 2026-08-06

| Check | Result |
|---|---|
| All 5 listings active/published on Etsy | ✅ Confirmed — all 5 visible on shop front, status "Published" in Printify, none flagged under "Requires action" |
| Personalization flow works as a buyer would see it | ✅ Confirmed — field expands, shows correct instructions, live char counter, over-limit warning fires correctly at 12 chars (tested with a 14-char string) |
| Printify ↔ Etsy sync connection healthy | ✅ Confirmed — auto-sync active, last synced same-day, order queue empty and error-free |
| Printify billing / payment method | ⚠️ **NOT set up** — Printify Balance $0.00, no card on file. **Action needed before first order ships**: add a payment method in Printify → Wallet → Payments, or production may stall on the first sale. This requires entering payment details directly — do this yourself in your Printify account. |
| No accidental placeholder names in live config | ✅ Confirmed — personalization instruction fields are generic on all 5 listings, no orders exist yet, mockup images intentionally show example names (Olivia, Amelia, Jaxon, Harper, Mason) for buyer visualization only, per the original design intent |

**One open item carried into launch: Printify billing.** Everything else is clean.

---

## DAILY MONITORING — Days 1–14

Track each metric daily in a simple log (spreadsheet or notes). Etsy Shop Manager → Stats gives most of these.

| Day | Views | Favorites | Clicks (search→listing) | Orders/Sales | Conversion rate | Notes |
|---|---|---|---|---|---|---|
| 1 | | | | | | |
| 2 | | | | | | |
| 3 | | | | | | |
| ... | | | | | | |
| 14 | | | | | | |

**Conversion rate** = Sales ÷ Visits (Etsy Stats shows this directly — don't hand-calculate from views, which includes repeat views).

### What to check daily
- **Views** — raw traffic. If flat/zero after day 2–3, the listings aren't being indexed or found — check tags/title are live (not reverted by Etsy's "Automatic optimization").
- **Favorites** — interest signal without purchase intent. A favorites-to-views ratio under ~2–3% suggests the photos or price aren't landing even if the copy is working.
- **Clicks** — Etsy Stats → "Where buyers found you" shows search vs. direct vs. social. Early on this should be almost entirely Etsy search.
- **Conversion rate** — the number that actually matters. Etsy median for a new shop is often under 1–2%; don't panic at low numbers in week 1, panic if it's still zero by day 10 with decent traffic.
- **Sales** — obvious, but also check *which* of the 5 designs sells first — that's real signal on which artwork to lean into for future collections.
- **Search terms** — Etsy Stats → Traffic → search terms that led to a visit. This is the highest-value data point: it tells you which of the 13 tags per listing are actually earning impressions, and surfaces buyer language you didn't anticipate.

### What to check weekly (day 7, day 14)
- **Offsite Ads** — confirm still opted out (per the pricing model, this is the single biggest margin risk if it silently re-enables).
- **Personalization instruction fields** — confirm still showing the generic instructions, not reverted to Printify's default text.
- **Free shipping status** — confirm still active on all 5 (this reverted silently once during setup — worth a spot-check).
- **Printify billing** — confirm a payment method is on file if not done pre-launch, and that the first real order (if any) went to production without a payment failure.

---

## DECISION TRIGGERS — what changes to make based on data

| Signal | Threshold | Action |
|---|---|---|
| Zero views by day 3 | No traffic at all | Check listings are actually live (not reverted to draft), check tags weren't overwritten by Etsy's automatic title/tag optimization |
| Views healthy, favorites near-zero | Favorites/views < 1% after 50+ views | Photos or price are the problem, not discoverability — consider swapping gallery order or reviewing the $25.99 price point against competitors |
| Favorites healthy, zero sales | Multiple favorites, no conversions after 100+ views | Price resistance or trust signal gap (no reviews yet is expected for a new shop — normal for the first 2 weeks) |
| One design clearly outperforming the other 4 | 2x+ the views/favorites of the next-best | Reallocate: consider a matching new design in that theme, or lead with it in any future promotion |
| Search terms reveal high-volume queries not in current tags | Recurring term absent from the 13 tags | Swap out the lowest-performing tag for the discovered term (check via `eRank` or Etsy Stats search terms) — don't touch title/description without re-checking margins |
| First sale comes in | Any sale | Confirm Printify billing charged successfully and the order entered production; manually swap the buyer's actual name into the design file before approving fulfillment (personalization requires manual approval — this is enforced by Printify, not optional) |
| Conversion rate stays under 0.5% past day 10 with 200+ visits | Sustained low conversion despite traffic | Reconsider price positioning (model supports flexibility down to $23 or up toward $32 without breaking margin) or revisit gallery photo order |
| Offsite Ads re-enables itself | Toggle flips back on | Turn off immediately — this was flagged as the single largest margin risk in the pricing model |

---

## WHERE TO PULL THE NUMBERS

- **Etsy Shop Manager → Stats** — views, favorites, conversion rate, traffic sources, search terms (the primary source for everything above)
- **Printify → Dashboard** — orders requiring action, sync status, costs to date
- **Printify → Orders** — production status per order, whether personalization approval is pending

## WHAT NOT TO DO IN THE FIRST 14 DAYS

Per the collection's own decision rules and the finalized pricing model:
- Don't turn on Etsy Ads yet — organic only, per the pricing model's advertising viability analysis
- Don't discount below $23 or the sibling bundle below $48 — breaks the margin model
- Don't opt into Offsite Ads — 15% fee destroys margin at this price point
- Don't make more than one listing change at a time — isolate cause and effect while the data is still thin
