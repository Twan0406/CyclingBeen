import { createContext, useContext, useState, useMemo, useCallback, useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import type { Climb } from '../types/climb';
import { seedClimbs } from '../data/climbs';
import { useAuth } from './AuthContext';
import { getDb } from '../firebase';

interface ClimbsContextType {
  climbs: Climb[];
  loading: boolean;
  toggleCompleted: (climbId: string) => void;
}

const ClimbsContext = createContext<ClimbsContextType | null>(null);

async function loadRemote(uid: string): Promise<Set<string>> {
  const db = await getDb();
  const { doc, getDoc } = await import('firebase/firestore');
  const snap = await getDoc(doc(db, 'users', uid));
  const ids = snap.exists() ? ((snap.data().completed as string[]) || []) : [];
  return new Set(ids);
}

async function saveRemote(
  uid: string,
  ids: Set<string>,
  profile: { displayName: string | null; photoURL: string | null },
) {
  const db = await getDb();
  const { doc, setDoc } = await import('firebase/firestore');
  await setDoc(
    doc(db, 'users', uid),
    { completed: [...ids], displayName: profile.displayName, photoURL: profile.photoURL },
    { merge: true },
  );
}

export function ClimbsProvider({ children }: { children: ReactNode }) {
  const { user, signIn } = useAuth();
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
  const userRef = useRef(user);
  userRef.current = user;

  // Progress lives only in the signed-in account. Signed out shows nothing.
  useEffect(() => {
    let alive = true;
    if (!user) {
      setCompletedIds(new Set());
      return;
    }
    (async () => {
      try {
        const remote = await loadRemote(user.uid);
        if (alive) setCompletedIds(remote);
      } catch {
        /* ignore */
      }
    })();
    return () => {
      alive = false;
    };
  }, [user]);

  const climbs = useMemo(
    () => seedClimbs.map((c) => ({ ...c, completed: completedIds.has(c.id) })),
    [completedIds],
  );

  const toggleCompleted = useCallback(
    (climbId: string) => {
      const u = userRef.current;
      if (!u) {
        // Not signed in — prompt sign-in instead of tracking locally.
        signIn().catch(() => {});
        return;
      }
      setCompletedIds((prev) => {
        const next = new Set(prev);
        if (next.has(climbId)) next.delete(climbId);
        else next.add(climbId);
        saveRemote(u.uid, next, u).catch(() => {});
        return next;
      });
    },
    [signIn],
  );

  return (
    <ClimbsContext.Provider value={{ climbs, loading: false, toggleCompleted }}>
      {children}
    </ClimbsContext.Provider>
  );
}

export function useClimbs() {
  const ctx = useContext(ClimbsContext);
  if (!ctx) throw new Error('useClimbs must be used inside ClimbsProvider');
  return ctx;
}
