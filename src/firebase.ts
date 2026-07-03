// Firebase is loaded lazily so the first paint never waits for the SDK.
import type { FirebaseApp } from 'firebase/app';
import type { Firestore } from 'firebase/firestore';
import type { Auth } from 'firebase/auth';

let appPromise: Promise<FirebaseApp> | null = null;

function getApp(): Promise<FirebaseApp> {
  if (!appPromise) {
    appPromise = (async () => {
      const { initializeApp, getApps, getApp: getExisting } = await import('firebase/app');
      const firebaseConfig = {
        apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
        authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
        projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
        storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
        appId: import.meta.env.VITE_FIREBASE_APP_ID,
      };
      return getApps().length ? getExisting() : initializeApp(firebaseConfig);
    })();
  }
  return appPromise;
}

export async function getDb(): Promise<Firestore> {
  const app = await getApp();
  const { getFirestore } = await import('firebase/firestore');
  return getFirestore(app);
}

export async function getAuthInstance(): Promise<Auth> {
  const app = await getApp();
  const { getAuth } = await import('firebase/auth');
  return getAuth(app);
}
