// ─── Firebase Configuration ───────────────────────────────────────────────────
// Replace the values below with YOUR Firebase project config.
// Get it from: https://console.firebase.google.com
//   → Your Project → Project Settings → Your apps → Web app → SDK setup → Config

import { initializeApp } from 'firebase/app';
import { initializeFirestore, persistentLocalCache } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// ▼▼▼ PASTE YOUR FIREBASE CONFIG HERE ▼▼▼
const firebaseConfig = {
  apiKey:            "AIzaSyC2wqB_zGT7j3FkAu-fsTwt1w0LFsncabs",
  authDomain:        "badminton-starz.firebaseapp.com",
  projectId:         "badminton-starz",
  storageBucket:     "badminton-starz.firebasestorage.app",
  messagingSenderId: "1050595337518",
  appId:             "1:1050595337518:web:b9ccf6113e90e4a3b1c6bf",
};
// ▲▲▲ PASTE YOUR FIREBASE CONFIG HERE ▲▲▲

const app = initializeApp(firebaseConfig);

// Firestore with offline persistence (works without internet, auto-syncs when online)
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache(),
});

// Firebase Authentication — used to identify the admin.
// Anyone can read data (public dashboard); only signed-in admins can write.
// Enforcement lives in firestore.rules; the client UI mirrors it for UX.
export const auth = getAuth(app);
