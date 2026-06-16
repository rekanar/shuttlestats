# 🗺️ Badminton Starz — Feature Roadmap & Gap Analysis

This maps what's **actually built** in the `frontend/` app against the requirements in
[`ShuttleIQ_BRD_Enhanced.md`](./ShuttleIQ_BRD_Enhanced.md).

The shipped app implements **BRD Section 8.9 — Team vs Team Doubles Fixture Generator**.
Sections 8.1–8.8 (the wider tournament platform: knockout draws, rankings, coach/parent
modules, AI, notifications) are **not built** and remain the future product vision.

**Legend:** ✅ Done · ⚠️ Partial · ❌ Not built

---

## Section 8.9 — Team vs Team Doubles Fixture Generator

### Input & generation
| FR | Requirement | Status | Notes |
|----|-------------|:--:|-------|
| FR9.1 | Team A name + add players one-by-one / bulk paste, dedupe | ✅ | `TeamInput` add + paste-list, duplicate alert |
| FR9.2 | Team B name + players (same) | ✅ | |
| FR9.3 | Min 4 players per team, disable Generate | ✅ | `canGenerate` gate |
| FR9.4 | Max 20 per team; prompt to split sub-groups | ⚠️ | 20 cap enforced; no "split into sub-groups" guidance |
| FR9.5 | Mode selector Full / Fair Rounds (default Fair) | ⚠️ | Both modes work; **default is Full Fixture**, BRD wants Fair |
| FR9.6 | Courts available 1–10 selector | ⚠️ | Algorithm honors courts; UI hardcodes 4 (no selector) |
| FR9.7 | Match duration + start time → estimated times | ❌ | Stored as 30 min; no UI, no time calculation |
| FR9.8 | Generate in < 3s | ✅ | Instant (client-side) |
| FR9.9 | Summary card (matches, rounds, per-player) | ✅ | `ProgressBanner` + `summary` |
| FR9.10 | Round-by-round table incl. estimated time | ⚠️ | Table present; no time column; flat "All Matches" w/ Round/Court |
| FR9.11 | Player match-count matrix (partner/opponent freq) | ⚠️ | Per-player count range shown; no full partner/opponent frequency matrix |
| FR9.12 | Toggle Fair Rounds ↔ All Possible Fixtures | ❌ | Mode is fixed at creation |
| FR9.13 | Edit player names inline + regenerate | ❌ | |
| FR9.14 | Remove a player + regenerate | ❌ | Can delete individual matches, not player+regen |
| FR9.15 | Swap players between teams + regenerate | ❌ | |
| FR9.16 | Export PDF (A4, one round per section) | ⚠️ | Browser Print works; not A4-per-round formatted |
| FR9.17 | Export Excel/CSV, one row per match | ✅ | **New** — `exportService.exportScheduleCsv` |
| FR9.18 | Share via public link / WhatsApp (read-only) | ❌ | `shareToken` stored but no public route |
| FR9.19 | Save fixture to tournament record | ✅ | Firestore + history panel |
| FR9.20 | Print per-round score sheets | ❌ | Only general print |

### Score entry & results
| FR | Requirement | Status | Notes |
|----|-------------|:--:|-------|
| FR9.21 | Inline result toggle (A/Draw/B), colour-coded | ✅ | `AllMatchesList` |
| FR9.22 | Optional game-score fields + validation | ⚠️ | Fields exist; no 21/2-pt-lead validation |
| FR9.23 | Mark Not Played, excluded from win % | ✅ | Excluded from stats (styled neutral, not struck-through) |
| FR9.24 | Unlock round w/ mandatory reason + audit log | ❌ | No round lock/unlock or audit trail |
| FR9.25 | Configure points scheme; lock after first result | ⚠️ | Scheme stored & used; `updatePointsScheme` API exists; no config UI, no lock |
| FR9.26 | Live points table, sortable | ⚠️ | Live table present; columns not sortable |

### Per-pair stats
| FR | Requirement | Status | Notes |
|----|-------------|:--:|-------|
| FR9.27 | Pairs stats table | ✅ | |
| FR9.28 | Bar chart — wins by pair (team colours, tooltip) | ✅ | `StatsPanel` |
| FR9.29 | Win % horizontal bar + avg reference line | ✅ | |
| FR9.30 | Pie — team win share | ✅ | |
| FR9.31 | Leaderboard card top-3 (🥇🥈🥉) | ⚠️ | Sorted table only; no medal card |

### Per-player stats
| FR | Requirement | Status | Notes |
|----|-------------|:--:|-------|
| FR9.32 | Player stats table | ✅ | |
| FR9.33 | Player win % bar chart | ✅ | |
| FR9.34 | Points progression line chart (toggleable) | ✅ | |
| FR9.35 | Participation heatmap (player × round) | ❌ | |

### Export & share stats
| FR | Requirement | Status | Notes |
|----|-------------|:--:|-------|
| FR9.36 | Stats tables → Excel | ✅ | **New** — `exportService.exportStatsCsv` |
| FR9.37 | Charts → PNG | ❌ | |
| FR9.38 | Stats dashboard via public link, live | ❌ | |

### Completion tracking
| FR | Requirement | Status | Notes |
|----|-------------|:--:|-------|
| FR9.39 | Status badge per match (🟡/✅/⬜) | ✅ | Plus a 🔴 Live state (beyond BRD) |
| FR9.40 | Fixture progress bar | ✅ | `ProgressBanner` |
| FR9.41 | Round-level completion indicator / lock | ❌ | Matches shown flat, not per-round |
| FR9.42 | Pending-matches filter w/ count badge | ✅ | Status filter |
| FR9.43 | Pending view w/ inline quick result | ✅ | |
| FR9.44 | Completed-matches filter | ✅ | "Done" filter |
| FR9.45 | Summary card incl. completion stats | ✅ | |
| FR9.46 | Mark fixture finished → lock + banner | ✅ | `handleFinish`, `isFinished` |
| FR9.47 | Export pending-matches report (checklist) | ✅ | **New** — `exportService.exportPendingCsv` (checkbox column) |

### Player search
| FR | Requirement | Status | Notes |
|----|-------------|:--:|-------|
| FR9.48 | Search bar at top of fixture | ✅ | `PairSearchCard` (also supports two-name pair search) |
| FR9.49 | Live filter, min 1 char, partial/case-insensitive | ✅ | |
| FR9.50 | Result row w/ searched name highlighted | ✅ | `highlight()` |
| FR9.51 | Results grouped by status section (collapsible) | ⚠️ | Status filter exists; not grouped collapsible sections |
| FR9.52 | "Playing With" partner records | ⚠️ | Computed in `statsService.searchPlayer`; not surfaced in UI |
| FR9.53 | "Playing Against" opponent records | ❌ | Not surfaced in UI |
| FR9.54 | "No player found" empty state | ✅ | |
| FR9.55 | Search on shared public link | ❌ | No shared link |

**Section 8.9 score: 29 ✅ · 12 ⚠️ · 14 ❌  (of 55)**

---

## Sections 8.1–8.8 — Wider ShuttleIQ platform (not built)

| Section | Area | Status |
|---------|------|:--:|
| 8.1 | Tournament Management (create, registrations, court alloc, certificates) | ❌ |
| 8.2 | Fixture Engine (Knockout, Round Robin, Swiss, Hybrid, seeding) | ❌ |
| 8.3 | Player Module (profiles, match history, rankings) | ❌ |
| 8.4 | Coach Module (rosters, training plans, video) | ❌ |
| 8.5 | Parent Module (read-only child view) | ❌ |
| 8.6 | Umpire / Referee Module | ❌ |
| 8.7 | Notifications (push / email / SMS) | ❌ |
| 8.8 | Reporting & Analytics (platform-wide) | ❌ |
| 14 | AI features (style analysis, training, prediction, video) | ❌ |
| — | Auth, roles/RBAC, multi-language, payments | ❌ |

---

## ✨ Built beyond the BRD

These exist in the app but aren't in Section 8.9:

- **🔴 Live / in-progress match state** ("Start Match → Mark Live").
- **Dirty-match cloud sync** — only changed match documents are written to Firestore.
- **JSON backup / restore** of all fixtures and matches.
- **Two-name pair search** (find matches where two players partner) — richer than single-name search.
- **Offline-first PWA** + installable **Android app** (Capacitor).
- **Tournament history side panel** with ongoing / finished / not-started counts.
- **Delete single match / delete entire tournament** with optimistic UI.
- **Animated branded header & themed UI.**

---

## 🎯 Recommended next steps

High value, self-contained, build cleanly on what exists:

1. **Points-scheme config UI** (FR9.25) — surface `updatePointsScheme`; lock after first result.
2. **Courts & default-mode controls** (FR9.5, FR9.6) — add the court selector; default to Fair Rounds.
3. **Leaderboard medal card** (FR9.31) — top-3 with 🥇🥈🥉 from existing sorted pair stats.
4. **"Playing With / Against" in search UI** (FR9.52, FR9.53) — `searchPlayer` already computes partnerships.
5. **Participation heatmap** (FR9.35) — player × round grid from existing match data.
6. **Chart PNG export** (FR9.37) — render Recharts SVG → canvas → PNG.
7. **Public share link** (FR9.18, FR9.38, FR9.55) — read-only route keyed on the existing `shareToken`.
8. **Per-round score sheets + A4 PDF** (FR9.16, FR9.20).

---

## ✅ Recently shipped

- **Admin role + public read-only dashboard** — Firebase Auth + Firestore Security Rules. Anyone can view; only a signed-in admin can create/edit/score/delete/finish. Server-side enforced via `frontend/firestore.rules`. (Addresses the wider BRD's RBAC intent — see Section 10 role matrix.)
- CSV/Excel export of the full **schedule** (FR9.17), combined **stats** (FR9.36), and a tournament-day **Pending Matches checklist** (FR9.47) — `frontend/src/services/exportService.ts`, no new dependencies.

## 🚧 In progress / next

- **Manual knockout championships** — Men's/Women's Singles, Men's/Women's/Mixed Doubles. One generic single-elimination bracket (R32→Final) parameterized by side size (1 or 2) + gender rule; admin enters names manually at every round; a "Championship" (e.g. Indian Open) can hold all five event brackets. *(Design agreed; build pending.)*
