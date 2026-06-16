# 🏸 Badminton Starz

A fast, offline-capable **Team vs Team doubles fixture generator and live scoreboard** for badminton. Enter two teams, generate a fair, conflict-free match schedule, score matches live, and watch the stats and charts update in real time.

Badminton Starz is the first shipped module of the larger **ShuttleIQ** product vision (see [`ShuttleIQ_BRD_Enhanced.md`](./ShuttleIQ_BRD_Enhanced.md)). It implements **Section 8.9 — Team vs Team Doubles Fixture Generator** of that BRD. See [`ROADMAP.md`](./ROADMAP.md) for what's built vs. what's planned.

---

## ✨ Features

### Fixture generation
- **Two teams, 4–20 players each**, added one-by-one or pasted as a comma/newline list (duplicates auto-flagged).
- **Two schedule modes:**
  - **Full Fixture** — every Team A pair plays every Team B pair (`C(Nₐ,2) × C(N_b,2)` matches).
  - **Fair Rounds** — a 1-factorization rotation so every player gets roughly equal playing time and rotating partners.
- **Court-aware scheduling** — no player is ever booked into two simultaneous matches; matches per round are capped by available courts.
- **Summary** of total rounds, total matches, and the matches-per-player fairness range.

### Live scoring
- Inline per-match result entry: **Team A Win / Draw / Team B Win / Not Played**.
- Optional game scores (e.g. `21–18`), a **🔴 Live (in-progress)** state, and per-match delete.
- Status filters: **All / 🔴 Live / ⏳ Pending / ✅ Done**.
- **Pair Search** — find every match for a player, or only matches where two specific players are partnered together (with name highlighting).
- Progress banner, team scoreboard, and **"Mark Fixture as Finished"** to lock results.

### Stats & charts (Recharts)
- **Live points table** with a configurable Win/Draw/Loss scheme.
- Per-pair and per-player tables (Played / Won / Lost / Drawn / Points / Win %).
- Charts: **Wins by Pair**, **Win % by Pair**, **Team Win Share** (pie), **Player Win %**, and **Points Progression** (round-by-round line chart with toggleable players).

### Access control
- **Admin vs. viewer roles** backed by **Firebase Authentication** + **Firestore Security Rules**.
- The **dashboard is public read-only** — anyone can browse tournaments, schedules, live results, and stats without logging in.
- **Only a signed-in admin** can create tournaments, enter/edit results, score matches, lock/finish fixtures, delete, and back up/restore. Enforcement is **server-side** (Firestore rules), not just UI hiding.

### Data & export
- **Firestore cloud sync** with **dirty-tracking** — editing one result writes one document, not the whole fixture. Optimistic local updates keep the UI instant.
- **Tournament history** side panel (ongoing / finished / not-started).
- **CSV/Excel export:** full schedule, combined stats workbook, and a tournament-day **Pending Matches checklist**.
- **JSON backup / restore** of all data.
- **Print / PDF** the schedule.
- **Offline-first PWA** + installable **Android app** (Capacitor).

---

## 🧰 Tech stack

| Layer | Choice |
|---|---|
| UI | React 19 + TypeScript |
| Build | Vite 8 |
| Styling | Tailwind CSS 3 |
| Charts | Recharts |
| Icons | lucide-react |
| Data | Firebase Firestore (with `persistentLocalCache` for offline) |
| Mobile | Capacitor 8 (Android) |
| PWA | vite-plugin-pwa / Workbox |

There is **no custom backend** — all logic (fixture generation, stats, search) runs client-side in `src/services/`, and persistence is Firestore directly from the browser.

---

## 🚀 Getting started

```bash
cd frontend
npm install
npm run dev          # http://localhost:5175
```

### Firebase config
Cloud sync requires a Firebase project. Edit [`frontend/src/firebase.ts`](./frontend/src/firebase.ts) with your own project config (Firebase Console → Project Settings → Your apps → Web app → SDK setup → Config), then create a Firestore database with `fixtures` and `matches` collections.

> ⚠️ The committed config points at a demo project. Replace it with your own before deploying.

### Access control setup (admin role)

> 📖 **Full step-by-step guide (incl. adding more admins later): [`ADMIN_SETUP.md`](./ADMIN_SETUP.md)**

Editing is gated by **Firebase Auth + Firestore Security Rules**. To enable it:

1. **Enable Email/Password sign-in:** Firebase Console → Authentication → Sign-in method → enable *Email/Password*.
2. **Create the admin user:** Authentication → Users → *Add user* (email + password).
3. **Grant admin rights:** copy that user's **UID**, then in Firestore create a collection **`admins`** and add a document whose **ID is that UID** (any fields, e.g. `{ email: "you@example.com" }`).
4. **Deploy the rules** (from `frontend/`):
   ```bash
   npm i -g firebase-tools
   firebase login
   firebase deploy --only firestore:rules
   ```
   The rules live in [`frontend/firestore.rules`](./frontend/firestore.rules): public read, admin-only write.

In the app, click **Admin sign in** (top-left of the home screen) to unlock editing. Everyone else sees the read-only dashboard.

### Build

```bash
npm run build        # production web build → dist/
npm run preview      # preview the production build
```

### Android (Capacitor)

```bash
npm run build:android   # build web + sync + open Android Studio
```

---

## 📁 Project structure

```
frontend/src/
├── pages/
│   └── FixtureGenerator.tsx   # main screen (create, schedule, stats, history, export)
├── components/
│   ├── TeamInput.tsx          # create-fixture form (admin)
│   ├── AllMatchesList.tsx     # match table + inline scoring (canEdit gated)
│   ├── StatsPanel.tsx         # charts + stats tables
│   ├── TeamScoreBoard.tsx     # head-to-head team banner
│   ├── ProgressBanner.tsx     # completion progress
│   ├── TournamentHistory.tsx  # saved-fixtures list
│   └── LoginModal.tsx         # admin sign-in
├── contexts/
│   └── AuthContext.tsx        # Firebase Auth + isAdmin state
├── services/
│   ├── fixtureAlgorithm.ts    # 1-factorization + full-fixture scheduling
│   ├── statsService.ts        # pair/player/team stats, progression, search
│   └── exportService.ts       # CSV/Excel export (schedule, stats, pending)
├── api/
│   └── fixturesApi.ts         # Firestore CRUD + dirty-match sync
├── firebase.ts                # Firebase init (Firestore + Auth)
└── types/index.ts             # shared TypeScript types

frontend/firestore.rules       # security rules: public read, admin-only write
frontend/firebase.json         # firebase deploy config
```

---

## 📄 Related docs
- [`ROADMAP.md`](./ROADMAP.md) — built vs. planned feature gap analysis (mapped to BRD FR IDs).
- [`ShuttleIQ_BRD_Enhanced.md`](./ShuttleIQ_BRD_Enhanced.md) — full business requirements for the wider ShuttleIQ platform.
