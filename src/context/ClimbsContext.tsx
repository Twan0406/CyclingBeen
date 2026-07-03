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
const STORAGE_KEY = 'collect_completed_v1';

function loadLocal(): Set<string> {
  try {
    return new Set(JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'));
  } catch {
    return new Set();
  }
}

function saveLocal(ids: Set<string>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...ids]));
  } catch {
    /* ignore */
  }
}

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
    {
      completed: [...ids],
      displayName: profile.displayName,
      photoURL: profile.photoURL,
    },
    { merge: true },
  );
}

export function ClimbsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [completedIds, setCompletedIds] = useState<Set<string>>(loadLocal);
  const userRef = useRef(user);
  userRef.current = user;

  // On sign-in: merge any local (anonymous) progress with the account's cloud
  // progress, show the union, and persist it back to Firestore.
  useEffect(() => {
    if (!user) return;
    let alive = true;
    (async () => {
      try {
        const remote = await loadRemote(user.uid);
        const merged = new Set([...remote, ...loadLocal()]);
        if (!alive) return;
        setCompletedIds(merged);
        await saveRemote(user.uid, merged, user);
      } catch {
        /* keep local state on failure */
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

  const toggleCompleted = useCallback((climbId: string) => {
    setCompletedIds((prev) => {
      const next = new Set(prev);
      if (next.has(climbId)) next.delete(climbId);
      else next.add(climbId);
      saveLocal(next);
      const u = userRef.current;
      if (u) saveRemote(u.uid, next, u).catch(() => {});
      return next;
    });
  }, []);

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
