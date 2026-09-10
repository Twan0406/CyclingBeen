import { getDb } from '../firebase';
import type { ClimbTime } from '../context/ClimbsContext';

export interface Rider {
  uid: string;
  displayName: string | null;
  photoURL: string | null;
  completed: string[];
  climbTimes: Record<string, ClimbTime>;
  friends: string[];
  stravaName: string | null;
  /** Destination ids this rider has marked as ridden. */
  visited: string[];
  /** Climb and destination ids saved as a goal. */
  wishlist: string[];
}

export async function loadRiders(): Promise<Rider[]> {
  const db = await getDb();
  const { collection, getDocs } = await import('firebase/firestore');
  const snap = await getDocs(collection(db, 'users'));
  return snap.docs.map((d) => {
    const data = d.data() as Record<string, unknown>;
    const strava = data.strava as { athleteName?: string } | undefined;
    return {
      uid: d.id,
      displayName: (data.displayName as string) ?? null,
      photoURL: (data.photoURL as string) ?? null,
      completed: (data.completed as string[]) ?? [],
      climbTimes: (data.climbTimes as Record<string, ClimbTime>) ?? {},
      friends: (data.friends as string[]) ?? [],
      stravaName: strava?.athleteName ?? null,
      visited: (data.visited as string[]) ?? [],
      wishlist: (data.wishlist as string[]) ?? [],
    };
  });
}

export async function setFriends(uid: string, friends: string[]) {
  const db = await getDb();
  const { doc, setDoc } = await import('firebase/firestore');
  await setDoc(doc(db, 'users', uid), { friends }, { merge: true });
}
