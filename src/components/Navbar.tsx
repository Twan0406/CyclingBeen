import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Mountain, LayoutGrid, User, LogOut, Trophy } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const location = useLocation();
  const { user, signIn, signOutUser } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const isActive = (path: string) => location.pathname === path;

  const linkClass = (active: boolean) =>
    `flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-medium transition-all ${
      active
        ? 'bg-amber-400/15 text-amber-300 ring-1 ring-amber-400/30'
        : 'text-slate-400 hover:text-white hover:bg-white/5'
    }`;

  return (
    <nav className="sticky top-0 z-50 bg-[#0a0f1c]/85 backdrop-blur-xl border-b border-white/10">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5 font-semibold text-white text-lg">
          <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
            <Mountain className="w-5 h-5 text-[#0a0f1c]" />
          </span>
          <span className="tracking-tight">Collect</span>
        </Link>

        <div className="flex items-center gap-1">
          <Link to="/" className={linkClass(isActive('/'))}>
            <LayoutGrid className="w-4 h-4" />
            <span className="hidden sm:inline">Explore</span>
          </Link>
          <Link to="/my-climbs" className={linkClass(isActive('/my-climbs'))}>
            <User className="w-4 h-4" />
            <span className="hidden sm:inline">My Climbs</span>
          </Link>
          <Link to="/friends" className={linkClass(isActive('/friends'))}>
            <Trophy className="w-4 h-4" />
            <span className="hidden sm:inline">Friends</span>
          </Link>

          {user ? (
            <div className="relative ml-1">
              <button
                onClick={() => setMenuOpen((o) => !o)}
                className="flex items-center gap-2 rounded-full pl-1 pr-2 py-1 hover:bg-white/5 transition"
              >
                {user.photoURL ? (
                  <img src={user.photoURL} alt="" className="w-7 h-7 rounded-full ring-1 ring-white/20" />
                ) : (
                  <span className="w-7 h-7 rounded-full bg-amber-400/20 text-amber-300 flex items-center justify-center text-sm font-bold">
                    {(user.displayName || user.email || '?').charAt(0).toUpperCase()}
                  </span>
                )}
              </button>
              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                  <div className="absolute right-0 mt-2 w-52 bg-[#111827] ring-1 ring-white/10 rounded-xl shadow-xl z-20 overflow-hidden">
                    <div className="px-4 py-3 border-b border-white/8">
                      <p className="text-sm font-medium text-white truncate">{user.displayName || 'Rider'}</p>
                      <p className="text-xs text-slate-500 truncate">{user.email}</p>
                    </div>
                    <button
                      onClick={() => { setMenuOpen(false); signOutUser(); }}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-slate-300 hover:bg-white/5 transition"
                    >
                      <LogOut className="w-4 h-4" /> Sign out
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <button
              onClick={() => signIn()}
              className="ml-1 flex items-center gap-2 bg-white text-[#0a0f1c] text-sm font-semibold px-3.5 py-1.5 rounded-full hover:bg-slate-200 transition"
            >
              <GoogleG /> <span className="hidden sm:inline">Sign in</span>
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}

function GoogleG() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </svg>
  );
}
