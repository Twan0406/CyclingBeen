import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft, CalendarDays, MapPin, Route, TrendingUp, Layers, Lightbulb, Compass, Play,
} from 'lucide-react';
import ClimbPhoto from '../components/ClimbPhoto';
import { destinations } from '../data/destinations';
import { categories } from '../types/destination';
import { usePageMeta } from '../hooks/usePageMeta';
import { distanceKm } from '../lib/polyline';

export default function DestinationDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const place = destinations.find((d) => d.id === id);
  const cat = categories.find((c) => c.id === place?.category);

  usePageMeta({
    title: place ? `${place.name} — cycling guide | Collect` : 'Destination | Collect',
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
              label="Typical ride"
              value={
                place.elevationGainM != null
                  ? `${place.typicalRideKm} km · ${place.elevationGainM.toLocaleString('de-DE')} m climbing`
                  : `${place.typicalRideKm} km`
              }
            />
          </div>
        </section>

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
