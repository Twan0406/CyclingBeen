import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { collection, getDocs, doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import type { Climb } from '../types/climb';
import { seedClimbs } from '../data/climbs';

interface ClimbsContextType {
  climbs: Climb[];
  loading: boolean;
  toggleCompleted: (climbId: string) => void;
}

const ClimbsContext = createContext<ClimbsContextType | null>(null);

export function ClimbsProvider({ children }: { children: ReactNode }) {
  const [climbs, setClimbs] = useState<Climb[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchClimbs() {
      try {
        const snapshot = await getDocs(collection(db, 'climbs'));
        if (snapshot.empty) {
          setClimbs(seedClimbs);
        } else {
          const data = snapshot.docs.map(d => ({ ...d.data(), id: d.id } as Climb));
          setClimbs(data);
        }
      } catch {
        setClimbs(seedClimbs);
      } finally {
        setLoading(false);
      }
    }
    fetchClimbs();
  }, []);

  const toggleCompleted = (climbId: string) => {
    setClimbs(prev => prev.map(c => {
      if (c.id !== climbId) return c;
      const updated = { ...c, completed: !c.completed };
      try {
        setDoc(doc(db, 'climbs', climbId), updated, { merge: true });
      } catch { /* ignore */ }
      return updated;
    }));
  };

  return (
    <ClimbsContext.Provider value={{ climbs, loading, toggleCompleted }}>
      {children}
    </ClimbsContext.Provider>
  );
}

export function useClimbs() {
  const ctx = useContext(ClimbsContext);
  if (!ctx) throw new Error('useClimbs must be used inside ClimbsProvider');
  return ctx;
}
