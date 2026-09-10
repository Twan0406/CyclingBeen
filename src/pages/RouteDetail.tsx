import { lazy, Suspense, useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Download, MapPin, Route as RouteIcon, TrendingUp, Layers, CalendarDays } from 'lucide-react';
import { allDestinations as destinations } from '../data/allDestinations';
import { categories } from '../types/destination';
import { usePageMeta } from '../hooks/usePageMeta';
import { routeSlug } from '../lib/routeSlug';
import { downloadGpx } from '../lib/gpx';
import { snapRoute, type SnapState } from '../lib/snapRoute';

const RouteMap = lazy(() => import('../components/RouteMap'));

export default function RouteDetail() {
  const { id, route: slug } = useParams<{ id: string; route: string }>();
  const navigate = useNavigate();
  const place = destinations.find((d) => d.id === id);
  const route = place?.routes?.find((r) => routeSlug(r.name) === slug);
  const cat = categories.find((c) => c.id === place?.category);

  const wp = useMemo(() => route?.waypoints ?? [], [route]);
  const [snap, setSnap] = useState<SnapState>({ status: 'idle' });

  // Snap the outline onto real roads in the visitor's browser. The straight
  // line stays on screen until it lands, and stays for good if it never does.
  useEffect(() => {
    if (!place || !route || wp.length < 2) return;
    let cancelled = false;
    setSnap({ status: 'loading' });
    snapRoute(`${place.id}/${routeSlug(route.name)}`, wp, place.category)
      .then((track) => {
        if (cancelled) return;
        setSnap(track ? { status: 'ready', track } : { status: 'failed' });
      })
      .catch(() => !cancelled && setSnap({ status: 'failed' }));
    return () => {
      cancelled = true;
    };
  }, [place, route, wp]);

  const track = snap.status === 'ready' ? snap.track : null;
  const line: [number, number][] = track
    ? track.coords.map(([lng, lat]) => [lng, lat])
    : wp.map((w) => [w.lng, w.lat]);

  usePageMeta({
    title: route && place ? `${route.name} — ${place.name} | Ridewild` : 'Route | Ridewild',
    description:
      route && place
        ? `${route.name}: a ${route.distanceKm} km ${route.difficulty} ride from ${place.name}, ${place.country}. Route map, what to expect and a GPX download.`
        : undefined,
  });

  if (!place || !route)
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <p className="text-[#a1968a]">That route could not be found.</p>
        <button onClick={() => navigate('/rides')} className="mt-4 text-[#dfa04a] underline">
          Browse all destinations
        </button>
      </div>
    );

  const color = cat?.color ?? '#dfa04a';

  const others = (place.routes ?? []).filter((r) => r.name !== route.name);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 pb-24">
      <button
        onClick={() => navigate(`/place/${place.id}`)}
        className="inline-flex items-center gap-2 text-[14px] text-[#a1968a] hover:text-[#f4efe7] transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> {place.name}
      </button>

      <p className="font-mono-dc text-[11px] tracking-[0.22em] uppercase text-[#7a7066] mt-6 mb-2">
        {cat?.label} · {place.region}, {place.country}
      </p>
      <h1 className="text-[clamp(28px,4.5vw,42px)] font-semibold text-[#f4efe7] leading-tight">
        {route.name}
      </h1>

      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-4">
        <Stat
          icon={<RouteIcon className="w-4 h-4" />}
          value={`${track ? track.distanceKm.toFixed(1) : route.distanceKm} km`}
        />
        {(track?.elevationM ?? route.elevationM) != null && (
          <Stat
            icon={<TrendingUp className="w-4 h-4" />}
            value={`${Math.round(track?.elevationM ?? route.elevationM!).toLocaleString('de-DE')} m climbing`}
          />
        )}
        <span
          className="font-mono-dc text-[10px] uppercase tracking-[0.1em] px-2 py-0.5 rounded"
          style={{ background: `${difficultyColor(route.difficulty)}22`, color: difficultyColor(route.difficulty) }}
        >
          {route.difficulty}
        </span>
      </div>

      {wp.length > 1 && (
        <div className="mt-7">
          <Suspense fallback={<div className="h-[420px] rounded-[20px] bg-[#1a1712] animate-pulse" />}>
            <RouteMap waypoints={wp} line={line} color={color} />
          </Suspense>
          <p className="font-mono-dc text-[10px] text-[#6b6157] mt-2">
            {snap.status === 'loading' && 'Working out the roads between the points…'}
            {snap.status === 'ready' &&
              `Routed over real roads and tracks: ${track!.distanceKm.toFixed(1)} km${
                track!.elevationM ? `, ${Math.round(track!.elevationM)} m climbing` : ''
              }. Routing by BRouter.`}
            {snap.status === 'failed' &&
              `The routing service could not be reached, so this is the outline through the ${wp.length} points — a planner will snap it onto the roads on import.`}
          </p>
        </div>
      )}

      <p className="text-[18px] text-[#e8e0d4] leading-relaxed mt-8 font-display">{route.description}</p>

      {wp.length > 1 && (
        <>
          <button
            onClick={() => downloadGpx(route, place.name, track)}
            className="mt-7 inline-flex items-center gap-2 text-[15px] font-semibold text-[#1a1206] rounded-full px-6 py-3 transition-opacity hover:opacity-90"
            style={{ background: color }}
          >
            <Download className="w-[17px] h-[17px]" />
            {track ? 'Download GPX' : 'Download GPX outline'}
          </button>

          <section className="mt-10">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-[#dfa04a]" /> The way it goes
            </h2>
            <ol className="space-y-0">
              {wp.map((w, i) => (
                <li key={`${w.name}-${i}`} className="flex items-start gap-3 py-2">
                  <span
                    className="shrink-0 w-[22px] h-[22px] rounded-full border-2 bg-[#14120f] text-[11px] font-semibold leading-[18px] text-center"
                    style={{ borderColor: color, color }}
                  >
                    {i + 1}
                  </span>
                  <span className="text-[15px] text-[#d6cec2]">{w.name}</span>
                </li>
              ))}
            </ol>
          </section>
        </>
      )}

      <section className="mt-10">
        <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
          <CalendarDays className="w-5 h-5 text-[#dfa04a]" /> Riding here
        </h2>
        <div className="grid sm:grid-cols-2 gap-3">
          <Item icon={<CalendarDays className="w-4 h-4" />} label="Best time to go" value={place.bestMonths} />
          <Item icon={<MapPin className="w-4 h-4" />} label="Start from" value={place.startTown} />
          <Item icon={<Layers className="w-4 h-4" />} label="Surface" value={place.surface} />
          {place.refuel && <Item icon={<RouteIcon className="w-4 h-4" />} label="Refuel" value={place.refuel} />}
        </div>
        {place.tips && place.tips.length > 0 && (
          <ul className="mt-4 space-y-2">
            {place.tips.slice(0, 3).map((t) => (
              <li key={t} className="text-[15px] text-[#d6cec2] leading-relaxed flex gap-2">
                <span className="text-[#dfa04a]">·</span> {t}
              </li>
            ))}
          </ul>
        )}
      </section>

      {others.length > 0 && (
        <section className="mt-10">
          <h2 className="text-xl font-semibold text-white mb-4">Other rides from {place.name}</h2>
          <div className="space-y-2">
            {others.map((r) => (
              <Link
                key={r.name}
                to={`/place/${place.id}/route/${routeSlug(r.name)}`}
                className="block bg-[#1c1915] ring-1 ring-[#322b24] hover:ring-[#4a4038] rounded-2xl px-5 py-3.5 transition-colors"
              >
                <p className="text-[16px] font-semibold text-[#f4efe7]">{r.name}</p>
                <p className="font-mono-dc text-[11px] text-[#7a7066] mt-0.5">
                  {r.distanceKm} km
                  {r.elevationM != null ? ` · ${r.elevationM.toLocaleString('de-DE')} m` : ''} · {r.difficulty}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function Stat({ icon, value }: { icon: React.ReactNode; value: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-[15px] text-[#d6cec2]">
      <span className="text-[#dfa04a]">{icon}</span>
      {value}
    </span>
  );
}

function Item({ icon, label, value }: { icon: React.ReactNode; label: string; value?: string }) {
  if (!value) return null;
  return (
    <div className="bg-[#1c1915] ring-1 ring-[#322b24] rounded-2xl px-4 py-3">
      <p className="font-mono-dc text-[10px] uppercase tracking-[0.1em] text-[#7a7066] flex items-center gap-1.5">
        <span className="text-[#dfa04a]">{icon}</span> {label}
      </p>
      <p className="text-[15px] text-[#e8e0d4] mt-1 leading-relaxed">{value}</p>
    </div>
  );
}

function difficultyColor(d: 'easy' | 'moderate' | 'hard') {
  return d === 'easy' ? '#7f8f5f' : d === 'moderate' ? '#dfa04a' : '#c4633a';
}
