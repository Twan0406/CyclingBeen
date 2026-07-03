import { createContext, useContext, useState, useMemo, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { Climb } from '../types/climb';
import { seedClimbs } from '../data/climbs';

interface ClimbsContextType {
  climbs: Climb[];
  loading: boolean;
  toggleCompleted: (climbId: string) => void;
}

const ClimbsContext = createContext<ClimbsContextType | null>(null);
const STORAGE_KEY = 'collect_completed_v1';

function loadCompleted(): Set<string> {
  try {
    return new Set(JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'));
  } catch {
    return new Set();
  }
}

export function ClimbsProvider({ children }: { children: ReactNode }) {
  // Seed data renders instantly; completed state lives in localStorage so there
  // is no network round-trip on load.
  const [completedIds, setCompletedIds] = useState<Set<string>>(loadCompleted);

  const climbs = useMemo(
    () => seedClimbs.map((c) => ({ ...c, completed: completedIds.has(c.id) })),
    [completedIds],
  );

  const toggleCompleted = useCallback((climbId: string) => {
    setCompletedIds((prev) => {
      const next = new Set(prev);
      if (next.has(climbId)) next.delete(climbId);
      else next.add(climbId);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify([...next]));
      } catch {
        /* ignore */
      }
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
