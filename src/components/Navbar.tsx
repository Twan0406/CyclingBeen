import { Link, useLocation } from 'react-router-dom';
import { Mountain, LayoutGrid, User } from 'lucide-react';

export default function Navbar() {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-bold text-gray-900 text-lg">
          <Mountain className="w-5 h-5 text-[#1D9E75]" />
          Collect
        </Link>
        <div className="flex items-center gap-1">
          <Link
            to="/"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${isActive('/') ? 'bg-[#1D9E75]/10 text-[#1D9E75]' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            <LayoutGrid className="w-4 h-4" />
            All Climbs
          </Link>
          <Link
            to="/my-climbs"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${isActive('/my-climbs') ? 'bg-[#1D9E75]/10 text-[#1D9E75]' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            <User className="w-4 h-4" />
            My Climbs
          </Link>
        </div>
      </div>
    </nav>
  );
}
