# 🔐 Admin Setup Guide — Badminton Starz

How admin access works, how to create the **first** admin, and how to add or remove **more** admins later.

> **Keep this doc.** Adding a new admin in the future = just **Part 3** (create user) + **Part 4** (grant admin). The one-time setup in Parts 1–2 is already done after the first time.

---

## How it works (the model)

- The **dashboard is public read-only** — anyone can view tournaments, schedules, live results, and stats without logging in.
- **Only admins can write** (create tournaments, score matches, edit, delete, finish, back up).
- A user is an admin **if and only if** a document exists at `admins/{their-uid}` in Firestore.
- This is enforced **server-side** by Firestore Security Rules ([`frontend/firestore.rules`](./frontend/firestore.rules)) — not just hidden in the UI, so it can't be bypassed.

**Two pieces are always required for an admin:**
1. A **Firebase Auth user** (email + password) → this is what they log in with.
2. An **`admins/{uid}` document** → this is what grants the admin role.

A login without the `admins` doc is just a viewer. The doc without a matching Auth user does nothing.

Project: **`badminton-starz`** · Console: https://console.firebase.google.com/project/badminton-starz

---

## Part 1 — Enable Email/Password sign-in *(one-time)*

1. Firebase Console → **Authentication** → **Sign-in method**.
2. Click **Email/Password** → toggle **Enable** → **Save**.

Skip this if Authentication already lists Email/Password as enabled.

---

## Part 2 — Deploy the security rules *(one-time)*

The rules make "admins only can write" real. From the `frontend/` folder:

```bash
npm install -g firebase-tools     # first time only
firebase login                    # first time only
firebase deploy --only firestore:rules
```

This deploys [`frontend/firestore.rules`](./frontend/firestore.rules). Re-run it only if you change that file.

> ⚠️ **Bootstrap order matters.** Create at least one `admins/{uid}` doc (Parts 3–4) **before or right after** deploying, or no one will be able to write to the database.

---

## Part 3 — Create the user account *(per admin)*

1. Firebase Console → **Authentication** → **Users** → **Add user**.
2. Enter an **email** and a **password** (min 6 characters).
3. Click **Add user**.
4. In the Users list, **copy the User UID** for that new user (a long string like `a1B2c3D4e5...`). You'll need it in Part 4.

This email + password is what the person types into the app's **Admin sign in** dialog.

---

## Part 4 — Grant the admin role *(per admin)*

1. Firebase Console → **Firestore Database**.
2. If the **`admins`** collection doesn't exist yet: **Start collection** → Collection ID: `admins`.
   - If it already exists, open it and click **Add document**.
3. **Document ID:** paste the **User UID** from Part 3 (must match exactly).
4. Add one field for readability, e.g. field `email` (string) = the person's email. *(The fields don't matter to the app — only the document's existence at that UID does.)*
5. **Save**.

Done. That user is now an admin.

---

## Using it in the app

1. Open the app → click **Admin sign in** (top-left of the home screen).
2. Enter the email + password from Part 3.
3. On success: the badge flips to **Admin ✓ / Sign out**, the create form and all edit controls appear.

Sign out from the same top-left control. Non-admins (or signed-out users) only ever see the read-only dashboard.

---

## Removing an admin

- **Revoke admin role only** (keep the login): delete the `admins/{uid}` document. They become a viewer.
- **Remove entirely:** also delete the user under **Authentication → Users**.

## Listing current admins

Open the **`admins`** collection in Firestore — each document ID is an admin's UID (the `email` field, if you added it, tells you who).

---

## Quick troubleshooting

| Symptom | Cause / Fix |
|---|---|
| Sign-in error `auth/operation-not-allowed` | Part 1 not done — enable Email/Password. |
| Signed in but still read-only (no create form) | Missing/typo'd `admins/{uid}` doc. The doc ID must equal the user's **UID**, not their email. |
| Signed in as admin but writes fail / permission denied | Rules deployed but no matching `admins` doc, or rules target a different project. Re-check Part 4 and `firebase deploy`. |
| `auth/invalid-credential` | Wrong email/password. |

---

## Local testing without Firebase (dev only)

For local UI testing you don't need any of the above: run `npm run dev` and use the **`🧪 DEV · Viewer / ADMIN`** toggle (bottom-left). It flips the admin UI on/off via `localStorage` and is compiled **out** of production builds (`import.meta.env.DEV`), so it never ships. It does **not** test the server-side rules — only real Firebase auth + deployed rules do that.

---

*Related: [`README.md`](./README.md) · rules in [`frontend/firestore.rules`](./frontend/firestore.rules) · auth logic in [`frontend/src/contexts/AuthContext.tsx`](./frontend/src/contexts/AuthContext.tsx).*
