# AI EMPIRE — SYSTEM UPGRADE PLAN
**Source:** TikTok video (@l_ogannn), 57.8s, screen recording of a 3D "agent city" dashboard
**Method:** No ffmpeg available — frames extracted by decoding the MP4 in Chrome via CDP and compositing to canvas. 16-frame contact sheet + 4 full-resolution key frames analysed.
**Directive:** Additive only. Nothing in this plan deletes, renames, moves, or overwrites existing work.

---

# 1. VIDEO FEATURE BREAKDOWN

## 1.1 Agent architecture
Each building in the city is one agent, labelled with a **codename + one-line role**. Nine entities read clearly:

| Codename | Role label (as shown) | Visual |
|---|---|---|
| **Ember** | "Manager, delegates work" | Central tower, **gold** beam — the only gold one |
| **Maple** | "Etsy executor (listing…)" | Orange beam |
| **Scout** | "Research and trends" | Tall tower, white/blue beam |
| **Wick** | "Video producer (TikTok …)" | Magenta beam |
| **Hazel** | "Marketing strategist (b…)" | Blue beam |
| **Flint** | "Resale sourcing (finds …)" | Red beam |
| **Piper** | "Collab outreach drafter…" | Blue beam |
| **Sterling** | "Paper trading and paper…" | Blue beam |
| **Meeting Hall** | "The tribe convenes here" | Not an agent — a shared coordination space |

**Hierarchy is explicit and visual.** Dashed lines radiate from Ember's tower to every other building. One manager, N specialists, one shared hall. Colour encodes function, and the manager is the only gold beam — status is readable at a glance without reading any text.

## 1.2 Dashboard / UI structure
- **3D isometric city**, free-rotate and zoom (hand gestures on a touchscreen throughout)
- **Floating labels** anchored to each building: codename + truncated role
- **Persistent top status bar** running a live ticker of every agent's current job
- **Metric counters** in the top bar: a dollar figure (**$2,416.80**) plus two integers (**94**, **38**) — almost certainly revenue plus two volume counts
- Video's claim at 34–37s: *"anything I want… with one click"*

## 1.3 Workflow organisation — the most transferable finding
The ticker shows each agent bound to a **named recurring job**, not ad-hoc prompting:

```
Wick     on: video_slideshow
Scout    on: research
Maple    on: draft_listing
Sterling on: trading_cycle
Flint    on: flint_triage
Hazel    on: marketing_cycle
Piper    on: outreach_cycle
```

The `_cycle` suffix is the tell: these are **scheduled, repeating jobs with stable names** — not one-off conversations. This is the single most valuable idea in the video.

## 1.4 Automation systems
Every agent shows an active job simultaneously. Implies a scheduler running cycles on intervals, with the city acting as a live view of the queue rather than a control panel.

## 1.5 Task routing
Ember delegates outward along the dashed edges. The routing model is a **hub-and-spoke**: manager receives intent, dispatches to the specialist that owns that capability. Meeting Hall implies a shared context space where agents' outputs converge.

## 1.6 Reporting systems
Reporting is **ambient, not on-demand** — the top bar always shows what everything is doing and what the business is earning. No report needs to be requested.

## 1.7 Quality-control systems
**None visible.** No approval gates, no review steps, no verification stage anywhere in 57 seconds. This is a genuine gap in the video, not in our system.

## 1.8 Business-management features
Revenue counter, volume counters, live agent status, one-click invocation, multi-business scope (Etsy + TikTok + resale + trading in one view).

## ⚠️ 1.9 Honest read on the source
This is a **TikTok marketing clip**, not a technical walkthrough. It demonstrates a *visualisation*, and shows no evidence of output quality, error handling, or revenue attribution. The `$2,416.80` figure is unverifiable and unattributed.

**The 3D city is presentation, not capability.** Everything it displays could sit on top of a plain text file. Copy the operating model; treat the city as optional polish.

---

# 2. GAP ANALYSIS

Current state, verified against the actual tree:

| Capability | Video | AI Empire today | Gap |
|---|---|---|---|
| Manager agent | Ember | ✅ `prompts/master-agent-prompt.md` | **None** — ours is more detailed |
| Research agent | Scout | ✅ `agents/research/README.md` | **None** |
| Etsy listing agent | Maple | ⚠️ `agents/etsy-listing/` **empty folder** | Spec missing (work was done inline) |
| POD design agent | — | ⚠️ `agents/pod-design/` **empty folder** | Spec missing |
| Marketing/ads agent | Hazel | ⚠️ `agents/ads/` **empty folder** | Spec missing |
| Thumbnail agent | — | ⚠️ `agents/thumbnail/` **empty folder** | Spec missing |
| Printify / Fiverr / analytics | — | ⚠️ empty folders | Specs missing |
| Video/social producer | Wick | ❌ | **New capability** |
| Outreach drafter | Piper | ❌ | **New capability** |
| Resale sourcing | Flint | ❌ | **Out of business scope** |
| Paper trading | Sterling | ❌ | **Out of business scope** |
| Named recurring jobs | ✅ `*_cycle` | ❌ | **Real gap** |
| Persistent state between sessions | ✅ implied | ❌ everything lives in chat | **Biggest real gap** |
| Live status view | ✅ ticker | ❌ | **Real gap** |
| Revenue / metrics tracking | ✅ counters | ❌ `data/` empty | **Real gap** |
| Scheduling / automation | ✅ | ❌ | **Real gap** |
| **Quality-control gates** | ❌ none | ✅ **we have these** | **We are ahead** |
| **Render-verified QA** | ❌ none | ✅ measured, not estimated | **We are ahead** |
| **IP / trademark screening** | ❌ none | ✅ every asset cleared | **We are ahead** |
| **Costed pricing model** | ❌ vibes | ✅ fee-accurate, sensitivity-tested | **We are ahead** |

### The honest summary
**Our agent architecture is not behind — our *infrastructure* is.**

We have a manager, specialists, a defined workflow, and quality gates the video completely lacks. What we don't have is anything that persists between sessions: no state, no schedule, no metrics, no status view. Every collection we've built lives in conversation history and loose files.

The five real gaps: **persistent state · named job cycles · scheduling · metrics tracking · status visibility.** None require a 3D city.

---

# 3. RECOMMENDED UPGRADES

Ordered by value per unit of effort.

### U1 — Agent registry *(highest value, ~1 hour)*
One JSON file that is the single source of truth: every agent, its codename, role, owned jobs, spec path, status. This is what makes every other upgrade possible.

### U2 — Backfill the empty agent specs *(high value)*
Seven empty folders already exist. Write the README for each in the format `agents/research/README.md` already establishes. **No restructuring — just filling in what the master prompt already promises.**

### U3 — Named job cycles *(the key idea from the video)*
Define jobs as named, repeatable units — `draft_listing`, `research_cycle`, `marketing_cycle` — each with owner, inputs, outputs, and success criteria.

### U4 — Persistent state *(fixes our biggest weakness)*
`data/state/` JSON files: collection status, launch checklist, decision log. Survives session loss.

### U5 — Metrics tracking *(makes the money counter real)*
`data/metrics/` — listing performance, revenue, ad spend. Powers the Step 5 tracking the master prompt already requires but has no home for.

### U6 — Status dashboard *(the video's ticker, done cheaply)*
A single self-contained HTML page reading the registry + state files. Same information as the city, a fraction of the effort.

### U7 — Scheduling *(the automation layer)*
Claude Code's `/schedule` skill and cron support already exist. Wire cycles to real schedules.

### U8 — 3D city visualisation *(deliberately last)*
Cosmetic. Real effort, zero revenue impact. Only after U1–U7 are live and Halloween has shipped.

### ❌ Explicitly NOT recommended
**Flint (resale sourcing) and Sterling (paper trading).** They belong to a different business. The master prompt's own rule is *focus on customer demand* and *test before scaling* — adding two unrelated verticals before the first collection has made a single sale is exactly the failure mode those rules exist to prevent.

---

# 4. NEW FOLDERS

All additive. **No existing folder is renamed, moved, or removed.**

```
AI-EMPIRE/
├── agents/            [EXISTS - only adding README.md files into empty dirs]
│   ├── research/      [EXISTS - untouched]
│   ├── etsy-listing/  [EXISTS, empty  -> add README.md]
│   ├── pod-design/    [EXISTS, empty  -> add README.md]
│   ├── ads/           [EXISTS, empty  -> add README.md]
│   ├── thumbnail/     [EXISTS, empty  -> add README.md]
│   ├── printify/      [EXISTS, empty  -> add README.md]
│   ├── fiverr/        [EXISTS, empty  -> add README.md]
│   ├── analyticsdir/  [EXISTS, empty  -> add README.md]
│   ├── content/       [NEW - Wick equivalent]
│   └── outreach/      [NEW - Piper equivalent]
├── data/              [EXISTS, empty]
│   ├── agent-registry.json   [NEW]
│   ├── job-definitions.json  [NEW]
│   ├── state/                [NEW]
│   └── metrics/              [NEW]
├── reports/           [EXISTS, empty]
│   └── status/               [NEW - dated status reports]
├── dashboard/         [NEW - index.html status view]
└── docs/              [EXISTS]
    └── system-upgrade-plan.md  [THIS FILE]
```

Untouched: `assets/`, `businesses/`, `designs/`, `marketing/`, `prompts/`.

---

# 5. NEW AGENTS

### Integration strategy: codenames as *aliases*, not renames
Folders keep functional names. The registry adds a codename field. Nothing breaks, and the master prompt's existing agent paths stay valid.

| Existing folder | Proposed codename | Video equivalent | Action |
|---|---|---|---|
| `agents/research/` | **Scout** | Scout | Alias only — spec already exists |
| `prompts/master-agent-prompt.md` | **Ember** | Ember | Alias only — **do not modify the prompt** |
| `agents/etsy-listing/` | **Maple** | Maple | Backfill spec |
| `agents/pod-design/` | **Quill** | — | Backfill spec |
| `agents/ads/` | **Hazel** | Hazel | Backfill spec |
| `agents/thumbnail/` | **Vera** | — | Backfill spec |
| `agents/printify/` | **Forge** | — | Backfill spec |
| `agents/fiverr/` | **Ridge** | — | Backfill spec |
| `agents/analyticsdir/` | **Tally** | — | Backfill spec |

**Genuinely new (2):**

| Folder | Codename | Purpose | Priority |
|---|---|---|---|
| `agents/content/` | **Wick** | Short-form social content for product promotion | After Halloween ships |
| `agents/outreach/` | **Piper** | Collab and cross-promo drafting | Low — defer |

**One new concept worth stealing: "Meeting Hall."** Not an agent — a shared state directory (`data/state/`) where every agent reads current context before acting and writes results after. This is what turns nine isolated prompts into a system.

---

# 6. INTEGRATION PLAN

**Rule applied throughout: integrate, never replace.**

| Conflict | Replacement approach ❌ | Integration approach ✅ |
|---|---|---|
| Video uses codenames; we use functional names | Rename all folders | Registry maps codename ↔ folder. Both work. |
| Video has one manager agent; we have a master prompt | Rewrite the prompt | Register the existing prompt **as** Ember, unmodified |
| Video has no QA gates; we do | Drop gates for speed | **Keep every gate.** Add them to job definitions as required stages. |
| Video shows 8 agents incl. resale/trading | Build all 8 | Build only what serves the current business |
| Video state lives in an app | Build an app | Plain JSON in `data/` — readable, diffable, zero dependencies |
| Video has a 3D city | Build a 3D city | HTML dashboard now; 3D only if it ever earns its place |

### How work already done gets absorbed, not redone
Everything completed maps cleanly into the new structure without being touched:

- Halloween artwork → `designs/collection-01-halloween/` **stays where it is**; registry references the path
- Listings + pricing → `marketing/*.md` **stay where they are**
- Research scoring → recorded in `data/state/collections.json` as history, files untouched
- QA method (headless-Chrome render + `getBBox` safe-zone measurement) → promoted to a **required stage** in the design job definition, since it caught six real defects across two collections

---

# 7. RISK ASSESSMENT

| # | Risk | Severity | Mitigation |
|---|---|---|---|
| **R1** | **Infrastructure work delays the Halloween launch.** Halloween is complete through pricing and seasonally time-critical. Every day spent on registries is a day of lost peak search traffic. | 🔴 **Critical** | **Ship Halloween first.** No upgrade work begins until listings are live. Non-negotiable. |
| R2 | Scope creep into resale/trading | 🟠 High | Explicitly excluded above. Revisit only after the first collection is profitable. |
| R3 | Building the 3D city instead of the business | 🟠 High | U8 is last and optional. It generates zero revenue. |
| R4 | State files drift from reality and become worse than nothing | 🟡 Medium | Single source of truth per fact; update state in the same step as the work. |
| R5 | Nine agent specs written but never used | 🟡 Medium | Backfill only when a job actually needs the agent. |
| R6 | Codename aliasing confuses existing references | 🟢 Low | Aliases are additive; functional paths remain canonical. |
| R7 | Copying an unvalidated system | 🟡 Medium | The video proves nothing about output quality. Adopt structure, keep our QA. |
| R8 | Scheduled cycles burn tokens unattended | 🟡 Medium | Start manual. Add schedules only for jobs proven to produce value. |

---

# 8. STEP-BY-STEP IMPLEMENTATION ORDER

### 🔴 PHASE 0 — SHIP HALLOWEEN (blocks everything)
0.1 Confirm Printify production + shipping cost
0.2 Re-run pricing with real figures
0.3 Upload 5 designs to Printify
0.4 Publish 5 Etsy listings
0.5 Confirm live

**No upgrade work starts until 0.5 is done.**

### 🟢 PHASE 1 — Foundation (~2–3 hours, after launch)
1.1 `data/agent-registry.json` — all agents, codenames, folders, status
1.2 `data/job-definitions.json` — named cycles with owner/inputs/outputs/**QA gates**
1.3 `data/state/collections.json` — seed with Halloween (live), Retirement, Graduation, Mom Humor (paused at 1.2A)
1.4 `data/state/decisions.json` — log the calls already made (locked 1.2A, $26 pricing, offsite ads opt-out)

### 🟢 PHASE 2 — Visibility
2.1 `dashboard/index.html` — self-contained, reads the JSON, shows agent status + collection pipeline + metrics
2.2 `reports/status/` — dated snapshots in the master prompt's existing report format

### 🟢 PHASE 3 — Metrics
3.1 `data/metrics/listings.json` — views, favourites, sales per listing
3.2 Weekly update cycle — makes the video's revenue counter real and attributed

### 🟡 PHASE 4 — Backfill agents (only as needed)
4.1 `agents/etsy-listing/README.md` (Maple) — highest value, most used
4.2 `agents/pod-design/README.md` (Quill) — encode the QA method that caught 6 defects
4.3 `agents/ads/README.md` (Hazel)
4.4 Remaining specs on demand

### 🟡 PHASE 5 — Automation
5.1 Wire one low-risk cycle to a schedule (e.g. weekly `research_cycle`)
5.2 Measure value, then expand

### ⚪ PHASE 6 — Optional polish
6.1 `agents/content/` (Wick)
6.2 3D city — **only if Phases 1–5 are proven and the business is profitable**

---

## RECOMMENDATION

Adopt the video's **operating model** — named agents, named cycles, persistent state, ambient status. Reject its **presentation layer** and its **business scope** until the fundamentals earn them.

We are ahead of the video on the thing that actually determines whether products sell: quality control. We are behind on the thing that determines whether the system survives a closed session: persistence.

**Fix persistence. Keep the gates. Ship Halloween first.**
