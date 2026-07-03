import { useState, useEffect } from 'react';
import { getDb } from '../firebase';
import type { UserClimb } from '../types/climb';

// Reserved for the authenticated/social phase. Loads a user's climbs from
// Firestore lazily; unused until sign-in is wired up.
export function useMyClimbs(userId: string | null) {
  const [userClimbs, setUserClimbs] = useState<UserClimb[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    (async () => {
      try {
        const db = await getDb();
        const { collection, query, where, getDocs } = await import('firebase/firestore');
        const q = query(collection(db, 'userClimbs'), where('userId', '==', userId));
        const snapshot = await getDocs(q);
        setUserClimbs(snapshot.docs.map((d) => d.data() as UserClimb));
      } catch {
        /* ignore */
      } finally {
        setLoading(false);
      }
    })();
  }, [userId]);

  return { userClimbs, loading };
}
