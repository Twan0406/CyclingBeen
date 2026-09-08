import { createContext, useContext, useState, useMemo, useCallback, useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import type { Climb } from '../types/climb';
import { seedClimbs } from '../data/climbs';
import { climbGuides } from '../data/climbGuides';
import { useAuth } from './AuthContext';
import { getDb } from '../firebase';
import type { ClimbMatch } from '../lib/strava';

export interface ClimbTime {
  seconds: number;
  date: string;
  activityId: number;
  activityName: string;
  attempts?: number;
  isSegmentTime?: boolean;
}

type TimesMap = Record<string, ClimbTime>;

interface ClimbsContextType {
  climbs: Climb[];
  loading: boolean;
  climbTimes: TimesMap;
  toggleCompleted: (climbId: string) => void;
  applyStravaMatches: (matches: ClimbMatch[]) => Promise<void>;
}

const ClimbsContext = createContext<ClimbsContextType | null>(null);

async function loadRemote(uid: string): Promise<{ completed: Set<string>; times: TimesMap }> {
  const db = await getDb();
  const { doc, getDoc } = await import('firebase/firestore');
  const snap = await getDoc(doc(db, 'users', uid));
  if (!snap.exists()) return { completed: new Set(), times: {} };
  const data = snap.data();
  return {
    completed: new Set((data.completed as string[]) || []),
    times: (data.climbTimes as TimesMap) || {},
  };
}

async function saveRemote(
  uid: string,
  completed: Set<string>,
  times: TimesMap,
  profile: { displayName: string | null; photoURL: string | null },
) {
  const db = await getDb();
  const { doc, setDoc } = await import('firebase/firestore');
  await setDoc(
    doc(db, 'users', uid),
    {
      completed: [...completed],
      climbTimes: times,
      displayName: profile.displayName,
      photoURL: profile.photoURL,
    },
    { merge: true },
  );
}

export function ClimbsProvider({ children }: { children: ReactNode }) {
  const { user, signIn } = useAuth();
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
  const [climbTimes, setClimbTimes] = useState<TimesMap>({});

  const userRef = useRef(user);
  userRef.current = user;
  const completedRef = useRef(completedIds);
  completedRef.current = completedIds;
  const timesRef = useRef(climbTimes);
  timesRef.current = climbTimes;

  useEffect(() => {
    let alive = true;
    if (!user) {
      setCompletedIds(new Set());
      setClimbTimes({});
      return;
    }
    (async () => {
      try {
        const { completed, times } = await loadRemote(user.uid);
        if (!alive) return;
        setCompletedIds(completed);
        setClimbTimes(times);
      } catch {
        /* ignore */
      }
    })();
    return () => {
      alive = false;
    };
  }, [user]);

  const climbs = useMemo(
    () =>
      seedClimbs.map((c) => ({
        ...c,
        ...(climbGuides[c.id] ?? {}),
        completed: completedIds.has(c.id),
      })),
    [completedIds],
  );

  const toggleCompleted = useCallback((climbId: string) => {
    const u = userRef.current;
    if (!u) {
      signIn().catch(() => {});
      return;
    }
    setCompletedIds((prev) => {
      const next = new Set(prev);
      if (next.has(climbId)) next.delete(climbId);
      else next.add(climbId);
      saveRemote(u.uid, next, timesRef.current, u).catch(() => {});
      return next;
    });
  }, [signIn]);

  const applyStravaMatches = useCallback(async (matches: ClimbMatch[]) => {
    const u = userRef.current;
    if (!u) return;
    const nextCompleted = new Set(completedRef.current);
    const nextTimes: TimesMap = { ...timesRef.current };
    for (const m of matches) {
      nextCompleted.add(m.climbId);
      const ex = nextTimes[m.climbId];
      const attempts = Math.max(ex?.attempts ?? 0, m.attempts ?? 1);
      // A measured climb time and a whole-ride estimate aren't comparable, so
      // an exact time always wins over an estimate (and never the other way
      // round); only like-for-like times compete on speed.
      const exExact = ex?.isSegmentTime === true;
      const newExact = m.isSegmentTime === true;
      const replace =
        !ex ||
        (newExact && !exExact) ||
        (newExact === exExact && m.seconds < ex.seconds);
      if (replace) {
        nextTimes[m.climbId] = {
          seconds: m.seconds,
          date: m.date,
          activityId: m.activityId,
          activityName: m.activityName,
          attempts,
          isSegmentTime: m.isSegmentTime,
        };
      } else {
        nextTimes[m.climbId] = { ...ex, attempts };
      }
    }
    setCompletedIds(nextCompleted);
    setClimbTimes(nextTimes);
    await saveRemote(u.uid, nextCompleted, nextTimes, u);
  }, []);

  return (
    <ClimbsContext.Provider
      value={{ climbs, loading: false, climbTimes, toggleCompleted, applyStravaMatches }}
    >
      {children}
    </ClimbsContext.Provider>
  );
}

export function useClimbs() {
  const ctx = useContext(ClimbsContext);
  if (!ctx) throw new Error('useClimbs must be used inside ClimbsProvider');
  return ctx;
}
