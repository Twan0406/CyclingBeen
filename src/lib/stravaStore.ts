import { getDb } from '../firebase';
import type { StravaTokens } from './strava';

// The refresh token is stored in a PRIVATE subcollection that only the owner
// can read (see Firestore rules). The public profile flag lives on the user doc
// so friends can see "connected to Strava".

export async function saveConnection(uid: string, tokens: StravaTokens) {
  const db = await getDb();
  const { doc, setDoc } = await import('firebase/firestore');
  await setDoc(
    doc(db, 'users', uid, 'private', 'strava'),
    { refresh_token: tokens.refresh_token },
    { merge: true },
  );
  const name = tokens.athlete
    ? `${tokens.athlete.firstname ?? ''} ${tokens.athlete.lastname ?? ''}`.trim()
    : 'Strava';
  await setDoc(
    doc(db, 'users', uid),
    {
      strava: {
        athleteId: tokens.athlete?.id ?? null,
        athleteName: name,
        profile: tokens.athlete?.profile ?? null,
        connectedAt: Date.now(),
      },
    },
    { merge: true },
  );
}

export async function loadPublicStrava(
  uid: string,
): Promise<{ athleteName: string; profile: string | null } | null> {
  const db = await getDb();
  const { doc, getDoc } = await import('firebase/firestore');
  const snap = await getDoc(doc(db, 'users', uid));
  const d = snap.exists() ? (snap.data().strava as { athleteName?: string; profile?: string }) : null;
  return d ? { athleteName: d.athleteName ?? 'Strava', profile: d.profile ?? null } : null;
}

export async function getRefreshToken(uid: string): Promise<string | null> {
  const db = await getDb();
  const { doc, getDoc } = await import('firebase/firestore');
  const snap = await getDoc(doc(db, 'users', uid, 'private', 'strava'));
  return snap.exists() ? ((snap.data().refresh_token as string) || null) : null;
}

export async function updateRefreshToken(uid: string, token: string) {
  const db = await getDb();
  const { doc, setDoc } = await import('firebase/firestore');
  await setDoc(doc(db, 'users', uid, 'private', 'strava'), { refresh_token: token }, { merge: true });
}
