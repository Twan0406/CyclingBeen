// Firebase is loaded lazily so the first paint never waits for the SDK.
// Progress is stored in localStorage (see ClimbsContext); Firestore sync will
// be wired back in together with authentication for the social features.
import type { Firestore } from 'firebase/firestore';

let dbPromise: Promise<Firestore> | null = null;

export function getDb(): Promise<Firestore> {
  if (!dbPromise) {
    dbPromise = (async () => {
      const { initializeApp, getApps, getApp } = await import('firebase/app');
      const { getFirestore } = await import('firebase/firestore');
      const firebaseConfig = {
        apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
        authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
        projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
        storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
        appId: import.meta.env.VITE_FIREBASE_APP_ID,
      };
      const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
      return getFirestore(app);
    })();
  }
  return dbPromise;
}
