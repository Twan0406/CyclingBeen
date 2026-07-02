import { Link, useLocation } from 'react-router-dom';
import { Mountain, LayoutGrid, User } from 'lucide-react';

export default function Navbar() {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 bg-[#070b0a]/85 backdrop-blur-xl border-b border-[#1D9E75]/15">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-bold text-white text-lg tracking-wide">
          <span className="w-8 h-8 rounded-lg bg-[#1D9E75]/15 border border-[#1D9E75]/40 flex items-center justify-center shadow-[0_0_14px_rgba(29,158,117,0.35)]">
            <Mountain className="w-4.5 h-4.5 text-[#2fd6a0]" />
          </span>
          COLLECT
        </Link>
        <div className="flex items-center gap-1">
          <Link
            to="/"
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-medium transition-all ${isActive('/') ? 'bg-[#1D9E75]/20 text-[#2fd6a0] border border-[#1D9E75]/50 shadow-[0_0_12px_rgba(29,158,117,0.3)]' : 'text-gray-400 border border-transparent hover:text-white hover:bg-white/5'}`}
          >
            <LayoutGrid className="w-4 h-4" />
            All Climbs
          </Link>
          <Link
            to="/my-climbs"
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-medium transition-all ${isActive('/my-climbs') ? 'bg-[#1D9E75]/20 text-[#2fd6a0] border border-[#1D9E75]/50 shadow-[0_0_12px_rgba(29,158,117,0.3)]' : 'text-gray-400 border border-transparent hover:text-white hover:bg-white/5'}`}
          >
            <User className="w-4 h-4" />
            My Climbs
          </Link>
        </div>
      </div>
    </nav>
  );
}
