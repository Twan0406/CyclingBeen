import { Link, useLocation } from 'react-router-dom';
import { Mountain, LayoutGrid, User } from 'lucide-react';

export default function Navbar() {
  const location = useLocation();
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
        </div>
      </div>
    </nav>
  );
}
