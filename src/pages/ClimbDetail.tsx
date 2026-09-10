import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useClimbs } from '../context/ClimbsContext';
import { useAuth } from '../context/AuthContext';
import {
  ArrowLeft, ArrowUp, Ruler, TrendingUp, Check, Quote, Clock, Repeat,
  CalendarDays, MapPin, Settings2, Timer, Lightbulb, Play, Compass, Bookmark,
} from 'lucide-react';
import ClimbPhoto from '../components/ClimbPhoto';
import { loadRiders, type Rider } from '../lib/riders';
import { formatDuration } from '../lib/strava';
import { usePageMeta } from '../hooks/usePageMeta';
import {
  seasonFor, gearingFor, estimatedAmateurMinutes, nearbyClimbs, videoSearchUrl,
} from '../lib/climbGuide';

const difficultyColors: Record<string, string> = {
  'easy': 'bg-emerald-400/15 text-emerald-300',
  'medium': 'bg-sky-400/15 text-sky-300',
  'hard': 'bg-orange-400/15 text-orange-300',
  'hors-categorie': 'bg-rose-400/15 text-rose-300',
};

export default function ClimbDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { climbs, climbTimes, toggleCompleted, wishlist, toggleWishlist } = useClimbs();
  const isWished = id ? wishlist.has(id) : false;
  const { user } = useAuth();
  const climb = climbs.find((c) => c.id === id);
  const myTime = id ? climbTimes[id] : undefined;

  const [riders, setRiders] = useState<Rider[]>([]);
  useEffect(() => {
    if (!user) {
      setRiders([]);
      return;
    }
    loadRiders().then(setRiders).catch(() => {});
  }, [user]);

  const board = id
    ? riders
        .filter((r) => r.climbTimes[id])
        .map((r) => ({ rider: r, t: r.climbTimes[id] }))
        .sort((a, b) => a.t.seconds - b.t.seconds)
    : [];

  const nearby = climb ? nearbyClimbs(climb, climbs) : [];

  usePageMeta({
    title: climb ? `${climb.name} — cycling guide | Ridewild` : 'Climb | Ridewild',
    description: climb
      ? `${climb.name}: ${climb.lengthKm} km at ${climb.avgGradientPct}% to ${climb.elevationM} m in ${climb.region}, ${climb.country}. ${climb.shortDescription}`
      : undefined,
  });

  if (!climb) return (
    <div className="max-w-3xl mx-auto px-4 py-16 text-center">
      <p className="text-slate-400">Climb not found.</p>
      <button onClick={() => navigate('/')} className="mt-4 text-amber-400 underline">Go back</button>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto">
      <div className="relative h-72 md:h-96">
        <ClimbPhoto subject={climb} size={1024} className="absolute inset-0 w-full h-full" />
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 bg-[#14120f]/60 hover:bg-[#14120f]/90 backdrop-blur text-white rounded-full p-2 transition-colors z-10 ring-1 ring-white/10"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        {climb.completed && (
          <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-amber-400 text-[#14120f] text-sm font-bold px-3 py-1.5 rounded-full z-10 shadow-lg shadow-amber-500/30">
            <Check className="w-4 h-4" strokeWidth={3} /> Conquered
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#14120f] via-[#14120f]/20 to-transparent" />
        <div className="absolute bottom-6 left-6 right-6 z-10">
          <h1 className="text-white text-4xl font-bold tracking-tight">{climb.name}</h1>
          <p className="text-slate-300 mt-1">{climb.region}, {climb.country}</p>
        </div>
      </div>

      <div className="px-4 py-6 space-y-8">
        <div className="grid grid-cols-4 gap-3">
          {[
            { icon: <ArrowUp className="w-4 h-4" />, value: `${climb.elevationM.toLocaleString()}m`, label: 'Elevation' },
            { icon: <Ruler className="w-4 h-4" />, value: `${climb.lengthKm}km`, label: 'Length' },
            { icon: <TrendingUp className="w-4 h-4" />, value: `${climb.avgGradientPct}%`, label: 'Avg Grade' },
          ].map((s) => (
            <div key={s.label} className="bg-[#1c1915] rounded-2xl ring-1 ring-white/8 p-3 text-center">
              <div className="text-amber-400 flex justify-center mb-1">{s.icon}</div>
              <p className="text-lg font-bold text-white">{s.value}</p>
              <p className="text-xs text-slate-500">{s.label}</p>
            </div>
          ))}
          <div className="bg-[#1c1915] rounded-2xl ring-1 ring-white/8 p-3 text-center flex flex-col items-center justify-center">
            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${difficultyColors[climb.difficulty]}`}>
              {climb.difficulty === 'hors-categorie' ? 'HC' : climb.difficulty.charAt(0).toUpperCase() + climb.difficulty.slice(1)}
            </span>
            <p className="text-xs text-slate-500 mt-1">Difficulty</p>
          </div>
        </div>

        {/* Ride guide */}
        <section>
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Compass className="w-5 h-5 text-[#dfa04a]" /> Plan your ride
          </h2>
          <div className="grid sm:grid-cols-2 gap-3">
            <GuideItem
              icon={<CalendarDays className="w-4 h-4" />}
              label="Best time to go"
              value={seasonFor(climb)}
            />
            <GuideItem
              icon={<MapPin className="w-4 h-4" />}
              label="Start from"
              value={climb.startTown ?? `${climb.region}, ${climb.country}`}
            />
            <GuideItem
              icon={<Settings2 className="w-4 h-4" />}
              label="Gearing"
              value={gearingFor(climb)}
            />
            <GuideItem
              icon={<Timer className="w-4 h-4" />}
              label="Typical amateur time"
              value={`around ${estimatedAmateurMinutes(climb)} min`}
            />
          </div>
          <p className="font-mono-dc text-[10px] text-[#6b6157] mt-2 uppercase tracking-[0.1em]">
            Season and timing are estimates from elevation and gradient
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-white mb-3">The Story</h2>
          <p className="text-slate-400 leading-relaxed">{climb.story}</p>
        </section>

        {climb.tourHistory && (
          <section>
            <h2 className="text-xl font-bold text-white mb-3">Race History</h2>
            <div className="bg-amber-400/8 rounded-2xl p-5 ring-1 ring-amber-400/20">
              <p className="text-slate-300 leading-relaxed">{climb.tourHistory}</p>
            </div>
          </section>
        )}

        {climb.tips && climb.tips.length > 0 && (
          <section>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-[#dfa04a]" /> Local tips
            </h2>
            <ul className="space-y-2">
              {climb.tips.map((tip, i) => (
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

        {climb.proRecords && climb.proRecords.length > 0 && (
          <section>
            <h2 className="text-xl font-bold text-white mb-4">Pro Times &amp; Notable Ascents</h2>
            <div className="overflow-hidden rounded-2xl ring-1 ring-white/8">
              {climb.proRecords.map((r, i) => (
                <div key={i} className={`flex items-start gap-4 px-4 py-3 ${i % 2 === 0 ? 'bg-[#1c1915]' : 'bg-[#201c17]'}`}>
                  <div className="min-w-[70px] text-center">
                    <p className="text-base font-bold text-amber-400">{r.time}</p>
                    <p className="text-xs text-slate-500">{r.year}</p>
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-white">{r.rider}</p>
                    {r.note && <p className="text-sm text-slate-500">{r.note}</p>}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {climb.proQuotes && climb.proQuotes.length > 0 && (
          <section>
            <h2 className="text-xl font-bold text-white mb-4">Pros on this Climb</h2>
            <div className="space-y-4">
              {climb.proQuotes.map((pq, i) => (
                <blockquote key={i} className="relative bg-[#1c1915] rounded-2xl p-5 ring-1 ring-white/8 border-l-2 border-amber-400">
                  <Quote className="w-5 h-5 text-amber-400 mb-2 opacity-60" />
                  <p className="text-slate-300 italic leading-relaxed">"{pq.quote}"</p>
                  <footer className="mt-2 text-sm text-slate-500 font-medium">— {pq.cyclist}, {pq.year}</footer>
                </blockquote>
              ))}
            </div>
          </section>
        )}

        <section className="bg-[#1c1915] rounded-2xl ring-1 ring-white/8 p-5">
          <h2 className="text-xl font-bold text-white mb-4">Your Ride</h2>
          {climb.completed ? (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-400/15 rounded-full flex items-center justify-center">
                <Check className="w-5 h-5 text-amber-400" strokeWidth={3} />
              </div>
              <div>
                <p className="font-semibold text-white">You've conquered this!</p>
                {myTime ? (
                  <p className="text-sm text-amber-300 flex items-center gap-2 flex-wrap">
                    <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {formatDuration(myTime.seconds)}</span>
                    <span className="text-slate-500">{myTime.isSegmentTime ? 'climb time' : 'ride time'}</span>
                    {myTime.attempts && myTime.attempts > 1 && (
                      <span className="text-slate-500 flex items-center gap-1"><Repeat className="w-3 h-3" /> {myTime.attempts}× ridden</span>
                    )}
                  </p>
                ) : (
                  <p className="text-sm text-slate-500">It's in your collection.</p>
                )}
              </div>
              <button
                onClick={() => toggleCompleted(climb.id)}
                className="ml-auto text-sm text-slate-500 hover:text-rose-400 transition-colors self-start"
              >
                Remove
              </button>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-slate-400 text-sm mb-4">Ridden this one?</p>
              <div className="flex flex-wrap gap-3 justify-center">
                <button
                  onClick={() => toggleCompleted(climb.id)}
                  className="bg-amber-400 hover:bg-amber-300 text-[#14120f] font-bold px-6 py-3 rounded-full transition-all shadow-lg shadow-amber-500/25"
                >
                  Mark as Conquered
                </button>
                <button
                  onClick={() => toggleWishlist(climb.id)}
                  className={`inline-flex items-center gap-2 px-6 py-3 rounded-full font-semibold transition-colors ${
                    isWished
                      ? 'bg-[#c4633a] text-[#fdf6ec] hover:bg-[#d4703f]'
                      : 'border border-[#4a4038] text-[#f4efe7] hover:border-[#6b6157]'
                  }`}
                >
                  <Bookmark className={`w-4 h-4 ${isWished ? 'fill-current' : ''}`} />
                  {isWished ? 'On your list' : 'Add to my list'}
                </button>
              </div>
            </div>
          )}
        </section>

        {board.length > 0 && (
          <section>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-400" /> Times on this climb
            </h2>
            <div className="overflow-hidden rounded-2xl ring-1 ring-white/8">
              {board.map(({ rider, t }, i) => {
                const isMe = rider.uid === user?.uid;
                return (
                  <div
                    key={rider.uid}
                    className={`flex items-center gap-3 px-4 py-3 ${isMe ? 'bg-amber-400/10' : i % 2 === 0 ? 'bg-[#1c1915]' : 'bg-[#201c17]'}`}
                  >
                    <span className="w-5 text-center font-bold text-slate-500">{i + 1}</span>
                    {rider.photoURL ? (
                      <img src={rider.photoURL} alt="" className="w-8 h-8 rounded-full ring-1 ring-white/15" />
                    ) : (
                      <span className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-white">
                        {(rider.displayName || '?').charAt(0).toUpperCase()}
                      </span>
                    )}
                    <span className="flex-1 min-w-0 truncate text-white font-medium">
                      {rider.displayName || 'Rider'} {isMe && <span className="text-amber-300 text-xs">(you)</span>}
                    </span>
                    {t.attempts && t.attempts > 1 && (
                      <span className="text-xs text-slate-500 flex items-center gap-1"><Repeat className="w-3 h-3" />{t.attempts}×</span>
                    )}
                    <span className="font-bold text-amber-300">{formatDuration(t.seconds)}</span>
                  </div>
                );
              })}
            </div>
            <p className="text-xs text-slate-600 mt-2">Fastest recorded time per rider, from Strava.</p>
          </section>
        )}

        {/* Watch the climb */}
        <section>
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Play className="w-5 h-5 text-[#dfa04a]" /> Watch the climb
          </h2>
          {climb.videoId ? (
            <div className="relative w-full rounded-2xl overflow-hidden ring-1 ring-[#322b24] aspect-video">
              <iframe
                className="absolute inset-0 w-full h-full"
                src={`https://www.youtube.com/embed/${climb.videoId}`}
                title={`${climb.name} ascent`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          ) : (
            <a
              href={videoSearchUrl(climb)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 bg-[#1c1915] ring-1 ring-[#322b24] hover:ring-[#dfa04a]/40 rounded-2xl px-5 py-4 transition-colors group"
            >
              <span className="w-10 h-10 rounded-full bg-[#dfa04a]/15 flex items-center justify-center shrink-0">
                <Play className="w-4 h-4 text-[#dfa04a]" />
              </span>
              <span>
                <span className="block text-white font-semibold group-hover:text-[#dfa04a] transition-colors">
                  See {climb.name} from the saddle
                </span>
                <span className="block text-[13px] text-[#a1968a]">
                  On-bike footage of the ascent on YouTube
                </span>
              </span>
            </a>
          )}
        </section>

        {/* Nearby climbs */}
        {nearby.length > 0 && (
          <section>
            <h2 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
              <Compass className="w-5 h-5 text-[#dfa04a]" /> Ride these too
            </h2>
            <p className="text-[13px] text-[#a1968a] mb-4">
              Other climbs within reach — the makings of a trip.
            </p>
            <div className="grid sm:grid-cols-2 gap-2">
              {nearby.map(({ climb: n, km }) => (
                <Link
                  key={n.id}
                  to={`/climb/${n.id}`}
                  className="flex items-center gap-3 bg-[#1c1915] ring-1 ring-[#322b24] hover:ring-[#dfa04a]/40 rounded-xl px-4 py-3 transition-colors group"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-white font-semibold truncate group-hover:text-[#dfa04a] transition-colors">
                      {n.name}
                    </p>
                    <p className="text-[12px] text-[#a1968a] truncate">
                      {n.elevationM.toLocaleString('de-DE')} m · {n.lengthKm} km
                    </p>
                  </div>
                  <span className="font-mono-dc text-[11px] text-[#7a7066] shrink-0">
                    {Math.round(km)} km
                  </span>
                  {n.completed && <Check className="w-4 h-4 text-[#dfa04a] shrink-0" strokeWidth={3} />}
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

function GuideItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
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
