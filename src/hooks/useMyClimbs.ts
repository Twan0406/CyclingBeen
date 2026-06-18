import { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import type { UserClimb } from '../types/climb';

export function useMyClimbs(userId: string | null) {
  const [userClimbs, setUserClimbs] = useState<UserClimb[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    async function fetchMyClimbs() {
      try {
        const q = query(collection(db, 'userClimbs'), where('userId', '==', userId));
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map((d) => d.data() as UserClimb);
        setUserClimbs(data);
      } catch {
        // Silently ignore
      } finally {
        setLoading(false);
      }
    }
    fetchMyClimbs();
  }, [userId]);

  return { userClimbs, loading };
}
