# PHASE 0 — HALLOWEEN LAUNCH RUNBOOK
**Everything in this phase happens in your accounts. I can't do these steps for you.**
Work top to bottom. Two steps produce numbers I need back.

---

## STEP 1 — Printify account + Etsy connection

- [ ] 1.1 Create/log in at printify.com
- [ ] 1.2 **My Stores → Add store → Etsy** → authorise
- [ ] 1.3 Confirm the connection shows "Connected"

**Printify Premium decision:** $29/mo (or ~$24 annual) cuts production cost ~20%.
Break-even is roughly **12 bags/month**. Skip it at launch; subscribe once you're consistently past that.

---

## STEP 2 — Pick the blank and record costs ⚠️ *I need these two numbers*

- [ ] 2.1 Catalogue → search **"tote bag"** → choose a **100% cotton canvas tote, ~15″ × 16″**
- [ ] 2.2 Compare print providers — cost, location, and average production time all vary
- [ ] 2.3 Prefer a provider with **4.5★+** and fast production; Halloween is deadline-driven and a late bag is a refund
- [ ] 2.4 **Record:**

```
Production cost (1 bag, 1-sided print):  $________
US shipping — first item:                $________
US shipping — each additional item:      $________
Print provider name:                     _________
Average production time:                 ____ days
```

**Send me these and I'll re-run the pricing model with exact figures.**
Current model assumes $8.50 production / $4.75 shipping → $26 retail, $9.83 net (37.8%).

---

## STEP 3 — Upload artwork

Files are ready at `designs/collection-01-halloween/print-ready/`:

| File | Design |
|---|---|
| `H1-ghost-peekaboo.png` | Ghost Peekaboo |
| `H2-jack-o-lantern-grin.png` | Jack-O-Lantern |
| `H3-witch-hat-stars.png` | Witch Hat & Stars |
| `H11-monster-mash.png` | Monster Mash |
| `H12-witch-cutie.png` | Witch Cutie |

All 3000 × 3000 px, 300 DPI, **transparent background**, RGBA — verified.

- [ ] 3.1 Create product → select your tote → **Add design**
- [ ] 3.2 Upload the PNG, centre it, scale to **~10″ wide**
- [ ] 3.3 Confirm Printify shows **no low-resolution warning** (it shouldn't at 3000px)
- [ ] 3.4 Repeat for all five
- [ ] 3.5 Save each as a **draft** — do not publish yet

⚠️ **The names in these files are placeholders** ("Amelia", "Mason", etc.). They exist so buyers can see what personalisation looks like. Every real order needs the name swapped before fulfilment — see Step 5.

---

## STEP 4 — Pull Printify's product photography

- [ ] 4.1 On each product, open **Mockups** and select 4–6
- [ ] 4.2 Prioritise: front-on white background, lifestyle/held shots, detail/texture
- [ ] 4.3 Download — these are real photos and should be your **primary gallery images**

Then supplement from `designs/collection-01-halloween/mockups/`:
- `*-mockup-variants.svg` → the "one design, any name" sheet
- `ALL-mockup-size-guide.svg` → size chart

*(Convert those two to PNG before upload — Etsy takes PNG/JPG, not SVG. Ask me and I'll export them.)*

**Gallery order that converts:** Printify front-on photo → variant sheet → Printify lifestyle → close-up → size guide.

---

## STEP 5 — Configure personalisation ⚠️ *the step most likely to be missed*

On each Etsy listing:

- [ ] 5.1 Enable **Personalization**
- [ ] 5.2 Instructions: `Enter your child's first name exactly as you'd like it printed`
- [ ] 5.3 Character limit: **12**
- [ ] 5.4 Set as **required**

⚠️ **Printify does not auto-apply the buyer's name.** This is a manual step per order:
1. Order arrives with the name in the personalisation field
2. Open the SVG in `phase1/`, replace the placeholder name, export PNG
3. Upload to that specific Printify order before approving fulfilment

**Budget ~5 minutes per order.** If volume climbs past roughly 10 orders/day, that's the point to look at an automation tool — not before.

---

## STEP 6 — Publish

Copy directly from `marketing/halloween-etsy-listings.md`:

- [ ] 6.1 SEO title (all under 140 characters)
- [ ] 6.2 13 tags (all ≤20 characters)
- [ ] 6.3 Description, personalisation instructions, materials
- [ ] 6.4 Price: **$26.00** — or list at **$32.00** with a standing 20% sale (recommended)
- [ ] 6.5 **Free shipping**
- [ ] 6.6 ⚠️ **Offsite Ads → OPT OUT** (15% fee destroys the margin — see pricing model)
- [ ] 6.7 Etsy Ads → **off** at launch. Organic first.
- [ ] 6.8 Confirm the **production + shipping cutoff date** from Step 2, then update the "order by October 10" line in each description if it's wrong
- [ ] 6.9 Publish all five

---

## STEP 7 — Confirm launch

- [ ] 7.1 All 5 listings live and searchable
- [ ] 7.2 Search `personalized trick or treat bag` in an incognito window — confirm they appear
- [ ] 7.3 Place a **test order on one listing yourself** to validate the personalisation flow end to end
- [ ] 7.4 Record launch date

**When 7.4 is done, Phase 0 is complete and Phase 1 (persistent infrastructure) begins.**

---

## WHAT I NEED BACK

1. **Production cost, shipping (first + additional), provider name** — Step 2
2. **Actual production time** — so the cutoff date is honest, not a placeholder
3. **Launch confirmation** — unblocks Phase 1

## WHAT I CAN DO WHILE YOU WORK THROUGH THIS

- Export the variant sheet and size guide to PNG for upload
- Re-run pricing the moment you send the real numbers
- Draft Phase 1 files (registry, job definitions, state) ready to commit the moment Halloween is live
