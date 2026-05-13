import { initializeApp, getApps, type FirebaseOptions } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Firebase config
// Falls back to these defaults if VITE_FIREBASE_* env vars are missing.
// (measurementId is optional for Firebase JS SDK v7.20+)
const firebaseConfig: FirebaseOptions = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyByBmmu4UYtUP4sJFS9dT0Ok0biWvX-CVk",
  authDomain:
    import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "poly-market-a38c5.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "poly-market-a38c5",
  storageBucket:
    import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ||
    "poly-market-a38c5.firebasestorage.app",
  messagingSenderId:
    import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "18649586872",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:18649586872:web:76ce0c8cb93a48f640684d",
  measurementId: "G-4HF4VRR505",
};

// Avoid crashing the whole app when Firebase env vars are missing/invalid.
// This allows the UI (including favicon requests) to function.
let firebaseApp: ReturnType<typeof initializeApp> | undefined;

try {
  const hasRequired =
    !!firebaseConfig.apiKey &&
    !!firebaseConfig.authDomain &&
    !!firebaseConfig.projectId &&
    !!firebaseConfig.storageBucket &&
    !!firebaseConfig.messagingSenderId &&
    !!firebaseConfig.appId;

  if (hasRequired) {
    firebaseApp = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
  }
} catch (e) {
  // eslint-disable-next-line no-console
  console.warn("Firebase initialization failed; continuing without Firebase.", e);
  firebaseApp = undefined;
}

let authInstance: ReturnType<typeof getAuth> | null = null;
let dbInstance: ReturnType<typeof getFirestore> | null = null;

if (firebaseApp) {
  try {
    authInstance = getAuth(firebaseApp);
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn("Firebase Auth init failed; continuing without auth.", e);
    authInstance = null;
  }

  try {
    dbInstance = getFirestore(firebaseApp);
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn("Firebase Firestore init failed; continuing without db.", e);
    dbInstance = null;
  }
}

export const auth = authInstance as any;
export const db = dbInstance as any;




// Usage:
// import { auth, db } from '@/integrations/firebase/client';

