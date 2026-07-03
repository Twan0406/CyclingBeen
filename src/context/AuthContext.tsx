import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { getAuthInstance } from '../firebase';

export interface AuthUser {
  uid: string;
  displayName: string | null;
  photoURL: string | null;
  email: string | null;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  signIn: () => Promise<void>;
  signOutUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsub = () => {};
    (async () => {
      try {
        const auth = await getAuthInstance();
        const { onAuthStateChanged } = await import('firebase/auth');
        unsub = onAuthStateChanged(auth, (u) => {
          setUser(
            u
              ? { uid: u.uid, displayName: u.displayName, photoURL: u.photoURL, email: u.email }
              : null,
          );
          setLoading(false);
        });
      } catch {
        setLoading(false);
      }
    })();
    return () => unsub();
  }, []);

  const signIn = async () => {
    const auth = await getAuthInstance();
    const { GoogleAuthProvider, signInWithPopup } = await import('firebase/auth');
    await signInWithPopup(auth, new GoogleAuthProvider());
  };

  const signOutUser = async () => {
    const auth = await getAuthInstance();
    const { signOut } = await import('firebase/auth');
    await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOutUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
