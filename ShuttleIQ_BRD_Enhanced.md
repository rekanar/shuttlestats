# Business Requirements Document (BRD)
## ShuttleIQ — AI-Powered Badminton Training & Tournament Management Platform

| Field | Value |
|---|---|
| Document Version | 2.0 |
| Status | Draft |
| Date | 2026-06-09 |
| Author | ShuttleIQ Product Team |
| Classification | Confidential — Internal Use |
| Distribution | Product Owner, Business Sponsor, Technical Lead, Legal |

---

## Version History

| Version | Date | Author | Changes |
|---|---|---|---|
| 1.0 | 2026-06-09 | Product Team | Initial draft |
| 2.0 | 2026-06-09 | Product Team | Added missing sections: problem statement, assumptions, risks, role matrix, data requirements, integrations, monetization, business rules, complete NFRs, glossary |
| 2.1 | 2026-06-09 | Product Team | Added Section 8.9 Team vs Team Doubles Fixture Generator with full FR set, business rules BR14–BR21, data entity, permissions, and glossary entries |
| 2.2 | 2026-06-09 | Product Team | Added FR9.21–FR9.38: inline score/win/loss entry on fixture table, points configuration, points table, per-pair and per-player stats dashboards with graphical charts (bar, pie, leaderboard) |
| 2.3 | 2026-06-09 | Product Team | Added FR9.39–FR9.55: completed/pending match status tracking, fixture progress dashboard, round-level completion marking, and player-name search bar with filtered fixture results |

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Problem Statement](#2-problem-statement)
3. [Business Objectives](#3-business-objectives)
4. [Scope](#4-scope)
5. [Stakeholders](#5-stakeholders)
6. [Assumptions & Constraints](#6-assumptions--constraints)
7. [Business Rules](#7-business-rules)
8. [Functional Requirements](#8-functional-requirements)
   - 8.9 [Team vs Team Doubles Fixture Generator](#89-team-vs-team-doubles-fixture-generator)
9. [Non-Functional Requirements](#9-non-functional-requirements)
10. [Role & Permissions Matrix](#10-role--permissions-matrix)
11. [Data Requirements](#11-data-requirements)
12. [Integration Requirements](#12-integration-requirements)
13. [Monetization & Business Model](#13-monetization--business-model)
14. [AI Features — Detailed Requirements](#14-ai-features--detailed-requirements)
15. [Technology Stack](#15-technology-stack)
16. [Risk Register](#16-risk-register)
17. [Success Metrics](#17-success-metrics)
18. [Release Roadmap](#18-release-roadmap)
19. [Approval](#19-approval)
20. [Glossary](#20-glossary)

---

## 1. Executive Summary

ShuttleIQ is a cross-platform (web, mobile, desktop) SaaS application for the Indian badminton ecosystem. The primary focus is on tournament organizers who need BWF-compliant tournament operations, while also serving players, coaches, academies, and parents with AI-driven performance development, nutrition guidance, and recovery planning.

ShuttleIQ aims to digitize and automate badminton administration in India, replacing fragmented manual processes (WhatsApp groups, Excel draw sheets, paper rankings) with a unified, intelligent platform.

---

## 2. Problem Statement

### 2.1 Current Pain Points

| Stakeholder | Current Problem |
|---|---|
| Tournament Organizers | Manual draw sheets, Excel-based scheduling, no automated court allocation, certificate printing is tedious |
| Players | No centralized profile or match history, rankings maintained inconsistently across districts |
| Coaches | No digital tool to track player progress, assign training plans, or review match statistics |
| Academies | No platform to manage multiple coaches and players simultaneously |
| Parents | No visibility into their child's tournament schedule, results, or training progress |
| Umpires/Referees | Assignment and communication done informally with no digital workflow |

### 2.2 Market Context

- India has 22+ million badminton players (BFI data) with under 1% on any digital tournament management system.
- Badminton is the 2nd most popular sport in India.
- Existing global tools (Tournasoft, BadmintonWorld) are not India-localized, lack Hindi/regional language support, and are not affordably priced for local organizers.

---

## 3. Business Objectives

| ID | Objective | Linked KPI |
|---|---|---|
| BO1 | Simplify tournament operations end-to-end | Time to generate draw < 30s; organizer onboarding < 10 min |
| BO2 | Provide AI-driven player development insights | 80% of AI recommendations rated useful by players/coaches |
| BO3 | Enable BWF-compliant fixture generation for all tournament formats | 100% BWF rule compliance in fixture engine |
| BO4 | Offer nutrition, warm-up, recovery, and injury prevention guidance | 70% of users engage with health features monthly |
| BO5 | Build a nationwide badminton community/ecosystem | 500 registered organizers, 50,000 players within 18 months |
| BO6 | Achieve platform financial sustainability through SaaS revenue | Reach break-even by Month 24 |

---

## 4. Scope

### 4.1 In Scope — Phase 1

- Tournament Management (creation, scheduling, court allocation, referee assignment)
- Fixture Engine (Knockout, Round Robin, Swiss, Hybrid)
- Player Profiles and Match History
- District and National Rankings
- Match Statistics Dashboard
- AI Style Analyzer (basic)
- Training Planner (basic)
- Diet & Recovery Module
- Notifications (push, email, SMS)
- Coach Dashboard
- Parent View (read-only)
- Umpire/Referee Assignment Module
- Role-Based Access Control
- Certificate and Report Generation
- Multi-language support (English + Hindi)
- **Team vs Team Doubles Fixture Generator** (fair pairing, round-based schedule, export)

### 4.2 Out of Scope — Phase 1

- Wearable device integrations (e.g., Garmin, Fitbit)
- In-app marketplace for equipment
- Integration with international federations (BWF global API)
- Sponsorship management portal
- Live video streaming
- Full video analysis with upload (Phase 2)
- Native smartwatch apps

### 4.3 Future Phases

| Phase | Key Features |
|---|---|
| Phase 2 | AI Video Analytics, Opponent Analysis, Injury Risk Prediction, Sponsor Portal, Wearable Integration |
| Phase 3 | BWF Global Integration, Marketplace, International tournament support, Advanced AI Coach |

---

## 5. Stakeholders

| Role | Type | Interests | Key Concerns |
|---|---|---|---|
| Tournament Organizer | Primary | Easy tournament creation, draw generation, live scoring | Learning curve, cost, reliability on tournament day |
| Player | Secondary | Match history, rankings, training tips, tournament discovery | Data privacy, accuracy of rankings |
| Coach | Secondary | Player progress tracking, training assignment, match review | Ease of use, real-time updates |
| Academy Administrator | Secondary | Multi-player/coach management, batch enrollment | Cost per player, reporting |
| Parent | Secondary | Child's schedule, results, training progress | Child data safety, notification spam |
| Umpire / Referee | Tertiary | Assignment notification, match sheet access | Timely communication |
| Sponsor | Tertiary | Brand visibility, ROI metrics from tournaments | Ad placement controls |
| System Administrator | Internal | Platform health, user management, audit logs | Security, uptime |
| BFI / State Badminton Association | Regulatory | Rankings compliance, event sanctioning | BWF rules adherence |

---

## 6. Assumptions & Constraints

### 6.1 Assumptions

- Players and organizers in India have access to a smartphone or desktop with internet.
- BWF rules and scoring standards will not undergo major changes during Phase 1 development.
- Users are comfortable with English or Hindi interfaces.
- A tournament organizer will act as the data controller for player data within their events.
- Third-party SMS/email gateway services are available and cost-effective in India.
- AI training recommendations do not replace licensed physiotherapists and include appropriate disclaimers.

### 6.2 Constraints

| Type | Constraint |
|---|---|
| Regulatory | Must comply with India's Digital Personal Data Protection (DPDP) Act 2023 |
| Regulatory | Must comply with IT Act 2000 and its amendments |
| Regulatory | Players under 18 require parental/guardian consent |
| Budget | Phase 1 budget ceiling: ₹1.5 Crore (to be confirmed by sponsor) |
| Timeline | Phase 1 Go-Live target: 12 months from project kick-off |
| Technical | Core backend must be deployable on Azure India (Central India region) for data residency |
| Operational | Platform must support offline-first mode for mobile app during live tournaments |

---

## 7. Business Rules

| ID | Rule |
|---|---|
| BR1 | A tournament must have at least 4 registered players to generate a draw |
| BR2 | Seeding positions must follow BWF seeding guidelines (top 4 players seeded in opposite halves for Knockout) |
| BR3 | A player can compete in a maximum of 3 events per tournament (Singles + Doubles + Mixed) |
| BR4 | Rankings points are calculated using BWF performance points methodology adapted for domestic tiers (District, State, National) |
| BR5 | A match walkover counts as a 2-0 score win for ranking points calculation |
| BR6 | Age categories: U-11, U-13, U-15, U-17, U-19, Open, Senior, Masters (40+), Super Senior (50+) |
| BR7 | Mixed Doubles requires one male and one female player per team |
| BR8 | Court allocation must ensure no player plays two matches simultaneously |
| BR9 | Swiss format requires an even number of rounds; players cannot be paired against the same opponent twice |
| BR10 | Certificates are issued only after a tournament is marked "Completed" by the organizer |
| BR11 | A player's ranking is frozen if they have not participated in any ranked event in the past 12 months |
| BR12 | AI recommendations must include a disclaimer: "Not a substitute for professional medical advice" |
| BR13 | Minor player data (under 18) requires verified parental consent before activation |
| BR14 | A Team vs Team doubles fixture requires a minimum of 4 players per team (to form at least 2 doubles pairs per team) |
| BR15 | Teams may have unequal player counts; the scheduling algorithm must still ensure fair match distribution across both teams |
| BR16 | Fair play rule: each player's total match count across all rounds must not differ by more than 1 from any other player in the same team |
| BR17 | Within a team, the same two players should not be paired as doubles partners again until all other possible unique partnerships in that team have been used at least once |
| BR18 | No player may appear in more than one match within the same round (no simultaneous conflicts) |
| BR19 | The maximum supported team size is 20 players per team; larger rosters require splitting into sub-groups |
| BR20 | Total matches generated = C(N_A, 2) × C(N_B, 2) for a full fixture (all Team A pairs vs all Team B pairs); the system must also offer a condensed "fair rounds" schedule as an alternative |
| BR21 | Team vs Team fixtures are not ranked events by default; the organizer can optionally enable ranking points for Team vs Team matches |
| BR22 | Default points scheme for Team vs Team: Win = 2 pts, Draw = 1 pt, Loss = 0 pts; the organizer may customise points values before the fixture begins but not after the first score is entered |
| BR23 | A match result is one of: Win (Team A pair), Win (Team B pair), Draw, or Not Played (walkover/retired); a result cannot be changed once the round is marked complete unless an admin unlocks it with a reason recorded in the audit log |
| BR24 | Individual player points are derived by crediting each member of a winning/drawing pair with the same points as the pair; a player who did not participate in a match receives 0 pts for that match |
| BR25 | Win percentage for a doubles pair = (Wins ÷ Matches Played) × 100; Win percentage for an individual player = (Matches Won ÷ Matches Played as any member of winning pair) × 100; both are rounded to one decimal place |
| BR26 | A leaderboard must rank pairs by: 1st points total, 2nd win percentage, 3rd number of matches played (descending); ties broken by head-to-head result if applicable |
| BR27 | Stats (points table, win %, charts) are recalculated in real-time after each match result is saved; a manual "Recalculate" trigger is available in case of bulk data import |
| BR28 | A match has one of three completion states: **Pending** (no result entered), **Completed** (result saved), or **Not Played** (walkover/absent); a round is considered complete only when every match in it is either Completed or Not Played |
| BR29 | A fixture is considered fully complete only when all rounds are complete; the organizer must explicitly click "Mark Fixture as Finished" to lock the fixture and trigger final certificate/report generation |
| BR30 | The fixture progress indicator must always show: total matches, completed matches, pending matches, and overall completion percentage = (Completed + Not Played) ÷ Total × 100 |
| BR31 | Pending matches are highlighted visually (e.g., yellow row background or ⏳ icon) to draw the organizer's attention; completed matches use a neutral/green state; Not Played use a strikethrough |
| BR32 | A "Pending Only" filter view must be available so the organizer can see all remaining matches across all rounds without scrolling through completed ones |
| BR33 | The player search must match on partial, case-insensitive text against any player name in either team; results must show all fixture rows where that player appears (as a member of any pair, in any round) |
| BR34 | Search results must remain live-filtered as the user types (debounced at 300ms); clearing the search box restores the full fixture view |

---

## 8. Functional Requirements

### Priority Legend: M = Must Have | S = Should Have | C = Could Have | W = Won't Have (Phase 1)

---

### 8.1 Tournament Management

| ID | Requirement | Priority | Acceptance Criteria |
|---|---|---|---|
| FR1.1 | Organizer can create a tournament with name, dates, venue, format, age categories, and events | M | Tournament created and visible on dashboard within 5 seconds |
| FR1.2 | Organizer can manage player registrations (accept, reject, waitlist) | M | Registration status updated in real-time; player notified automatically |
| FR1.3 | System generates fixtures automatically based on selected format | M | Draw generated in < 30 seconds for up to 512 players |
| FR1.4 | Organizer can manually adjust draw (swap, replace) with audit trail | M | All manual changes logged with timestamp and user |
| FR1.5 | Court allocation is automated and conflict-free | M | No player scheduled on two courts simultaneously |
| FR1.6 | Referee/umpire assignment is supported per match | S | Umpire receives assignment notification; can accept/decline |
| FR1.7 | Live score entry by umpire or organizer | M | Score updates reflected within 3 seconds for all viewers |
| FR1.8 | Tournament can be published, unpublished, completed, or cancelled | M | Status change triggers appropriate notifications to all registered players |
| FR1.9 | Organizer can generate PDF certificates for winners, runners-up, participants | M | Certificate generated within 10 seconds; downloadable as PDF |
| FR1.10 | Organizer can publish tournament results publicly | S | Public results page accessible without login |

### 8.2 Fixture Engine

| ID | Requirement | Priority | Acceptance Criteria |
|---|---|---|---|
| FR2.1 | Support Knockout (Single Elimination) format | M | Bracket correctly structured with byes for non-power-of-2 draws |
| FR2.2 | Support Round Robin format | M | All match pairings generated; tie-breaking by points, then head-to-head |
| FR2.3 | Support Swiss System format | M | Pairings recalculated after each round; no repeat pairings |
| FR2.4 | Support Hybrid (Round Robin groups → Knockout) format | M | Groups seeded correctly; top N from each group advance |
| FR2.5 | Support seeding in all formats | M | Top seeded players placed in opposite halves/brackets |
| FR2.6 | Handle walkovers and retirements in draws | M | Draw automatically updated; opponent advances |

### 8.3 Player Module

| ID | Requirement | Priority | Acceptance Criteria |
|---|---|---|---|
| FR3.1 | Player can register with name, DOB, gender, state, district, contact | M | Profile created; email/phone verified via OTP |
| FR3.2 | Player can view full match history across all tournaments | M | History loads in < 2 seconds; filterable by year, format, event |
| FR3.3 | Player can view their ranking at district, state, national level | M | Rankings refresh within 24 hours of a tournament completion |
| FR3.4 | Player can view statistics dashboard (win %, rally length, serve patterns) | S | At least 5 statistical dimensions displayed |
| FR3.5 | Player receives personalized training recommendations | S | Recommendations generated after 5+ matches on the platform |
| FR3.6 | Player can view assigned nutrition guidance | S | Nutrition plan linked to player age, weight, and training intensity |
| FR3.7 | Player can register for tournaments through the platform | M | Registration confirmed with unique entry number |

### 8.4 Coach Module

| ID | Requirement | Priority | Acceptance Criteria |
|---|---|---|---|
| FR4.1 | Coach can create a roster of players under their supervision | M | Players appear in coach's dashboard after accepting invite |
| FR4.2 | Coach can monitor player match history and statistics | M | Same data as player view, across all players in roster |
| FR4.3 | Coach can assign training plans to individual players or groups | M | Player notified of new training assignment; plan visible in their app |
| FR4.4 | Coach can upload video clips and annotate for player review | C | Video upload up to 500MB; player notified; annotations rendered on playback |
| FR4.5 | Coach can submit feedback notes on individual players | M | Notes time-stamped; player can view but not edit |
| FR4.6 | Coach can view AI-generated playing style analysis per player | S | Analysis updated after each tournament |

### 8.5 Parent Module

| ID | Requirement | Priority | Acceptance Criteria |
|---|---|---|---|
| FR5.1 | Parent can register and link to a minor player's account (with consent flow) | M | Parent account linked only after player consent or admin approval |
| FR5.2 | Parent can view child's tournament schedule and upcoming matches | M | Schedule visible with court number and estimated time |
| FR5.3 | Parent can view child's match results in real-time | M | Results pushed via notification within 30 seconds of score entry |
| FR5.4 | Parent can view child's training plan assigned by coach | S | Read-only view of training plan |
| FR5.5 | Parent cannot modify any player data | M | All editing controls hidden/disabled for parent role |

### 8.6 Umpire / Referee Module

| ID | Requirement | Priority | Acceptance Criteria |
|---|---|---|---|
| FR6.1 | Umpire can register and maintain a profile with certification level | S | Profile includes BWF certification ID field |
| FR6.2 | Umpire receives match assignment notifications | M | Notification sent 24 hours before and 1 hour before match |
| FR6.3 | Umpire can enter live scores from mobile during a match | M | Score updates visible to all users in < 3 seconds |
| FR6.4 | Umpire can flag incidents (injury, protest, walkover) during a match | S | Flag logged with timestamp; organizer notified immediately |

### 8.7 Notifications

| ID | Requirement | Priority | Acceptance Criteria |
|---|---|---|---|
| FR7.1 | Push notifications for tournament registration confirmations | M | Notification delivered within 30 seconds of trigger |
| FR7.2 | Email notifications for tournament draws published | M | Email sent within 2 minutes of draw publication |
| FR7.3 | SMS notifications for match schedule and live score alerts | S | SMS delivered via Indian SMS gateway (Twilio/MSG91) |
| FR7.4 | In-app notification centre with read/unread state | M | All notifications persisted for 90 days |
| FR7.5 | Notification preferences configurable per user | S | Users can opt out of each notification type individually |

### 8.8 Reporting & Analytics

| ID | Requirement | Priority | Acceptance Criteria |
|---|---|---|---|
| FR8.1 | Organizer can export tournament results as PDF and Excel | M | Export completes in < 15 seconds |
| FR8.2 | Admin can view platform-wide usage reports (MAU, tournaments, matches) | M | Report dashboard updates daily |
| FR8.3 | Academy can view batch performance reports across all their players | S | Report exportable as PDF/Excel |
| FR8.4 | Player can download their own match statistics report | S | One-click PDF download from player dashboard |

---

### 8.9 Team vs Team Doubles Fixture Generator

#### Overview

This module enables a user (organizer, coach, or any logged-in user) to create a **Team A vs Team B** doubles match schedule. The user provides two team names and their respective player lists. The system computes all valid doubles pairings within each team and generates a fair, conflict-free round-by-round schedule where every player gets approximately equal playing time.

#### User Flow Diagram

```
[Enter Team A Name]
    └─→ [Add Team A Players: name 1 ... name N_A]
[Enter Team B Name]
    └─→ [Add Team B Players: name 1 ... name N_B]
[Select Schedule Mode: Full Fixture | Fair Rounds]
[Optional: Set Courts Available | Match Duration | Start Time]
    └─→ [Click: Generate Schedule]
             ├─→ Summary Card (total matches, rounds, players)
             ├─→ Round-by-Round Fixture Table
             ├─→ Player Match Count Matrix (fairness view)
             ├─→ All Possible Fixtures toggle
             └─→ [Export PDF / Excel] | [Share Link / WhatsApp]
```

#### Pairing Algorithm (Fair Rounds Mode)

For Team A with N_A players and Team B with N_B players:

1. **Generate within-team pairs:** All combinations C(N, 2) = N×(N-1)/2 for each team.
2. **Round construction:** In each round, divide each team into simultaneous doubles pairs such that:
   - No player appears more than once per round.
   - Maximum `floor(N/2)` simultaneous matches per round.
3. **Fairness rotation:** Use a round-robin rotation algorithm (analogous to 1-factorization for complete graphs) so that over all rounds each player:
   - Partners with every other team-mate the same number of times (±1).
   - Faces every opposition pair the same number of times (±1).
4. **Cross-team scheduling:** Pair Team A pairs against Team B pairs each round using the same round-robin rotation, ensuring no cross-team pair repeats until all combinations are exhausted.
5. **Stop condition:** Either all possible unique cross-team matchups are exhausted (Full Fixture) or a user-defined number of rounds is completed (Fair Rounds).

#### Worked Example — 8 Players per Team

| Input | Value |
|---|---|
| Team A Players | A1, A2, A3, A4, A5, A6, A7, A8 |
| Team B Players | B1, B2, B3, B4, B5, B6, B7, B8 |
| Pairs per team | C(8,2) = 28 |
| Full fixture matches | 28 × 28 = 784 |
| Fair Rounds (each player plays ~7 matches) | ~14 rounds × 4 courts = 56 matches |
| Matches per player (Fair Rounds) | 7 (±1) |

**Sample Round 1 (4 courts):**

| Court | Team A Pair | vs | Team B Pair |
|---|---|---|---|
| Court 1 | A1 & A2 | vs | B1 & B2 |
| Court 2 | A3 & A4 | vs | B3 & B4 |
| Court 3 | A5 & A6 | vs | B5 & B6 |
| Court 4 | A7 & A8 | vs | B7 & B8 |

**Sample Round 2 (rotated):**

| Court | Team A Pair | vs | Team B Pair |
|---|---|---|---|
| Court 1 | A1 & A3 | vs | B2 & B4 |
| Court 2 | A2 & A5 | vs | B1 & B6 |
| Court 3 | A4 & A7 | vs | B3 & B8 |
| Court 4 | A6 & A8 | vs | B5 & B7 |

*(Actual rounds are system-generated; this is illustrative)*

#### Functional Requirements

| ID | Requirement | Priority | Acceptance Criteria |
|---|---|---|---|
| FR9.1 | User can enter Team A name and add player names one-by-one or via bulk paste (comma or newline separated) | M | Players parsed and listed correctly; duplicates auto-detected and flagged |
| FR9.2 | User can enter Team B name and add player names with the same input options | M | Same as FR9.1 |
| FR9.3 | System validates minimum 4 players per team before enabling schedule generation | M | Error message shown if < 4 players in either team; Generate button disabled |
| FR9.4 | System validates maximum 20 players per team and prompts to split into sub-groups if exceeded | M | Warning shown at 20 players; input blocked at 21 |
| FR9.5 | User can select schedule mode: **Full Fixture** (all pairs vs all pairs) or **Fair Rounds** (equal-play rotation) | M | Mode selector visible before generation; default is Fair Rounds |
| FR9.6 | User can optionally set number of available courts (1–10) | S | Court count used to determine simultaneous matches per round; defaults to floor(N/2) |
| FR9.7 | User can optionally set estimated match duration (in minutes) and tournament start time | S | System calculates estimated end time and per-match start times |
| FR9.8 | Clicking "Generate Schedule" produces a round-by-round fixture table within 3 seconds | M | Schedule generated in < 3 seconds for up to 20 players per team |
| FR9.9 | Generated schedule displays a **Summary Card** showing: total matches, number of rounds, players per team, matches per player | M | Summary visible at top of results before the round table |
| FR9.10 | Generated schedule displays a **Round-by-Round Fixture Table** with columns: Round, Court, Team A Pair, vs, Team B Pair, Estimated Time | M | All rounds displayed; scrollable on mobile |
| FR9.11 | Generated schedule displays a **Player Match Count Matrix** (fairness view) showing each player and their match count, partner frequency, and opponent frequency | M | All player counts visible; max-min difference ≤ 1 validated by system |
| FR9.12 | User can toggle between Fair Rounds view and All Possible Fixtures view | S | Toggle available in UI; All Fixtures view shows full C(N_A,2) × C(N_B,2) table |
| FR9.13 | User can edit player names inline after generation and regenerate | M | Regeneration preserves schedule mode and court settings |
| FR9.14 | User can remove a player from a team and regenerate schedule | M | Schedule recalculated; removed player no longer appears in any fixture |
| FR9.15 | User can swap two players between teams (e.g., late team change) and regenerate | S | Swap action available via drag-and-drop or dropdown; schedule updates immediately |
| FR9.16 | Generated schedule can be exported as PDF (printable A4 format, one round per section) | M | PDF export available within 5 seconds; correctly formatted for printing |
| FR9.17 | Generated schedule can be exported as Excel/CSV (one row per match, columns: Round, Court, A_Player1, A_Player2, B_Player1, B_Player2, Time) | M | Excel export available within 5 seconds; importable into Google Sheets |
| FR9.18 | User can share the schedule via a public link or WhatsApp deep-link without requiring recipients to log in | S | Shared link opens a read-only schedule page; link expires after 30 days |
| FR9.19 | A "Save Fixture" option allows an organizer to save the Team vs Team fixture as part of a tournament record | S | Saved fixtures appear under the tournament's event list |
| FR9.20 | User can print score sheets per round (one sheet per court showing player names and blank score boxes) | S | Printable score sheet PDF generated per round |

---

#### Score Entry & Results Tracking

| ID | Requirement | Priority | Acceptance Criteria |
|---|---|---|---|
| FR9.21 | Each fixture row in the Round-by-Round table has an inline **Result** control: [Team A Win \| Draw \| Team B Win] selectable via toggle buttons | M | Result saved in < 1 second; row visually updates (colour-coded: green win, grey draw, red loss for each side) |
| FR9.22 | Each fixture row also has optional **Score fields** (e.g., 21–18, 21–15) for entering the game scores in standard badminton format (best of 3 games) | S | Score fields accept integers 0–30; system validates no game score below 21 unless it is a winning game with ≥ 2 point lead or a retirement |
| FR9.23 | If a match was not played (walkover or absent pair), user can mark it **Not Played**; the row is visually struck through and excluded from win % calculations | M | Not Played matches excluded from all stats; total matches-played count updated accordingly |
| FR9.24 | Organizer or admin can unlock a completed round to edit a result; unlock action requires a mandatory reason field; change is recorded in audit log | M | Reason field enforced (min 10 chars); audit log entry created with old result, new result, user, timestamp |
| FR9.25 | Organizer can configure the **Points Scheme** (Win pts, Draw pts, Loss pts) before the first result is entered; a warning is shown if any results already exist | M | Points scheme saved per fixture; fields default to 2/1/0; scheme locked after first result is entered unless all results are cleared |
| FR9.26 | A **Live Points Table** panel is visible alongside or below the fixture rounds, updating in real-time as results are entered, showing: Pair Name, Played, Won, Drawn, Lost, Points, Win% | M | Table updates within 2 seconds of each result save; sortable by any column |

---

#### Per-Pair Statistics Dashboard

| ID | Requirement | Priority | Acceptance Criteria |
|---|---|---|---|
| FR9.27 | System displays a **Pairs Stats Table** with columns: Pair (Player 1 & Player 2), Team, Played, Won, Lost, Drawn, Points, Win % | M | Table populated once any result is entered; Win % computed per BR25 |
| FR9.28 | A **Bar Chart — Win Count by Pair** shows each doubles pair on the X-axis and their win count on the Y-axis; Team A pairs use one colour, Team B pairs another | M | Chart renders in < 2 seconds; pairs sorted by descending wins; hovering a bar shows tooltip with exact Played/Won/Lost/Points |
| FR9.29 | A **Win Percentage Bar Chart** (horizontal) ranks all pairs from highest to lowest Win %, with a vertical reference line at the tournament average Win % | S | Reference line labelled "Avg: XX%"; chart refreshes on each result entry |
| FR9.30 | A **Pie Chart — Match Share** shows proportion of total matches won by Team A vs Team B across all pairs | S | Pie chart shows two segments (Team A total wins vs Team B total wins); labelled with counts and percentages |
| FR9.31 | A **Leaderboard Card** highlights the top-3 performing pairs with rank badge (🥇🥈🥉), pair name, points, and Win %; visible at the top of the stats panel | M | Leaderboard updates in real-time; tie-breaking applied per BR26 |

---

#### Per-Player Statistics Dashboard

| ID | Requirement | Priority | Acceptance Criteria |
|---|---|---|---|
| FR9.32 | System displays a **Player Stats Table** aggregating across all pairs each player appeared in: Player Name, Team, Matches Played, Wins, Losses, Draws, Total Points, Win % | M | Table lists every player from both teams; calculated per BR24 and BR25 |
| FR9.33 | A **Player Win % Bar Chart** shows each player on the X-axis and their individual Win % on the Y-axis; bars colour-coded by team | M | Chart renders in < 2 seconds; hovering shows exact stats per player |
| FR9.34 | A **Player Points Progression Line Chart** shows how each player's cumulative points grew round-by-round across the fixture | S | One line per player; lines toggleable (click player name in legend to hide/show); X-axis = round number, Y-axis = cumulative points |
| FR9.35 | A **Player Participation Heatmap** (matrix of Player × Round) shows which round each player participated in, colour intensity proportional to match count in that round (0 = white, 1 = light, 2+ = dark) | C | Heatmap renders for up to 40 players (20 per team); exportable as PNG |

---

#### Export & Share Stats

| ID | Requirement | Priority | Acceptance Criteria |
|---|---|---|---|
| FR9.36 | All stats tables (Points Table, Pairs Stats, Player Stats) are exportable as a combined Excel workbook with one sheet per table | M | Export completes in < 5 seconds; columns match table headers exactly |
| FR9.37 | All charts (bar, pie, line, heatmap) are individually downloadable as PNG images | S | PNG download button present on each chart; image resolution minimum 1200×800px |
| FR9.38 | The full Stats Dashboard (tables + charts) is accessible via the shared public link without login; stats update live if the link is open during score entry | S | Shared stats page shows read-only dashboard; no authentication required; data refreshes every 10 seconds via polling or WebSocket |

---

#### Schedule Completion Tracking

| ID | Requirement | Priority | Acceptance Criteria |
|---|---|---|---|
| FR9.39 | Each match row in the fixture table displays a **Status Badge**: 🟡 Pending \| ✅ Completed \| ⬜ Not Played | M | Status badge auto-updates when a result is entered or cleared; colour conventions applied per BR31 |
| FR9.40 | A **Fixture Progress Bar** is displayed at the top of the fixture view showing: total matches, completed count, pending count, and a percentage completion progress bar | M | Progress bar updates within 1 second of each result save; formula per BR30 |
| FR9.41 | A **Round-Level Completion Indicator** is shown next to each round header: ✅ All Done \| ⏳ N Pending \| 🔒 Locked | M | Round marked ✅ automatically when all its matches are Completed or Not Played; round marked 🔒 when organizer explicitly locks it |
| FR9.42 | A **"Pending Matches" filter toggle** button lets the organizer view only matches with status = Pending across all rounds on a single scrollable page | M | Filter activated in < 1 second; shows round label above each pending match for context; count badge on button shows number of pending matches |
| FR9.43 | When viewing Pending Matches, each row shows: Round number, Court, Team A Pair, Team B Pair, Scheduled Time, and a quick-action Result entry inline | M | Organizer can enter result directly from the filtered view without navigating to the full round |
| FR9.44 | A **Completed Matches** filter toggle shows only rows with status = Completed or Not Played; useful for reviewing results without distraction from pending matches | S | Filter activated in < 1 second; shows result and score for each row |
| FR9.45 | The **Summary Card** (FR9.9) is updated to include completion stats: Total: N \| ✅ Completed: N \| ⏳ Pending: N \| ⬜ Not Played: N \| Progress: XX% | M | Summary Card values update in real-time alongside the progress bar |
| FR9.46 | When all matches are complete, the system prompts the organizer with a **"Mark Fixture as Finished"** button; clicking it locks all results, freezes stats, and makes the fixture read-only | M | Confirmation dialog shown before locking; once locked, all edit controls disabled; locked fixture displays a 🏆 Finished banner |
| FR9.47 | Organizer can export a **Pending Matches Report** (PDF or Excel) listing all unplayed matches with court and scheduled time, for use as a physical checklist on tournament day | S | Export completes in < 5 seconds; PDF is A4 printable with checkboxes next to each pending match row |

---

#### Player Search

| ID | Requirement | Priority | Acceptance Criteria |
|---|---|---|---|
| FR9.48 | A **Search Bar** labelled "Search player..." is permanently visible at the top of the fixture view (above the round tabs and filter toggles) | M | Search bar visible on web and mobile without scrolling |
| FR9.49 | As the user types a player name (min 1 character), the fixture table **live-filters** to show only rows where that player appears in any pair (Team A or Team B), across all rounds | M | Results appear within 300ms of keystroke (debounced per BR34); partial and case-insensitive matching applied per BR33 |
| FR9.50 | Each search result row displays: Round, Court, **Player's Pair** (searched player highlighted/bolded), vs, **Opponent Pair**, Status Badge, Score (if entered), Scheduled Time | M | Searched player's name rendered in bold/highlight colour within the pair cell; all other columns present |
| FR9.51 | Search results are grouped by status section: first **Pending** matches for the player, then **Completed**, then **Not Played**; each section has a collapsible header with count | M | Sections expand/collapse on click; default state is all expanded |
| FR9.52 | A **"Playing With"** sub-section in search results shows all unique partners the searched player has been or will be paired with across all rounds, with win/loss record per partnership | S | Partnership list shows: Partner Name, Matches Together, Won, Lost, Win% |
| FR9.53 | A **"Playing Against"** sub-section shows all opponent pairs the searched player has faced or is scheduled to face, with result per encounter | S | Opponent pair list shows: Opponent Pair, Round, Result, Score |
| FR9.54 | Searching a player who does not exist in either team shows a **"No player found"** empty state with suggestion to check spelling | M | Empty state message shown within 300ms; no error thrown |
| FR9.55 | The search bar is accessible on the shared public link view (FR9.38) so spectators can look up a player's schedule without logging in | S | Search functional on read-only shared page; same live-filter behaviour |

---

#### Completion & Search UI Wireframe Description

```
┌─────────────────────────────────────────────────────────────────────┐
│  🔍 Search player...  [Arjun                    ] ✕                │
│  Filters: [ ⏳ Pending (12) ]  [ ✅ Completed (44) ]  [ All ]      │
├─────────────────────────────────────────────────────────────────────┤
│  FIXTURE PROGRESS                                                   │
│  ████████████████████░░░░░░░░░░  56 matches │ ✅ 44 │ ⏳ 12 │ 79% │
├─────────────────────────────────────────────────────────────────────┤
│  SEARCH RESULTS FOR: "Arjun"  (16 matches found)                   │
│                                                                     │
│  ⏳ PENDING (3 matches)                              [▼ Collapse]   │
│  ┌───────┬───────┬──────────────────┬────┬────────────────┬──────┐ │
│  │ Round │ Court │  Team A Pair     │ vs │  Team B Pair   │Status│ │
│  ├───────┼───────┼──────────────────┼────┼────────────────┼──────┤ │
│  │  Rd 8 │   2   │ **Arjun** & Priya│ vs │ Rohit & Meera  │  ⏳  │ │
│  │  Rd11 │   1   │ **Arjun** & Karan│ vs │ Dev & Sneha    │  ⏳  │ │
│  │  Rd13 │   3   │ **Arjun** & Raj  │ vs │ Pooja & Ravi   │  ⏳  │ │
│  └───────┴───────┴──────────────────┴────┴────────────────┴──────┘ │
│                                                                     │
│  ✅ COMPLETED (12 matches)                           [▼ Collapse]   │
│  ┌───────┬───────┬──────────────────┬────┬────────────────┬──────┐ │
│  │  Rd 1 │   1   │ **Arjun** & Priya│ vs │ Rohit & Sneha  │ ✅ W │ │
│  │  Rd 2 │   2   │ **Arjun** & Dev  │ vs │ Kavya & Arun   │ ✅ L │ │
│  │  ...  │  ...  │      ...         │ vs │     ...        │  ... │ │
│  └───────┴───────┴──────────────────┴────┴────────────────┴──────┘ │
│                                                                     │
│  👥 PLAYING WITH (partners)                          [▼ Collapse]   │
│   Priya Mehta   — 5 matches together │ W:4  L:1  Win%: 80.0%       │
│   Karan Nair    — 4 matches together │ W:2  L:2  Win%: 50.0%       │
│   Dev Singh     — 4 matches together │ W:3  L:1  Win%: 75.0%       │
│   Raj Kumar     — 3 matches together │ W:2  L:1  Win%: 66.7%       │
│                                                                     │
│  🎯 PLAYING AGAINST (opponents)                      [▼ Collapse]   │
│   Rohit & Sneha  — Rd 1: ✅ Won 21-18 │ Rd 8: ⏳ Pending           │
│   Dev & Meera    — Rd 3: ✅ Lost 15-21│ Rd11: ⏳ Pending           │
│   ...                                                               │
├─────────────────────────────────────────────────────────────────────┤
│  ROUND 5  ⏳ 2 Pending                                              │
│  ┌───────┬──────────────────┬──────────────┬──────────────┬──────┐ │
│  │ Court │  Team A Pair     │    Result    │ Team B Pair  │Status│ │
│  ├───────┼──────────────────┼──────────────┼──────────────┼──────┤ │
│  │   1   │ Arjun & Priya    │ [A✓][ ][ B]  │ Rohit & Sneha│  ⏳  │ │
│  │   2   │ Karan & Dev      │ ✅ A Won     │ Meera & Pooja│  ✅  │ │
│  │   3   │ Raj & Sunita     │ ✅ B Won     │ Kavya & Arun │  ✅  │ │
│  │   4   │ Amit & Neha      │ [— Not Played│ Ravi & Sita  │  ⬜  │ │
│  └───────┴──────────────────┴──────────────┴──────────────┴──────┘ │
│  [ 🔒 Lock Round ]            [ 📄 Export Pending Matches Report ]  │
└─────────────────────────────────────────────────────────────────────┘
```

---

#### Stats Dashboard UI Wireframe Description

```
┌─────────────────────────────────────────────────────────────────────┐
│  FIXTURE TABLE  (Round 1 of 14)                                     │
├──────┬──────────────────┬────────────────┬──────────────────┬───────┤
│Court │  Team A Pair     │    Result      │  Team B Pair     │ Score │
├──────┼──────────────────┼────────────────┼──────────────────┼───────┤
│  1   │ Arjun & Priya    │ [A✓] [ ] [B]  │ Rohit & Sneha    │21-18  │
│  2   │ Karan & Dev      │ [A] [ ] [B✓]  │ Meera & Pooja    │15-21  │
│  3   │ Raj & Sunita     │ [A] [✓] [B]   │ Kavya & Arun     │19-19  │
│  4   │ Amit & Neha      │ [—Not Played—] │ Ravi & Sita      │  —    │
└──────┴──────────────────┴────────────────┴──────────────────┴───────┘
[ ← Prev Round ]  Round 1/14  [ Next Round → ]   [ 🔓 Unlock Round ]

┌─────────────────────────────────────────────────────────────────────┐
│  LIVE POINTS TABLE              Points Scheme: Win=2 Draw=1 Loss=0  │
├──────────────────────┬──────┬──────┬──────┬──────┬────────┬────────┤
│  Pair                │ Team │  P   │  W   │  L   │  Pts   │  Win%  │
├──────────────────────┼──────┼──────┼──────┼──────┼────────┼────────┤
│  🥇 Arjun & Priya   │  A   │  7   │  5   │  2   │  10    │ 71.4%  │
│  🥈 Rohit & Sneha   │  B   │  7   │  5   │  2   │  10    │ 71.4%  │
│  🥉 Karan & Dev     │  A   │  6   │  4   │  2   │   8    │ 66.7%  │
│  ...                 │  ..  │  ..  │  ..  │  ..  │  ..    │  ..    │
└──────────────────────┴──────┴──────┴──────┴──────┴────────┴────────┘

┌─────────────────────────────────────────────────────────────────────┐
│  PAIRS STATS                         [📊 Export Excel] [🖼 PNG]     │
│                                                                     │
│  Bar Chart — Wins by Pair                                           │
│   Arjun&Priya   ████████████████  5  (Team A — blue)               │
│   Rohit&Sneha   ████████████████  5  (Team B — orange)             │
│   Karan&Dev     █████████████     4                                 │
│   Meera&Pooja   ██████████        3                                 │
│   ...                                                               │
│                                                                     │
│  Pie — Team Win Share                                               │
│        ┌──────────────────────────┐                                 │
│        │   Team A  52% ████       │                                 │
│        │   Team B  48% ███        │                                 │
│        └──────────────────────────┘                                 │
├─────────────────────────────────────────────────────────────────────┤
│  PLAYER STATS                        [📊 Export Excel] [🖼 PNG]     │
│                                                                     │
│  Player Win % (Horizontal Bar)                                      │
│   Arjun  ─────────────────────── 75.0%  ← Team A (blue)           │
│   Priya  ───────────────────────  75.0%                             │
│   Rohit  ─────────────────────── 71.4%  ← Team B (orange)         │
│   Sneha  ─────────────────────── 71.4%                             │
│   ─ ─ ─ ─ ─ ─ ─ ─ ─ Avg: 62% ─ ─ ─ ─ ─ ─ ─ ─ ─                  │
│                                                                     │
│  Points Progression (Line Chart, round-by-round)                   │
│   Pts▲                                                              │
│   10 │     ╭──────╮  Arjun                                         │
│    8 │  ╭──╯      ╰─ Rohit                                         │
│    6 │╭─╯            Karan                                         │
│    0 └────────────────────────→ Round                              │
│                         [Toggle Players in Legend]                  │
└─────────────────────────────────────────────────────────────────────┘
[ 📄 Export All Stats (Excel) ]  [ 🔗 Share Stats Link ]  [ 🖼 Download Charts ]
```

#### UI Wireframe Description

```
┌─────────────────────────────────────────────────────────────────────┐
│  TEAM vs TEAM DOUBLES FIXTURE GENERATOR                            │
├─────────────────────────────────────────────────────────────────────┤
│  TEAM A NAME: [____________]    TEAM B NAME: [____________]         │
│                                                                     │
│  Add Players (Team A)           Add Players (Team B)                │
│  [ + Add One by One ]           [ + Add One by One ]               │
│  [ 📋 Paste List ]              [ 📋 Paste List ]                   │
│                                                                     │
│  1. Arjun Singh      ✕          1. Rohit Verma        ✕            │
│  2. Priya Mehta      ✕          2. Sneha Patil        ✕            │
│  3. Karan Nair       ✕          3. Dev Kumar          ✕            │
│  ... (up to 20)                 ... (up to 20)                      │
│                                                                     │
│  Schedule Mode: ○ Fair Rounds  ○ Full Fixture                      │
│  Courts Available: [4 ▼]   Match Duration: [30 min ▼]              │
│                                                                     │
│              [ GENERATE SCHEDULE  ▶ ]                               │
├─────────────────────────────────────────────────────────────────────┤
│  SUMMARY                                                           │
│  Total Matches: 56  │  Rounds: 14  │  Matches/Player: 7 (±1)       │
├─────────────────────────────────────────────────────────────────────┤
│  ROUND 1                                                           │
│  ┌────────┬─────────────────┬────┬──────────────────┬───────────┐  │
│  │ Court  │  Team A Pair    │ vs │  Team B Pair     │  Time     │  │
│  ├────────┼─────────────────┼────┼──────────────────┼───────────┤  │
│  │  1     │ Arjun & Priya   │ vs │ Rohit & Sneha    │  09:00    │  │
│  │  2     │ Karan & Dev_A   │ vs │ Dev_B & Meera    │  09:00    │  │
│  │  3     │ Raj & Sunita    │ vs │ Kavya & Arun     │  09:00    │  │
│  │  4     │ Amit & Neha     │ vs │ Pooja & Ravi     │  09:00    │  │
│  └────────┴─────────────────┴────┴──────────────────┴───────────┘  │
│                                                   [ Next Round ▶ ] │
├─────────────────────────────────────────────────────────────────────┤
│  [ 📄 Export PDF ]  [ 📊 Export Excel ]  [ 🔗 Share Link ]          │
│  [ 👁 Fairness View ]  [ 📋 All Fixtures ]  [ 🖨 Print Score Sheets ]│
└─────────────────────────────────────────────────────────────────────┘
```

---

## 9. Non-Functional Requirements

| ID | Category | Requirement | Target |
|---|---|---|---|
| NFR1 | Availability | Platform uptime SLA | 99.5% monthly (excluding planned maintenance) |
| NFR2 | Performance | Fixture generation time | < 30 seconds for up to 512-player draw |
| NFR3 | Performance | API response time (P95) | < 500ms for standard queries |
| NFR4 | Performance | Page load time | < 3 seconds on 4G mobile connection |
| NFR5 | Scalability | Concurrent users | Support 10,000 concurrent users at launch; 100,000+ within 24 months |
| NFR6 | Security | Authentication | OAuth2 / JWT; MFA available for organizer and admin roles |
| NFR7 | Security | Authorization | Role-based access control enforced at API layer |
| NFR8 | Security | Data encryption | TLS 1.3 in transit; AES-256 at rest |
| NFR9 | Security | OWASP Top 10 | All API endpoints reviewed against OWASP Top 10 before release |
| NFR10 | Data Privacy | DPDP Act 2023 | Consent management, data erasure, data portability implemented |
| NFR11 | Data Privacy | Minor data protection | Parental consent required; minor data stored separately with enhanced controls |
| NFR12 | Auditability | Audit logs | All create/update/delete actions logged with user ID, timestamp, IP |
| NFR13 | Backup & Recovery | RTO (Recovery Time Objective) | < 4 hours |
| NFR14 | Backup & Recovery | RPO (Recovery Point Objective) | < 1 hour |
| NFR15 | Backup & Recovery | Database backups | Daily full backup + hourly incremental; 30-day retention |
| NFR16 | Offline | Mobile offline mode | Core tournament scoring and schedule viewable offline; sync on reconnect |
| NFR17 | Localization | Language support | English and Hindi in Phase 1; Tamil, Telugu, Kannada in Phase 2 |
| NFR18 | Accessibility | Web accessibility | WCAG 2.1 Level AA compliance for web frontend |
| NFR19 | Device Support | Browser support | Chrome 90+, Firefox 88+, Edge 90+, Safari 14+ |
| NFR20 | Device Support | Mobile OS | Android 8.0+, iOS 14+ |
| NFR21 | Maintainability | Code coverage | Minimum 70% unit test coverage for backend APIs |
| NFR22 | Compliance | Data residency | All personal data stored in Azure Central India region |

---

## 10. Role & Permissions Matrix

| Feature | System Admin | Organizer | Coach | Player | Parent | Umpire |
|---|---|---|---|---|---|---|
| Create Tournament | ✓ | ✓ | — | — | — | — |
| Manage Registrations | ✓ | ✓ | — | — | — | — |
| Generate / Edit Draw | ✓ | ✓ | — | — | — | — |
| Enter Live Scores | ✓ | ✓ | — | — | — | ✓ |
| View All Matches | ✓ | ✓ (own tournaments) | ✓ (own players) | ✓ (own matches) | ✓ (child's) | ✓ (assigned) |
| View Rankings | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Manage Player Profile | ✓ | — | — | ✓ (own) | — | — |
| Assign Training Plans | ✓ | — | ✓ | — | — | — |
| View Training Plans | ✓ | — | ✓ | ✓ | ✓ (read) | — |
| Upload Video | ✓ | — | ✓ | ✓ (own) | — | — |
| View AI Analysis | ✓ | ✓ | ✓ | ✓ (own) | — | — |
| Generate Certificates | ✓ | ✓ | — | — | — | — |
| View Platform Reports | ✓ | — | — | — | — | — |
| Manage Users | ✓ | — | — | — | — | — |
| Configure Notifications | ✓ | ✓ (own events) | — | ✓ (own prefs) | ✓ (own prefs) | ✓ (own prefs) |
| Create Team vs Team Fixture | ✓ | ✓ | ✓ | ✓ | — | — |
| Generate / Export Team Schedule | ✓ | ✓ | ✓ | ✓ | — | — |
| View Team Fixture (shared link) | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Save Team Fixture to Tournament | ✓ | ✓ | — | — | — | — |
| Enter / Edit Match Results (Team Fixture) | ✓ | ✓ | ✓ | — | — | ✓ |
| View Live Points Table & Stats Dashboard | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Configure Points Scheme | ✓ | ✓ | — | — | — | — |
| Unlock & Correct a Completed Round | ✓ | ✓ | — | — | — | — |
| Export Stats (Excel / PNG Charts) | ✓ | ✓ | ✓ | ✓ | — | — |
| View Fixture Progress / Completion Status | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Use Player Search Bar | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Lock / Mark Round as Complete | ✓ | ✓ | — | — | — | — |
| Mark Fixture as Finished | ✓ | ✓ | — | — | — | — |
| Export Pending Matches Report | ✓ | ✓ | ✓ | — | — | — |

---

## 11. Data Requirements

### 11.1 Key Entities

| Entity | Key Attributes |
|---|---|
| User | UserID, Name, Email, Phone, Role, DOB, Gender, State, AadhaarHash (optional), ConsentDate |
| Player | PlayerID, UserID, DistrictRanking, StateRanking, NationalRanking, CategoryAge, AcademyID |
| Tournament | TournamentID, OrganizerID, Name, StartDate, EndDate, Venue, Format, Status, Events[] |
| Match | MatchID, TournamentID, Player1ID, Player2ID, CourtID, ScheduledTime, Score, Status, UmpireID |
| TeamFixture | FixtureID, TeamAName, TeamBName, TeamAPlayers[], TeamBPlayers[], ScheduleMode, CourtsAvailable, MatchDurationMins, Rounds[], CreatedBy, CreatedAt, ShareToken, IsRanked, PointsScheme{Win,Draw,Loss} |
| TeamMatchResult | ResultID, FixtureID, Round, Court, TeamAPair[Player1,Player2], TeamBPair[Player1,Player2], Result(A_Win\|B_Win\|Draw\|Not_Played), Status(Pending\|Completed\|Not_Played), ScoreA, ScoreB, EnteredBy, EnteredAt, LastModifiedBy, LastModifiedAt |
| FixtureProgress | ProgressID, FixtureID, TotalMatches, CompletedMatches, NotPlayedMatches, PendingMatches, CompletionPct, IsFinished, FinishedAt, FinishedBy |
| PairStats | StatsID, FixtureID, TeamName, Player1, Player2, Played, Won, Lost, Drawn, Points, WinPct, LastUpdated |
| PlayerStats | StatsID, FixtureID, TeamName, PlayerName, Played, Won, Lost, Drawn, Points, WinPct, LastUpdated |
| TrainingPlan | PlanID, CoachID, PlayerID, Sessions[], AssignedDate, CompletionStatus |
| NutritionPlan | PlanID, PlayerID, CalorieTarget, MealPlan, CreatedBy, ValidFrom, ValidTo |
| Certificate | CertificateID, TournamentID, PlayerID, Type, IssuedDate, DigitalSignature |

### 11.2 Data Retention Policy

| Data Type | Retention Period |
|---|---|
| Match history & tournament results | Indefinite (public record) |
| User personal data | Duration of account + 2 years post-deletion |
| Audit logs | 7 years |
| Notification logs | 90 days |
| Session tokens | 24 hours (sliding window) |
| Video uploads | 12 months (then archived or deleted per user preference) |

### 11.3 Data Privacy & Compliance

- All users must complete explicit consent at registration (DPDP Act 2023 compliant).
- Minor players (under 18) require verifiable parental consent before data activation.
- Users have the right to request data export (portability) and account deletion (erasure) from account settings.
- Aadhaar-based verification is optional and never stored in plain text; only a one-way hash is retained.
- Third-party analytics tools (e.g., Google Analytics) must be configured with IP anonymization.

---

## 12. Integration Requirements

| Integration | Purpose | Priority | Proposed Provider |
|---|---|---|---|
| Payment Gateway | Tournament registration fees, platform subscriptions | M | Razorpay (India-first) |
| SMS Gateway | Match alerts, OTP verification | M | MSG91 or Twilio |
| Email Service | Notifications, certificates, password resets | M | SendGrid or AWS SES |
| Push Notifications | Mobile alerts for scores, schedules | M | Firebase Cloud Messaging (FCM) |
| Video Storage | Coach video uploads and AI analysis | C | Azure Blob Storage |
| AI/ML Platform | Model training and inference | S | Azure ML / custom hosted |
| BFI / State Association | Rankings feed synchronization | S | REST API (to be defined with BFI) |
| Calendar Integration | Export match schedule to Google/Apple Calendar | C | iCal standard |
| Social Sharing | Share results/achievements to WhatsApp, Instagram | C | Native share APIs |

---

## 13. Monetization & Business Model

### 13.1 Revenue Streams

| Stream | Model | Target Segment |
|---|---|---|
| Organizer Subscription | Monthly/Annual SaaS subscription (Freemium: up to 2 tournaments/month free; Pro: ₹999/month) | Tournament Organizers |
| Per-Tournament Fee | ₹2–₹5 per registered player per tournament (above free tier) | Tournament Organizers |
| Academy Plan | ₹4,999/month for up to 50 players + 5 coaches | Academies |
| Premium Player Plan | ₹199/month for AI analysis, advanced training plans | Players |
| Sponsor Placement | Banner and logo placement on tournament pages | Sponsors (Phase 2) |
| White-Label Licensing | Offer platform to State Badminton Associations | BFI / State Bodies |

### 13.2 Financial Targets

| Milestone | Target |
|---|---|
| Break-even | Month 24 post-launch |
| Year 1 MRR | ₹10 Lakh/month |
| Year 2 MRR | ₹40 Lakh/month |

---

## 14. AI Features — Detailed Requirements

| Feature | Input Data Required | Output | Accuracy Target | Priority |
|---|---|---|---|---|
| Playing Style Analysis | Shot patterns, rally data, match history (min 10 matches) | Style classification (Attacker, Defender, All-rounder, Net-rusher) with confidence score | > 75% user-rated accuracy | S |
| Personalized Training Plans | Style analysis, current ranking, injury history, available training hours | Weekly training schedule with drill types, duration, intensity | 80% coach-approved plans per audit | S |
| Match Outcome Prediction | Head-to-head history, rankings, recent form (last 10 matches) | Win probability % with confidence interval | Calibration error < 15% | C |
| Video Analysis | Uploaded video (MP4, max 500MB) | Shot detection, footwork heatmap, error pattern overlay | Detect major shot types with > 80% precision | C |
| Opponent Analysis | Opponent match history, style classification | Weaknesses, preferred patterns, recommended counter-tactics | Qualitative report reviewed by coach | C |
| Injury Risk Prediction | Match frequency, travel schedule, training load, self-reported fatigue | Risk score (Low/Medium/High) with recommended rest days | False negative rate < 10% | S |
| AI Coach Chatbot | Natural language query + player context | Drill suggestions, rule explanations, motivational guidance | Response relevant to query > 90% of the time | C |

**All AI features must include:**
- A clear disclaimer: *"AI-generated recommendations are for guidance only and do not substitute professional coaching or medical advice."*
- Explainability: The system must provide a brief rationale for each recommendation.
- User feedback loop: Users can rate recommendations (thumbs up/down) to improve model accuracy.

---

## 15. Technology Stack

| Layer | Technology | Rationale |
|---|---|---|
| Web Frontend | React 18+ (TypeScript) | Component-based, strong ecosystem |
| Mobile App | Flutter 3+ | Single codebase for iOS and Android |
| Desktop App | Electron | Cross-platform using web codebase |
| Backend API | .NET 9 (ASP.NET Core) | High performance, strong typing |
| Database | PostgreSQL 16 | ACID compliance, JSON support for flexible schemas |
| Caching | Redis 7 | Session management, real-time leaderboard, fixture caching |
| Search | Elasticsearch (Phase 2) | Player and tournament search at scale |
| Message Queue | Azure Service Bus | Async notification dispatch, score updates |
| Object Storage | Azure Blob Storage | Video, images, certificates, reports |
| Containerization | Docker + Kubernetes (AKS) | Scalability, CI/CD |
| Cloud | Microsoft Azure (Central India region) | Data residency compliance |
| CI/CD | GitHub Actions | Automated build, test, deploy pipelines |
| Monitoring | Azure Monitor + Application Insights | Uptime, performance, error tracking |
| Auth | Azure AD B2C / custom JWT | OAuth2, social login, MFA |

---

## 16. Risk Register

| ID | Risk | Category | Likelihood | Impact | Mitigation |
|---|---|---|---|---|---|
| R1 | Tournament organizers resist adopting new software | Adoption | High | High | Offer free tier, onboarding workshops, WhatsApp support group |
| R2 | BWF rule changes invalidate fixture engine logic | Regulatory | Low | High | Design rules engine as configurable; subscribe to BWF rule update notifications |
| R3 | DPDP Act enforcement requires platform redesign | Compliance | Medium | High | Involve legal counsel from Day 1; build privacy-by-design |
| R4 | AI model accuracy below user expectations causing mistrust | Technical | Medium | High | Set clear accuracy expectations in UX; provide feedback loop; use confidence scores |
| R5 | Scalability issues on tournament day (spike traffic) | Technical | Medium | High | Load test to 10x expected peak; auto-scaling on AKS; Redis caching |
| R6 | SMS/payment gateway downtime during tournament | Dependency | Medium | High | Use multiple gateway fallbacks; graceful degradation mode |
| R7 | Minor player data mishandled or exposed | Security | Low | Critical | Strict RBAC, data segregation, parental consent enforcement, regular audits |
| R8 | Low AI training data in early phase | Technical | High | Medium | Use synthetic data augmentation; partner with academies for historical data |
| R9 | Competitor launches similar India-focused product | Market | Medium | Medium | Accelerate Phase 1 launch; build community lock-in early |
| R10 | Key technical talent departure during development | Resource | Medium | High | Document all architecture decisions; cross-train team; maintain runbooks |

---

## 17. Success Metrics

| Metric | 6-Month Target | 12-Month Target | 18-Month Target |
|---|---|---|---|
| Registered Players | 5,000 | 25,000 | 50,000 |
| Tournament Organizers | 50 | 250 | 500 |
| Tournaments Hosted | 100 | 800 | 2,000 |
| Matches Managed | 5,000 | 40,000 | 100,000 |
| Monthly Active Users (MAU) | 2,000 | 12,000 | 25,000 |
| AI Recommendations Rated Useful | — | 75% | 80% |
| Organizer NPS Score | — | > 40 | > 50 |
| Platform Uptime | 99.5% | 99.5% | 99.5% |
| DPDP Compliance Audit | Pass | Pass | Pass |

---

## 18. Release Roadmap

### Phase 1 — Tournament Engine (Target: Month 1–6)

| Milestone | Target Month |
|---|---|
| Architecture finalized, dev environment ready | Month 1 |
| User auth, roles, basic player profiles | Month 2 |
| Tournament creation + fixture engine (Knockout, Round Robin) | Month 3 |
| Swiss + Hybrid formats, seeding, court allocation | Month 4 |
| Live scoring, notifications (push + email), certificates | Month 5 |
| Rankings engine, reporting, beta launch with 3 pilot organizers | Month 6 |

### Phase 2 — AI Training & Coach Dashboard (Target: Month 7–12)

| Milestone | Target Month |
|---|---|
| Coach dashboard, training plan assignment | Month 7 |
| AI Style Analyzer v1, basic training recommendations | Month 8 |
| Diet & Recovery module, nutrition guidance | Month 9 |
| Video upload + annotations | Month 10 |
| Injury Risk Prediction model (v1) | Month 11 |
| Public launch (all features), Academy plan, payment integration | Month 12 |

### Phase 3 — Video Analytics & Advanced AI (Target: Month 13–18)

| Milestone | Target Month |
|---|---|
| AI Video Analysis (shot detection, heatmaps) | Month 14 |
| Opponent Analysis module | Month 15 |
| Sponsor Portal, White-label licensing | Month 16 |
| Wearable device integration (Garmin, Fitbit) | Month 17 |
| BWF Global API integration (if available) | Month 18 |

---

## 19. Approval

| Role | Name | Signature | Date | Status |
|---|---|---|---|---|
| Product Owner | | | | Pending |
| Business Sponsor | | | | Pending |
| Technical Lead | | | | Pending |
| Legal / Compliance | | | | Pending |
| Data Protection Officer | | | | Pending |

---

## 20. Glossary

| Term | Definition |
|---|---|
| BWF | Badminton World Federation — the international governing body for badminton |
| BFI | Badminton Federation of India — the national governing body |
| Fixture | The scheduled matchups/draw for a tournament |
| Knockout (Single Elimination) | A tournament format where a player is eliminated after one loss |
| Round Robin | Each player/pair plays against every other participant |
| Swiss System | Players are paired with opponents of similar score each round; no elimination |
| Hybrid Format | Groups stage (Round Robin) followed by a Knockout stage |
| Seeding | Pre-ranking top players to prevent them from meeting in early rounds |
| Walkover (W/O) | A win awarded when an opponent fails to appear or withdraws |
| MAU | Monthly Active Users |
| RBAC | Role-Based Access Control |
| DPDP Act | Digital Personal Data Protection Act, India, 2023 |
| RTO | Recovery Time Objective — maximum acceptable downtime |
| RPO | Recovery Point Objective — maximum acceptable data loss window |
| SaaS | Software as a Service |
| NPS | Net Promoter Score — a customer satisfaction metric |
| MoSCoW | Must Have, Should Have, Could Have, Won't Have — priority classification method |
| WCAG | Web Content Accessibility Guidelines |
| OTP | One-Time Password — used for phone/email verification |
| JWT | JSON Web Token — used for stateless authentication |
| Team vs Team Format | A doubles tournament format where two pre-defined teams compete; all doubles pairs from Team A play against all (or a fair subset of) doubles pairs from Team B |
| Fair Rounds Mode | A schedule generation mode that produces a minimal number of rounds where every player participates in an approximately equal number of matches (max difference of 1) |
| Full Fixture Mode | A schedule generation mode that lists every possible Team A pair vs Team B pair combination — C(N_A,2) × C(N_B,2) total matches |
| C(N,2) | Combination formula: number of unique pairs from N players = N × (N-1) / 2 |
| 1-Factorization | A mathematical technique for partitioning all edges of a complete graph into perfect matchings; used to schedule round-robin doubles fixtures without conflicts |
| Fair Pairing Algorithm | The system algorithm that assigns doubles partnerships and cross-team pairings such that each player appears in an equal number of matches per round and repeat partnerships are minimized |
| Score Sheet | A printable per-court form showing the two doubles pairs and blank score fields for the umpire or players to fill in |
| Points Scheme | The configurable points awarded per match outcome (default: Win=2, Draw=1, Loss=0); set by the organizer before the first result is entered |
| Win Percentage (Pair) | (Wins ÷ Matches Played) × 100 for a doubles pair across all rounds of a Team vs Team fixture |
| Win Percentage (Player) | (Matches Won ÷ Matches Played as a member of any pair) × 100 for an individual player |
| Points Table | A live-updating leaderboard showing all doubles pairs ranked by points, then Win %, then matches played |
| Pairs Stats Dashboard | The visual analytics panel showing bar charts, pie chart, and leaderboard for all doubles pairs in a Team vs Team fixture |
| Player Stats Dashboard | The visual analytics panel showing Win % bar chart and cumulative points line chart for every individual player in a Team vs Team fixture |
| Points Progression Chart | A round-by-round line chart showing each player's cumulative points growing over the rounds; used to visualise momentum and consistency |
| Player Participation Heatmap | A grid (Player × Round) colour-coded by match count per round; shows which players were active in which rounds |
| Not Played | A match status indicating neither pair competed (walkover, absence, or cancellation); excluded from all Win % and points calculations |
| Pending (match status) | A match that has been scheduled but has not yet had a result entered; shown with 🟡 / ⏳ indicator throughout the fixture |
| Completed (match status) | A match for which a valid result (A Win, B Win, or Draw) has been saved; shown with ✅ indicator |
| Fixture Progress Bar | A visual bar at the top of the fixture view showing the overall completion percentage: (Completed + Not Played) ÷ Total Matches × 100 |
| Round Completion Indicator | A per-round badge showing whether a round has pending matches, is fully done, or has been manually locked by the organizer |
| Pending Matches Filter | A one-click toggle that narrows the fixture view to show only matches not yet played, across all rounds, grouped for easy action |
| Mark Fixture as Finished | An organizer action that permanently locks a fixture once all matches are complete; triggers final stats freeze and enables certificate generation |
| Player Search Bar | A live-filter search input on the fixture page; accepts any partial player name and instantly shows all fixture rows, partner history, and opponent history for the matched player |
| Playing With (search result section) | A grouped list in search results showing every partner the searched player has been paired with, and the win/loss record for each partnership |
| Playing Against (search result section) | A grouped list in search results showing every opponent pair the searched player has faced or is scheduled to face, with round and result detail |

---

*Document ends. For queries, contact the ShuttleIQ Product Team.*
