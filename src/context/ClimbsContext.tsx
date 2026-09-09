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
  /** Destination ids the rider has marked as ridden. */
  visited: Set<string>;
  toggleVisited: (id: string) => void;
  /** Climb and destination ids saved as a goal. */
  wishlist: Set<string>;
  toggleWishlist: (id: string) => void;
}

const ClimbsContext = createContext<ClimbsContextType | null>(null);

interface RemoteState {
  completed: Set<string>;
  times: TimesMap;
  visited: Set<string>;
  wishlist: Set<string>;
}

async function loadRemote(uid: string): Promise<RemoteState> {
  const db = await getDb();
  const { doc, getDoc } = await import('firebase/firestore');
  const snap = await getDoc(doc(db, 'users', uid));
  const empty: RemoteState = {
    completed: new Set(),
    times: {},
    visited: new Set(),
    wishlist: new Set(),
  };
  if (!snap.exists()) return empty;
  const data = snap.data();
  return {
    completed: new Set((data.completed as string[]) || []),
    times: (data.climbTimes as TimesMap) || {},
    visited: new Set((data.visited as string[]) || []),
    wishlist: new Set((data.wishlist as string[]) || []),
  };
}

async function saveRemote(
  uid: string,
  fields: Partial<{
    completed: Set<string>;
    climbTimes: TimesMap;
    visited: Set<string>;
    wishlist: Set<string>;
  }>,
  profile: { displayName: string | null; photoURL: string | null },
) {
  const db = await getDb();
  const { doc, setDoc } = await import('firebase/firestore');
  const payload: Record<string, unknown> = {
    displayName: profile.displayName,
    photoURL: profile.photoURL,
  };
  if (fields.completed) payload.completed = [...fields.completed];
  if (fields.climbTimes) payload.climbTimes = fields.climbTimes;
  if (fields.visited) payload.visited = [...fields.visited];
  if (fields.wishlist) payload.wishlist = [...fields.wishlist];
  await setDoc(doc(db, 'users', uid), payload, { merge: true });
}

export function ClimbsProvider({ children }: { children: ReactNode }) {
  const { user, signIn } = useAuth();
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
  const [climbTimes, setClimbTimes] = useState<TimesMap>({});
  const [visited, setVisited] = useState<Set<string>>(new Set());
  const [wishlist, setWishlist] = useState<Set<string>>(new Set());

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
      setVisited(new Set());
      setWishlist(new Set());
      return;
    }
    (async () => {
      try {
        const state = await loadRemote(user.uid);
        if (!alive) return;
        setCompletedIds(state.completed);
        setClimbTimes(state.times);
        setVisited(state.visited);
        setWishlist(state.wishlist);
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
      saveRemote(u.uid, { completed: next, climbTimes: timesRef.current }, u).catch(() => {});
      return next;
    });
  }, [signIn]);

  const toggleVisited = useCallback(
    (id: string) => {
      const u = userRef.current;
      if (!u) {
        signIn().catch(() => {});
        return;
      }
      setVisited((prev) => {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        saveRemote(u.uid, { visited: next }, u).catch(() => {});
        return next;
      });
    },
    [signIn],
  );

  const toggleWishlist = useCallback(
    (id: string) => {
      const u = userRef.current;
      if (!u) {
        signIn().catch(() => {});
        return;
      }
      setWishlist((prev) => {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        saveRemote(u.uid, { wishlist: next }, u).catch(() => {});
        return next;
      });
    },
    [signIn],
  );

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
    await saveRemote(u.uid, { completed: nextCompleted, climbTimes: nextTimes }, u);
  }, []);

  return (
    <ClimbsContext.Provider
      value={{
        climbs,
        loading: false,
        climbTimes,
        toggleCompleted,
        applyStravaMatches,
        visited,
        toggleVisited,
        wishlist,
        toggleWishlist,
      }}
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
