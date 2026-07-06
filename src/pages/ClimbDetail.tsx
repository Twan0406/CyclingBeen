import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useClimbs } from '../context/ClimbsContext';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, ArrowUp, Ruler, TrendingUp, Check, Quote, Clock, Repeat } from 'lucide-react';
import ClimbPhoto from '../components/ClimbPhoto';
import { loadRiders, type Rider } from '../lib/riders';
import { formatDuration } from '../lib/strava';

const difficultyColors: Record<string, string> = {
  'easy': 'bg-emerald-400/15 text-emerald-300',
  'medium': 'bg-sky-400/15 text-sky-300',
  'hard': 'bg-orange-400/15 text-orange-300',
  'hors-categorie': 'bg-rose-400/15 text-rose-300',
};

export default function ClimbDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { climbs, climbTimes, toggleCompleted } = useClimbs();
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

  if (!climb) return (
    <div className="max-w-3xl mx-auto px-4 py-16 text-center">
      <p className="text-slate-400">Climb not found.</p>
      <button onClick={() => navigate('/')} className="mt-4 text-amber-400 underline">Go back</button>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto">
      <div className="relative h-72 md:h-96">
        <ClimbPhoto climb={climb} size={1024} className="absolute inset-0 w-full h-full" />
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 bg-[#0a0f1c]/60 hover:bg-[#0a0f1c]/90 backdrop-blur text-white rounded-full p-2 transition-colors z-10 ring-1 ring-white/10"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        {climb.completed && (
          <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-amber-400 text-[#0a0f1c] text-sm font-bold px-3 py-1.5 rounded-full z-10 shadow-lg shadow-amber-500/30">
            <Check className="w-4 h-4" strokeWidth={3} /> Conquered
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f1c] via-[#0a0f1c]/20 to-transparent" />
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
            <div key={s.label} className="bg-[#111827] rounded-2xl ring-1 ring-white/8 p-3 text-center">
              <div className="text-amber-400 flex justify-center mb-1">{s.icon}</div>
              <p className="text-lg font-bold text-white">{s.value}</p>
              <p className="text-xs text-slate-500">{s.label}</p>
            </div>
          ))}
          <div className="bg-[#111827] rounded-2xl ring-1 ring-white/8 p-3 text-center flex flex-col items-center justify-center">
            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${difficultyColors[climb.difficulty]}`}>
              {climb.difficulty === 'hors-categorie' ? 'HC' : climb.difficulty.charAt(0).toUpperCase() + climb.difficulty.slice(1)}
            </span>
            <p className="text-xs text-slate-500 mt-1">Difficulty</p>
          </div>
        </div>

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

        {climb.proRecords && climb.proRecords.length > 0 && (
          <section>
            <h2 className="text-xl font-bold text-white mb-4">Pro Times &amp; Notable Ascents</h2>
            <div className="overflow-hidden rounded-2xl ring-1 ring-white/8">
              {climb.proRecords.map((r, i) => (
                <div key={i} className={`flex items-start gap-4 px-4 py-3 ${i % 2 === 0 ? 'bg-[#111827]' : 'bg-[#0d1424]'}`}>
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
                <blockquote key={i} className="relative bg-[#111827] rounded-2xl p-5 ring-1 ring-white/8 border-l-2 border-amber-400">
                  <Quote className="w-5 h-5 text-amber-400 mb-2 opacity-60" />
                  <p className="text-slate-300 italic leading-relaxed">"{pq.quote}"</p>
                  <footer className="mt-2 text-sm text-slate-500 font-medium">— {pq.cyclist}, {pq.year}</footer>
                </blockquote>
              ))}
            </div>
          </section>
        )}

        <section className="bg-[#111827] rounded-2xl ring-1 ring-white/8 p-5">
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
              <button
                onClick={() => toggleCompleted(climb.id)}
                className="bg-amber-400 hover:bg-amber-300 text-[#0a0f1c] font-bold px-6 py-3 rounded-full transition-all shadow-lg shadow-amber-500/25"
              >
                Mark as Conquered
              </button>
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
                    className={`flex items-center gap-3 px-4 py-3 ${isMe ? 'bg-amber-400/10' : i % 2 === 0 ? 'bg-[#111827]' : 'bg-[#0d1424]'}`}
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
      </div>
    </div>
  );
}
