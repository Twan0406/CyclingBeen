import { useMemo, useState, lazy, Suspense } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import ClimbCard from '../components/ClimbCard';
import DestinationCard from '../components/DestinationCard';
import { useClimbs } from '../context/ClimbsContext';
import { allDestinations as destinations } from '../data/allDestinations';
import { categories, type RideCategory } from '../types/destination';
import { usePageMeta } from '../hooks/usePageMeta';

const RideMap = lazy(() => import('../components/RideMap'));

const CLIMB_COLOR = categories.find((c) => c.id === 'climbs')!.color;

type Tab = RideCategory | 'all';

export default function Explore() {
  const { category } = useParams<{ category?: string }>();
  const navigate = useNavigate();
  const { climbs, visited } = useClimbs();
  const [query, setQuery] = useState('');

  const tab: Tab = (categories.find((c) => c.id === category)?.id ?? 'all') as Tab;
  const meta = categories.find((c) => c.id === tab);

  const q = query.trim().toLowerCase();
  const matches = (...fields: string[]) =>
    !q || fields.some((f) => f.toLowerCase().includes(q));

  const shownClimbs = useMemo(
    () =>
      tab === 'all' || tab === 'climbs'
        ? climbs.filter((c) => matches(c.name, c.country, c.region))
        : [],
    [climbs, tab, q],
  );

  const shownPlaces = useMemo(
    () =>
      destinations.filter(
        (d) =>
          (tab === 'all' || d.category === tab) &&
          matches(d.name, d.country, d.region, d.summary),
      ),
    [tab, q],
  );

  const count = shownClimbs.length + shownPlaces.length;

  /** Everything currently listed, plotted on the globe in its category colour. */
  const points = useMemo(
    () => [
      ...shownClimbs.map((c) => ({
        id: c.id,
        name: c.name,
        lat: c.lat,
        lng: c.lng,
        color: CLIMB_COLOR,
        done: c.completed,
        href: `/climb/${c.id}`,
      })),
      ...shownPlaces.map((d) => ({
        id: d.id,
        name: d.name,
        lat: d.lat,
        lng: d.lng,
        color: categories.find((c) => c.id === d.category)?.color ?? '#7d9aa8',
        done: visited.has(d.id),
        href: `/place/${d.id}`,
      })),
    ],
    [shownClimbs, shownPlaces, visited],
  );

  /** Only the categories actually on the map, so the legend stays honest. */
  const legend = useMemo(() => {
    const present = new Set(points.map((p) => p.color));
    return categories.filter((c) => present.has(c.color)).map((c) => ({ label: c.label, color: c.color }));
  }, [points]);

  usePageMeta({
    title: meta
      ? `${meta.label} — where to ride | Ridewild`
      : 'Where to ride — every destination | Ridewild',
    description: meta
      ? `${meta.tagline}. Hand-picked ${meta.label.toLowerCase()} destinations with practical ride guides.`
      : 'Browse every cycling destination: legendary mountain passes, gravel, hills, flat coastal riding and mountain bike trails.',
  });

  return (
    <div className="max-w-[1240px] mx-auto px-6 md:px-12 py-10 pb-24">
      <p className="font-mono-dc text-[11px] tracking-[0.22em] uppercase text-[#7a7066] mb-3">
        Where to ride
      </p>
      <h1 className="text-[clamp(30px,4.5vw,46px)] font-semibold text-[#f4efe7]">
        {meta ? meta.label : 'Every destination'}
      </h1>
      <p className="text-[16px] text-[#a1968a] mt-2 max-w-[60ch]">
        {meta ? meta.tagline : 'Mountains, gravel, hills, coastline and trails — all in one place.'}
      </p>

      {/* Category tabs */}
      <div className="flex flex-wrap gap-2.5 mt-8">
        <Tab active={tab === 'all'} onClick={() => navigate('/rides')} label="All" />
        {categories.map((c) => (
          <Tab
            key={c.id}
            active={tab === c.id}
            color={c.color}
            onClick={() => navigate(`/rides/${c.id}`)}
            label={c.label}
          />
        ))}
      </div>

      {/* Search */}
      <div className="relative mt-5 max-w-[420px]">
        <Search className="absolute left-[18px] top-1/2 -translate-y-1/2 w-[15px] h-[15px] text-[#7a7066]" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search a place or country…"
          className="w-full bg-[#1c1915] border border-[#3a322a] rounded-full pl-11 pr-[18px] py-[9px] text-[14px] text-[#f4efe7] placeholder:text-[#7a7066] focus:border-[#dfa04a]/50 focus:outline-none transition-colors"
        />
      </div>

      {/* The globe follows the tab: one category, or everything at once. */}
      {points.length > 0 && (
        <div className="mt-8">
          <Suspense fallback={<div className="h-[560px] rounded-[24px] bg-[#1a1712] animate-pulse" />}>
            <RideMap points={points} legend={legend} />
          </Suspense>
        </div>
      )}

      <p className="font-mono-dc text-[11px] uppercase tracking-[0.12em] text-[#6b6157] mt-10 mb-4">
        {count} {count === 1 ? 'destination' : 'destinations'}
      </p>

      {count === 0 ? (
        <p className="text-[#7a7066] text-center py-16">Nothing matches that search.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {shownPlaces.map((d) => (
            <DestinationCard key={d.id} destination={d} />
          ))}
          {shownClimbs.map((c) => (
            <ClimbCard key={c.id} climb={c} />
          ))}
        </div>
      )}
    </div>
  );
}

function Tab({
  active,
  label,
  onClick,
  color,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
  color?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`text-[14px] px-5 py-[9px] rounded-full transition-colors border ${
        active
          ? 'text-[#1a1206] font-semibold border-transparent'
          : 'bg-transparent border-[#3a322a] text-[#d6cec2] font-medium hover:border-[#6b6157]'
      }`}
      style={active ? { background: color ?? '#dfa04a' } : undefined}
    >
      {label}
    </button>
  );
}
