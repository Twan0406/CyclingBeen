import { Link } from 'react-router-dom';
import { useClimbs } from '../context/ClimbsContext';
import ClimbCard from '../components/ClimbCard';
import StatCard from '../components/StatCard';
import { Mountain, TrendingUp, Ruler, ExternalLink } from 'lucide-react';

export default function MyClimbs() {
  const { climbs, loading } = useClimbs();

  const completed = climbs.filter(c => c.completed);
  const bucketList = climbs.filter(c => !c.completed);
  const totalElevation = completed.reduce((sum, c) => sum + c.elevationM, 0);
  const totalDistance = completed.reduce((sum, c) => sum + c.lengthKm, 0);

  const handleStravaConnect = () => {
    const clientId = import.meta.env.VITE_STRAVA_CLIENT_ID;
    const redirectUri = import.meta.env.VITE_STRAVA_REDIRECT_URI || 'http://localhost:5173/strava-callback';
    const scope = 'read,activity:read';
    window.location.href = `https://www.strava.com/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${scope}`;
  };

  return (
    <div className="grid-backdrop min-h-screen">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-[#2fd6a0] mb-2">Rider dashboard</p>
            <h1 className="text-4xl font-bold text-white">My <span className="neon-green">Climbs</span></h1>
            <p className="text-gray-400 mt-1">Your cycling achievements</p>
          </div>
          <button
            onClick={handleStravaConnect}
            className="flex items-center gap-2 bg-[#FC4C02] hover:bg-[#ff5c14] text-white text-sm font-bold px-4 py-2 rounded-full transition-all shadow-[0_0_20px_rgba(252,76,2,0.4)]"
          >
            <ExternalLink className="w-4 h-4" />
            Connect Strava
          </button>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-10">
          <StatCard
            label="Climbs Conquered"
            value={completed.length}
            icon={<Mountain className="w-5 h-5" />}
          />
          <StatCard
            label="Total Elevation"
            value={totalElevation.toLocaleString()}
            unit="m"
            icon={<TrendingUp className="w-5 h-5" />}
          />
          <StatCard
            label="Total Distance"
            value={totalDistance.toFixed(1)}
            unit="km"
            icon={<Ruler className="w-5 h-5" />}
          />
        </div>

        <section className="mb-10">
          <h2 className="text-xl font-bold text-white mb-4">
            Conquered <span className="neon-green ml-1">{completed.length}</span>
          </h2>
          {loading ? (
            <div className="flex gap-4 overflow-x-auto pb-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="min-w-[200px] h-48 bg-white/5 rounded-2xl animate-pulse flex-shrink-0" />
              ))}
            </div>
          ) : completed.length === 0 ? (
            <div className="bg-[#0d1412] border border-white/10 rounded-2xl p-8 text-center">
              <Mountain className="w-10 h-10 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400">No climbs conquered yet.</p>
              <Link to="/" className="mt-2 inline-block text-sm text-[#2fd6a0] font-medium hover:underline">
                Browse all climbs
              </Link>
            </div>
          ) : (
            <div className="flex gap-4 overflow-x-auto pb-2 -mx-4 px-4">
              {completed.map(climb => (
                <div key={climb.id} className="min-w-[220px] flex-shrink-0">
                  <ClimbCard climb={climb} />
                </div>
              ))}
            </div>
          )}
        </section>

        <section>
          <h2 className="text-xl font-bold text-white mb-4">
            Bucket List <span className="text-gray-500 ml-1">{bucketList.length}</span>
          </h2>
          {bucketList.length === 0 ? (
            <div className="bg-[#1D9E75]/10 border border-[#1D9E75]/30 rounded-2xl p-8 text-center">
              <p className="text-[#2fd6a0] font-medium">You've conquered them all!</p>
            </div>
          ) : (
            <div className="flex gap-4 overflow-x-auto pb-2 -mx-4 px-4">
              {bucketList.map(climb => (
                <div key={climb.id} className="min-w-[220px] flex-shrink-0">
                  <ClimbCard climb={climb} />
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
