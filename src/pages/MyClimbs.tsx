import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useClimbs } from '../context/ClimbsContext';
import { useAuth } from '../context/AuthContext';
import { useStrava } from '../hooks/useStrava';
import ClimbCard from '../components/ClimbCard';
import DestinationCard from '../components/DestinationCard';
import StatCard from '../components/StatCard';
import { allDestinations } from '../data/allDestinations';
import { categories } from '../types/destination';
import { formatDuration } from '../lib/strava';
import { usePageMeta } from '../hooks/usePageMeta';
import {
  Mountain, TrendingUp, Globe2, RefreshCw, LogIn, Clock, Link2, Bookmark, MapPin,
} from 'lucide-react';

export default function MyClimbs() {
  const { climbs, climbTimes, visited, wishlist } = useClimbs();
  const { user, signIn } = useAuth();
  const strava = useStrava();

  usePageMeta({ title: 'My rides | Collect' });

  const conqueredClimbs = useMemo(() => climbs.filter((c) => c.completed), [climbs]);
  const visitedPlaces = useMemo(
    () => allDestinations.filter((d) => visited.has(d.id)),
    [visited],
  );
  const savedClimbs = useMemo(
    () => climbs.filter((c) => wishlist.has(c.id)),
    [climbs, wishlist],
  );
  const savedPlaces = useMemo(
    () => allDestinations.filter((d) => wishlist.has(d.id)),
    [wishlist],
  );

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center">
        <div className="w-16 h-16 rounded-2xl bg-[#dfa04a]/15 flex items-center justify-center mx-auto mb-5">
          <Mountain className="w-8 h-8 text-[#dfa04a]" />
        </div>
        <h1 className="text-2xl font-semibold text-white mb-2">Your rides, collected</h1>
        <p className="text-[#a1968a] mb-6">
          Sign in to keep track of the climbs you've conquered, the places you've ridden
          and the adventures still on your list.
        </p>
        <button
          onClick={() => signIn()}
          className="inline-flex items-center gap-2 bg-white text-[#14120f] font-semibold px-5 py-2.5 rounded-full hover:bg-slate-200 transition"
        >
          <LogIn className="w-4 h-4" /> Sign in with Google
        </button>
      </div>
    );
  }

  const totalElevation = conqueredClimbs.reduce((sum, c) => sum + c.elevationM, 0);
  const countries = new Set([
    ...conqueredClimbs.map((c) => c.country),
    ...visitedPlaces.map((d) => d.country),
  ]);
  const savedCount = savedClimbs.length + savedPlaces.length;

  return (
    <div className="max-w-[1240px] mx-auto px-6 md:px-12 py-10 pb-24">
      <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
        <div>
          <p className="font-mono-dc text-[11px] tracking-[0.22em] uppercase text-[#7a7066] mb-3">
            Rider dashboard
          </p>
          <h1 className="text-[clamp(30px,4.5vw,46px)] font-semibold text-[#f4efe7]">My rides</h1>
          <p className="text-[16px] text-[#a1968a] mt-2">
            Everything you've ridden, and everything you still want to.
          </p>
        </div>

        {strava.configured &&
          (strava.connected ? (
            <button
              onClick={() => strava.sync()}
              disabled={strava.syncing}
              className="flex items-center gap-2 bg-[#FC4C02] hover:bg-[#ff5c14] disabled:opacity-60 text-white text-sm font-semibold px-4 py-2 rounded-full transition-all"
            >
              <RefreshCw className={`w-4 h-4 ${strava.syncing ? 'animate-spin' : ''}`} />
              {strava.syncing ? 'Syncing…' : 'Sync Strava'}
            </button>
          ) : (
            <button
              onClick={() => strava.connect()}
              className="flex items-center gap-2 bg-[#FC4C02] hover:bg-[#ff5c14] text-white text-sm font-semibold px-4 py-2 rounded-full transition-all"
            >
              <Link2 className="w-4 h-4" /> Connect Strava
            </button>
          ))}
      </div>

      {strava.configured && strava.connected && strava.outdated && (
        <div className="mb-4 text-sm rounded-xl px-4 py-3 bg-[#c4633a]/10 ring-1 ring-[#c4633a]/30 text-[#dfa04a]">
          <strong className="font-semibold">Exact climb times are off.</strong>{' '}
          <span className="text-[#d6cec2]">
            Your Strava proxy is running an older version, so times fall back to the whole ride.
          </span>
        </div>
      )}

      {strava.status && (
        <div className="mb-6 text-sm text-[#a1968a] bg-[#1c1915] ring-1 ring-[#322b24] rounded-xl px-4 py-2.5">
          {strava.status}
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
        <StatCard label="Climbs conquered" value={conqueredClimbs.length} icon={<Mountain className="w-5 h-5" />} />
        <StatCard label="Places ridden" value={visitedPlaces.length} icon={<MapPin className="w-5 h-5" />} />
        <StatCard label="Countries" value={countries.size} icon={<Globe2 className="w-5 h-5" />} />
        <StatCard
          label="Total elevation"
          value={totalElevation.toLocaleString('de-DE')}
          unit="m"
          icon={<TrendingUp className="w-5 h-5" />}
        />
      </div>

      {/* Conquered climbs */}
      <Section
        title="Climbs conquered"
        count={conqueredClimbs.length}
        empty="No climbs yet — connect Strava and they'll be found automatically."
        emptyLink={{ to: '/rides/climbs', label: 'Browse the legendary climbs' }}
      >
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {conqueredClimbs.map((climb) => (
            <div key={climb.id}>
              <ClimbCard climb={climb} />
              {climbTimes[climb.id] && (
                <div className="flex items-center gap-1.5 mt-1.5 px-1 text-xs text-[#e8b463]">
                  <Clock className="w-3 h-3" />
                  <span className="font-semibold">{formatDuration(climbTimes[climb.id].seconds)}</span>
                  <span className="text-[#7a7066]">
                    · {climbTimes[climb.id].isSegmentTime ? 'climb time' : 'ride time'}
                    {climbTimes[climb.id].attempts && climbTimes[climb.id].attempts! > 1
                      ? ` · ${climbTimes[climb.id].attempts}×`
                      : ''}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </Section>

      {/* Places ridden */}
      <Section
        title="Places you've ridden"
        count={visitedPlaces.length}
        empty="Mark a destination as ridden and it lands here."
        emptyLink={{ to: '/rides', label: 'Browse destinations' }}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {visitedPlaces.map((d) => (
            <DestinationCard key={d.id} destination={d} />
          ))}
        </div>
      </Section>

      {/* The list */}
      <Section
        title="On your list"
        count={savedCount}
        icon={<Bookmark className="w-4 h-4" />}
        empty="Nothing saved yet — add a climb, a route or an event you want to do."
        emptyLink={{ to: '/rides/events', label: 'Find something to train for' }}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {savedPlaces.map((d) => (
            <DestinationCard key={d.id} destination={d} />
          ))}
          {savedClimbs.map((c) => (
            <ClimbCard key={c.id} climb={c} />
          ))}
        </div>
      </Section>

      {/* What's left, by category */}
      <section className="mt-16">
        <h2 className="text-xl font-semibold text-white mb-4">Your progress by terrain</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {categories.map((cat) => {
            const total =
              cat.id === 'climbs'
                ? climbs.length
                : allDestinations.filter((d) => d.category === cat.id).length;
            const done =
              cat.id === 'climbs'
                ? conqueredClimbs.length
                : visitedPlaces.filter((d) => d.category === cat.id).length;
            const pct = total ? (done / total) * 100 : 0;
            return (
              <Link
                key={cat.id}
                to={`/rides/${cat.id}`}
                className="bg-[#1c1915] border border-[#322b24] hover:border-[#4a4038] rounded-2xl p-5 transition-colors"
              >
                <p className="text-[15px] font-semibold text-[#f4efe7]">{cat.label}</p>
                <p className="font-mono-dc text-[11px] text-[#7a7066] mt-1">
                  {done} of {total}
                </p>
                <div className="h-1.5 rounded-full bg-[#2a241e] overflow-hidden mt-3">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${pct}%`, background: cat.color }}
                  />
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function Section({
  title,
  count,
  icon,
  empty,
  emptyLink,
  children,
}: {
  title: string;
  count: number;
  icon?: React.ReactNode;
  empty: string;
  emptyLink?: { to: string; label: string };
  children: React.ReactNode;
}) {
  return (
    <section className="mb-14">
      <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
        {icon && <span className="text-[#dfa04a]">{icon}</span>}
        {title} <span className="text-[#dfa04a] font-mono-dc text-[15px]">{count}</span>
      </h2>
      {count === 0 ? (
        <div className="bg-[#1c1915] ring-1 ring-[#322b24] rounded-2xl p-8 text-center">
          <p className="text-[#a1968a]">{empty}</p>
          {emptyLink && (
            <Link
              to={emptyLink.to}
              className="mt-2 inline-block text-sm text-[#dfa04a] font-medium hover:underline"
            >
              {emptyLink.label}
            </Link>
          )}
        </div>
      ) : (
        children
      )}
    </section>
  );
}
