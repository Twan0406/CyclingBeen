import { Link } from 'react-router-dom';
import { useClimbs } from '../context/ClimbsContext';
import { useAuth } from '../context/AuthContext';
import ClimbCard from '../components/ClimbCard';
import StatCard from '../components/StatCard';
import { Mountain, TrendingUp, Ruler, ExternalLink, LogIn } from 'lucide-react';

export default function MyClimbs() {
  const { climbs } = useClimbs();
  const { user, signIn } = useAuth();

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center">
        <div className="w-16 h-16 rounded-2xl bg-amber-400/15 flex items-center justify-center mx-auto mb-5">
          <Mountain className="w-8 h-8 text-amber-400" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">Track your climbs</h1>
        <p className="text-slate-400 mb-6">
          Sign in to mark climbs as conquered and keep your collection on every device.
        </p>
        <button
          onClick={() => signIn()}
          className="inline-flex items-center gap-2 bg-white text-[#0a0f1c] font-semibold px-5 py-2.5 rounded-full hover:bg-slate-200 transition"
        >
          <LogIn className="w-4 h-4" /> Sign in with Google
        </button>
      </div>
    );
  }

  const completed = climbs.filter((c) => c.completed);
  const bucketList = climbs.filter((c) => !c.completed);
  const totalElevation = completed.reduce((sum, c) => sum + c.elevationM, 0);
  const totalDistance = completed.reduce((sum, c) => sum + c.lengthKm, 0);

  const handleStravaConnect = () => {
    const clientId = import.meta.env.VITE_STRAVA_CLIENT_ID;
    const redirectUri = import.meta.env.VITE_STRAVA_REDIRECT_URI || 'http://localhost:5173/strava-callback';
    const scope = 'read,activity:read';
    window.location.href = `https://www.strava.com/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${scope}`;
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-amber-400/80 mb-2">Rider dashboard</p>
          <h1 className="text-4xl font-bold text-white tracking-tight">My Climbs</h1>
          <p className="text-slate-400 mt-1">Your cycling achievements</p>
        </div>
        <button
          onClick={handleStravaConnect}
          className="flex items-center gap-2 bg-[#FC4C02] hover:bg-[#ff5c14] text-white text-sm font-semibold px-4 py-2 rounded-full transition-all shadow-lg shadow-orange-600/25"
        >
          <ExternalLink className="w-4 h-4" />
          Connect Strava
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-10">
        <StatCard label="Conquered" value={completed.length} icon={<Mountain className="w-5 h-5" />} />
        <StatCard label="Total Elevation" value={totalElevation.toLocaleString()} unit="m" icon={<TrendingUp className="w-5 h-5" />} />
        <StatCard label="Total Distance" value={totalDistance.toFixed(1)} unit="km" icon={<Ruler className="w-5 h-5" />} />
      </div>

      <section className="mb-10">
        <h2 className="text-xl font-bold text-white mb-4">
          Conquered <span className="text-amber-400 ml-1">{completed.length}</span>
        </h2>
        {completed.length === 0 ? (
          <div className="bg-[#111827] ring-1 ring-white/8 rounded-2xl p-8 text-center">
            <Mountain className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400">No climbs conquered yet.</p>
            <Link to="/" className="mt-2 inline-block text-sm text-amber-400 font-medium hover:underline">
              Explore all climbs
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {completed.map((climb) => (
              <ClimbCard key={climb.id} climb={climb} />
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-xl font-bold text-white mb-4">
          Bucket List <span className="text-slate-500 ml-1">{bucketList.length}</span>
        </h2>
        {bucketList.length === 0 ? (
          <div className="bg-amber-400/10 ring-1 ring-amber-400/25 rounded-2xl p-8 text-center">
            <p className="text-amber-300 font-medium">You've conquered them all!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {bucketList.map((climb) => (
              <ClimbCard key={climb.id} climb={climb} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
