// ─── Auth Context ──────────────────────────────────────────────────────────────
// Provides the current Firebase user and whether they are an admin.
//
// Admin model (no backend / Cloud Functions required):
//   • A user is an admin iff a document exists at  admins/{their-uid}.
//   • Firestore security rules enforce the same check for all writes, so this is
//     real server-side enforcement — the client flag is only for showing/hiding UI.
//
// Bootstrapping the first admin (one-time, in the Firebase console):
//   1. Authentication → Users → Add user (email + password).
//   2. Copy that user's UID.
//   3. Firestore → start collection "admins" → add a document with that UID as the
//      document ID (any fields, e.g. { email: "you@example.com" }).

import { createContext, useContext, useEffect, useState } from 'react';
import {
  onAuthStateChanged, signInWithEmailAndPassword, signOut, type User,
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

interface AuthState {
  user: User | null;
  isAdmin: boolean;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  // ─── Dev-only testing helpers (no effect in production builds) ───
  isDev: boolean;
  devAdmin: boolean;
  setDevAdmin: (v: boolean) => void;
}

const AuthContext = createContext<AuthState>({
  user: null,
  isAdmin: false,
  loading: true,
  signIn: async () => {},
  logout: async () => {},
  isDev: false,
  devAdmin: false,
  setDevAdmin: () => {},
});

// DEV ONLY: lets you toggle the admin UI locally without Firebase auth set up.
// import.meta.env.DEV is true under `npm run dev` and false in production builds,
// so this whole path compiles out of the shipped app.
const IS_DEV = import.meta.env.DEV;

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [realAdmin, setRealAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [devAdmin, setDevAdminState] = useState(
    () => IS_DEV && localStorage.getItem('bs_devAdmin') === '1'
  );

  useEffect(() => {
    return onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        try {
          const snap = await getDoc(doc(db, 'admins', u.uid));
          setRealAdmin(snap.exists());
        } catch {
          setRealAdmin(false);
        }
      } else {
        setRealAdmin(false);
      }
      setLoading(false);
    });
  }, []);

  const signIn = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email.trim(), password);
  };

  const logout = async () => {
    await signOut(auth);
  };

  const setDevAdmin = (v: boolean) => {
    if (!IS_DEV) return;
    localStorage.setItem('bs_devAdmin', v ? '1' : '0');
    setDevAdminState(v);
  };

  // Real admin (Firestore-backed) OR the dev override.
  const isAdmin = realAdmin || (IS_DEV && devAdmin);

  return (
    <AuthContext.Provider value={{ user, isAdmin, loading, signIn, logout, isDev: IS_DEV, devAdmin, setDevAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);
