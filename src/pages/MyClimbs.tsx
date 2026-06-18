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
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Climbs</h1>
          <p className="text-gray-500 mt-1">Your cycling achievements</p>
        </div>
        <button
          onClick={handleStravaConnect}
          className="flex items-center gap-2 bg-[#FC4C02] hover:bg-[#e04400] text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors"
        >
          <ExternalLink className="w-4 h-4" />
          Connect Strava
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-10">
        <StatCard
          label="Climbs Completed"
          value={completed.length}
          icon={<Mountain className="w-6 h-6" />}
        />
        <StatCard
          label="Total Elevation"
          value={totalElevation.toLocaleString()}
          unit="m"
          icon={<TrendingUp className="w-6 h-6" />}
        />
        <StatCard
          label="Total Distance"
          value={totalDistance.toFixed(1)}
          unit="km"
          icon={<Ruler className="w-6 h-6" />}
        />
      </div>

      <section className="mb-10">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Completed <span className="text-[#1D9E75] ml-1">{completed.length}</span>
        </h2>
        {loading ? (
          <div className="flex gap-4 overflow-x-auto pb-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="min-w-[200px] h-48 bg-gray-100 rounded-xl animate-pulse flex-shrink-0" />
            ))}
          </div>
        ) : completed.length === 0 ? (
          <div className="bg-gray-50 rounded-xl p-8 text-center">
            <Mountain className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No climbs completed yet.</p>
            <Link to="/" className="mt-2 inline-block text-sm text-[#1D9E75] font-medium hover:underline">
              Browse all climbs
            </Link>
          </div>
        ) : (
          <div className="flex gap-4 overflow-x-auto pb-2 -mx-4 px-4">
            {completed.map(climb => (
              <div key={climb.id} className="min-w-[200px] flex-shrink-0">
                <ClimbCard climb={climb} />
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Bucket List <span className="text-gray-400 ml-1">{bucketList.length}</span>
        </h2>
        {bucketList.length === 0 ? (
          <div className="bg-[#1D9E75]/5 rounded-xl p-8 text-center">
            <p className="text-[#1D9E75] font-medium">You've conquered them all!</p>
          </div>
        ) : (
          <div className="flex gap-4 overflow-x-auto pb-2 -mx-4 px-4">
            {bucketList.map(climb => (
              <div key={climb.id} className="min-w-[200px] flex-shrink-0">
                <ClimbCard climb={climb} />
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
