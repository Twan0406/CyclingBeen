import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft, CalendarDays, MapPin, Route, TrendingUp, Layers, Lightbulb, Compass, Play,
  Tent, Flag, Sparkles, Backpack, Train, Home, Coffee, Check, Bookmark, Download,
} from 'lucide-react';
import ClimbPhoto from '../components/ClimbPhoto';
import { allDestinations as destinations } from '../data/allDestinations';
import { categories } from '../types/destination';
import { usePageMeta } from '../hooks/usePageMeta';
import { distanceKm } from '../lib/polyline';
import { useClimbs } from '../context/ClimbsContext';
import { downloadGpx } from '../lib/gpx';

export default function DestinationDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const place = destinations.find((d) => d.id === id);
  const cat = categories.find((c) => c.id === place?.category);
  const { visited, toggleVisited, wishlist, toggleWishlist } = useClimbs();
  const isVisited = id ? visited.has(id) : false;
  const isWished = id ? wishlist.has(id) : false;

  usePageMeta({
    title: place ? `${place.name} — cycling guide | Ridewild` : 'Destination | Ridewild',
    description: place
      ? `Cycling in ${place.name}, ${place.country}: ${place.summary}. Best time to go, where to start, and practical local tips.`
      : undefined,
  });

  if (!place)
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <p className="text-[#a1968a]">Destination not found.</p>
        <button onClick={() => navigate('/rides')} className="mt-4 text-[#dfa04a] underline">
          Browse all destinations
        </button>
      </div>
    );

  const nearby = destinations
    .filter((d) => d.id !== place.id)
    .map((d) => ({ d, km: distanceKm(place.lat, place.lng, d.lat, d.lng) }))
    .filter((n) => n.km <= 400)
    .sort((a, b) => a.km - b.km)
    .slice(0, 4);

  return (
    <div className="max-w-3xl mx-auto">
      <div className="relative h-72 md:h-96">
        <ClimbPhoto subject={place} size={1024} className="absolute inset-0 w-full h-full" />
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 bg-[#14120f]/60 hover:bg-[#14120f]/90 backdrop-blur text-white rounded-full p-2 transition-colors z-10 ring-1 ring-white/10"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        {cat && (
          <span
            className="absolute top-4 right-4 z-10 font-mono-dc text-[10px] font-medium tracking-[0.08em] uppercase px-3 py-1.5 rounded-full"
            style={{ background: cat.color, color: '#1a1206' }}
          >
            {cat.label}
          </span>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#14120f] via-[#14120f]/20 to-transparent" />
        <div className="absolute bottom-6 left-6 right-6 z-10">
          <h1 className="text-[#f8f4ec] text-4xl font-semibold">{place.name}</h1>
          <p className="text-[#d6cec2] mt-1">
            {place.region}, {place.country}
          </p>
        </div>
      </div>

      <div className="px-4 py-8 space-y-10">
        <p className="text-[19px] text-[#e8e0d4] leading-relaxed font-display">{place.summary}</p>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => toggleVisited(place.id)}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-colors ${
              isVisited
                ? 'bg-[#dfa04a] text-[#1a1206] hover:bg-[#e8b463]'
                : 'border border-[#4a4038] text-[#f4efe7] hover:border-[#6b6157]'
            }`}
          >
            <Check className="w-4 h-4" strokeWidth={3} />
            {isVisited ? "You've ridden here" : "I've ridden here"}
          </button>
          <button
            onClick={() => toggleWishlist(place.id)}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-colors ${
              isWished
                ? 'bg-[#c4633a] text-[#fdf6ec] hover:bg-[#d4703f]'
                : 'border border-[#4a4038] text-[#f4efe7] hover:border-[#6b6157]'
            }`}
          >
            <Bookmark className={`w-4 h-4 ${isWished ? 'fill-current' : ''}`} />
            {isWished ? 'On your list' : 'Add to my list'}
          </button>
        </div>

        <section className="prose-ride">
          <p>{place.story}</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <Compass className="w-5 h-5 text-[#dfa04a]" /> Plan your ride
          </h2>
          <div className="grid sm:grid-cols-2 gap-3">
            <Item icon={<CalendarDays className="w-4 h-4" />} label="Best time to go" value={place.bestMonths} />
            <Item icon={<MapPin className="w-4 h-4" />} label="Start from" value={place.startTown} />
            <Item icon={<Layers className="w-4 h-4" />} label="Surface" value={place.surface} />
            <Item
              icon={<Route className="w-4 h-4" />}
              label={place.category === 'events' ? 'Main distance' : 'Typical ride'}
              value={
                place.elevationGainM != null
                  ? `${place.typicalRideKm} km · ${place.elevationGainM.toLocaleString('de-DE')} m climbing`
                  : `${place.typicalRideKm} km`
              }
            />
            {place.days != null && place.totalKm != null && (
              <Item
                icon={<Tent className="w-4 h-4" />}
                label="The whole route"
                value={`${place.totalKm.toLocaleString('de-DE')} km in about ${place.days} days${
                  place.totalElevationM
                    ? ` · ${place.totalElevationM.toLocaleString('de-DE')} m climbing`
                    : ''
                }`}
              />
            )}
            {place.whenHeld && (
              <Item icon={<Flag className="w-4 h-4" />} label="When it's held" value={place.whenHeld} />
            )}
            {place.distanceOptionsKm && place.distanceOptionsKm.length > 1 && (
              <Item
                icon={<Route className="w-4 h-4" />}
                label="Distance options"
                value={place.distanceOptionsKm.map((d) => `${d} km`).join(' · ')}
              />
            )}
          </div>
          {place.eventNote && (
            <p className="font-mono-dc text-[10px] text-[#6b6157] mt-2 uppercase tracking-[0.1em]">
              {place.eventNote}
            </p>
          )}
        </section>

        {place.routes && place.routes.length > 0 && (
          <section>
            <h2 className="text-xl font-semibold text-white mb-1 flex items-center gap-2">
              <Route className="w-5 h-5 text-[#dfa04a]" /> Rides to do here
            </h2>
            <p className="text-[13px] text-[#a1968a] mb-4">
              Suggested routes, from a half day to a full one. The GPX files are course
              outlines through the real places each ride passes — import one into Komoot,
              Garmin or RideWithGPS and it snaps onto the roads.
            </p>
            <div className="space-y-3">
              {place.routes.map((r) => (
                <article
                  key={r.name}
                  className="bg-[#1c1915] ring-1 ring-[#322b24] rounded-2xl px-5 py-4"
                >
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <h3 className="text-[17px] font-semibold text-[#f4efe7]">{r.name}</h3>
                    <span
                      className="font-mono-dc text-[10px] uppercase tracking-[0.1em] px-2 py-0.5 rounded"
                      style={{
                        background: `${difficultyColor(r.difficulty)}22`,
                        color: difficultyColor(r.difficulty),
                      }}
                    >
                      {r.difficulty}
                    </span>
                  </div>
                  <p className="font-mono-dc text-[11px] text-[#7a7066] mt-1">
                    {r.distanceKm} km
                    {r.elevationM != null ? ` · ${r.elevationM.toLocaleString('de-DE')} m climbing` : ''}
                  </p>
                  <p className="text-[15px] text-[#d6cec2] mt-2 leading-relaxed">{r.description}</p>
                  {r.waypoints && r.waypoints.length > 1 && (
                    <>
                      <button
                        onClick={() => downloadGpx(r, place.name)}
                        className="mt-3 inline-flex items-center gap-2 text-[13px] font-semibold text-[#dfa04a] border border-[#dfa04a]/40 hover:bg-[#dfa04a]/10 rounded-full px-4 py-1.5 transition-colors"
                      >
                        <Download className="w-[15px] h-[15px]" /> Download GPX
                      </button>
                      <p className="font-mono-dc text-[10px] text-[#6b6157] mt-2">
                        via {r.waypoints.map((w) => w.name).join(' · ')}
                      </p>
                    </>
                  )}
                </article>
              ))}
            </div>
          </section>
        )}

        {place.highlights && place.highlights.length > 0 && (
          <section>
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#dfa04a]" /> Don't miss
            </h2>
            <ul className="space-y-2">
              {place.highlights.map((h, i) => (
                <li key={i} className="flex gap-3 text-[15px] text-[#d6cec2] leading-relaxed">
                  <span className="text-[#dfa04a] font-bold shrink-0">·</span>
                  {h}
                </li>
              ))}
            </ul>
          </section>
        )}

        {(place.gettingThere || place.basedIn || place.refuel) && (
          <section>
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <Backpack className="w-5 h-5 text-[#dfa04a]" /> Practicalities
            </h2>
            <div className="space-y-3">
              {place.gettingThere && (
                <Item icon={<Train className="w-4 h-4" />} label="Getting there" value={place.gettingThere} />
              )}
              {place.basedIn && (
                <Item icon={<Home className="w-4 h-4" />} label="Where to base yourself" value={place.basedIn} />
              )}
              {place.refuel && (
                <Item icon={<Coffee className="w-4 h-4" />} label="Food & water" value={place.refuel} />
              )}
            </div>
          </section>
        )}

        {place.tips.length > 0 && (
          <section>
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-[#dfa04a]" /> Local tips
            </h2>
            <ul className="space-y-2">
              {place.tips.map((tip, i) => (
                <li
                  key={i}
                  className="flex gap-3 bg-[#1c1915] ring-1 ring-[#322b24] rounded-xl px-4 py-3 text-[15px] text-[#d6cec2] leading-relaxed"
                >
                  <span className="text-[#dfa04a] font-bold">·</span>
                  {tip}
                </li>
              ))}
            </ul>
          </section>
        )}

        <section>
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <Play className="w-5 h-5 text-[#dfa04a]" /> See it first
          </h2>
          <a
            href={`https://www.youtube.com/results?search_query=${encodeURIComponent(
              `cycling ${place.name} ${place.country}`,
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 bg-[#1c1915] ring-1 ring-[#322b24] hover:ring-[#dfa04a]/40 rounded-2xl px-5 py-4 transition-colors group"
          >
            <span className="w-10 h-10 rounded-full bg-[#dfa04a]/15 flex items-center justify-center shrink-0">
              <Play className="w-4 h-4 text-[#dfa04a]" />
            </span>
            <span>
              <span className="block text-white font-semibold group-hover:text-[#dfa04a] transition-colors">
                Ride {place.name} from the saddle
              </span>
              <span className="block text-[13px] text-[#a1968a]">Footage from the area on YouTube</span>
            </span>
          </a>
        </section>

        {nearby.length > 0 && (
          <section>
            <h2 className="text-xl font-semibold text-white mb-1 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[#dfa04a]" /> Combine with
            </h2>
            <p className="text-[13px] text-[#a1968a] mb-4">Other destinations within reach.</p>
            <div className="grid sm:grid-cols-2 gap-2">
              {nearby.map(({ d, km }) => (
                <Link
                  key={d.id}
                  to={`/place/${d.id}`}
                  className="flex items-center gap-3 bg-[#1c1915] ring-1 ring-[#322b24] hover:ring-[#dfa04a]/40 rounded-xl px-4 py-3 transition-colors group"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-white font-semibold truncate group-hover:text-[#dfa04a] transition-colors">
                      {d.name}
                    </p>
                    <p className="text-[12px] text-[#a1968a] truncate">{d.summary}</p>
                  </div>
                  <span className="font-mono-dc text-[11px] text-[#7a7066] shrink-0">
                    {Math.round(km)} km
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

function Item({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex gap-3 bg-[#1c1915] ring-1 ring-[#322b24] rounded-xl px-4 py-3">
      <span className="text-[#dfa04a] mt-0.5 shrink-0">{icon}</span>
      <span className="min-w-0">
        <span className="block font-mono-dc text-[9px] tracking-[0.12em] uppercase text-[#6b6157] mb-1">
          {label}
        </span>
        <span className="block text-[14px] text-[#f4efe7] leading-snug">{value}</span>
      </span>
    </div>
  );
}

function difficultyColor(d: 'easy' | 'moderate' | 'hard'): string {
  if (d === 'easy') return '#7f8f5f';
  if (d === 'moderate') return '#dfa04a';
  return '#c4633a';
}
