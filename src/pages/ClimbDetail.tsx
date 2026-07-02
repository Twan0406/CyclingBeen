import { useParams, useNavigate } from 'react-router-dom';
import { useClimbs } from '../context/ClimbsContext';
import { ArrowLeft, ArrowUp, Ruler, TrendingUp, CheckCircle, Quote } from 'lucide-react';

const difficultyColors: Record<string, string> = {
  'easy': 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  'medium': 'bg-yellow-500/15 text-yellow-300 border-yellow-500/30',
  'hard': 'bg-orange-500/15 text-orange-300 border-orange-500/30',
  'hors-categorie': 'bg-red-500/15 text-red-300 border-red-500/30',
};

export default function ClimbDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { climbs, loading, toggleCompleted } = useClimbs();
  const climb = climbs.find(c => c.id === id);

  if (loading) return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="h-64 bg-white/5 rounded-3xl animate-pulse mb-6" />
      <div className="space-y-3">
        <div className="h-6 bg-white/5 rounded animate-pulse w-3/4" />
        <div className="h-4 bg-white/5 rounded animate-pulse w-1/2" />
      </div>
    </div>
  );

  if (!climb) return (
    <div className="max-w-3xl mx-auto px-4 py-16 text-center">
      <p className="text-gray-400">Climb not found.</p>
      <button onClick={() => navigate('/')} className="mt-4 text-[#2fd6a0] underline">Go back</button>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto">
      <div className="relative h-72 md:h-96 bg-cover bg-center" style={{ background: climb.gradient }}>
        <img
          src={climb.photoUrl}
          alt={climb.name}
          onError={(e) => { e.currentTarget.style.display = 'none'; }}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 bg-[#070b0a]/60 hover:bg-[#070b0a]/90 backdrop-blur text-white rounded-full p-2 transition-colors z-10 border border-white/10"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        {climb.completed && (
          <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-[#1D9E75] text-[#070b0a] text-sm font-bold px-3 py-1.5 rounded-full z-10 shadow-[0_0_18px_rgba(29,158,117,0.7)]">
            <CheckCircle className="w-4 h-4" /> Conquered
          </div>
        )}
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#070b0a] to-transparent" />
        <div className="absolute bottom-6 left-6 right-6">
          <h1 className="text-white text-4xl font-bold">{climb.name}</h1>
          <p className="text-gray-400 mt-1">{climb.region}, {climb.country}</p>
        </div>
      </div>

      <div className="px-4 py-6 space-y-8">
        <div className="grid grid-cols-4 gap-3">
          <div className="bg-[#0d1412] rounded-2xl border border-[#1D9E75]/20 p-3 text-center">
            <ArrowUp className="w-4 h-4 text-[#2fd6a0] mx-auto mb-1" />
            <p className="text-lg font-bold text-white">{climb.elevationM.toLocaleString()}m</p>
            <p className="text-xs text-gray-500">Elevation</p>
          </div>
          <div className="bg-[#0d1412] rounded-2xl border border-[#1D9E75]/20 p-3 text-center">
            <Ruler className="w-4 h-4 text-[#2fd6a0] mx-auto mb-1" />
            <p className="text-lg font-bold text-white">{climb.lengthKm}km</p>
            <p className="text-xs text-gray-500">Length</p>
          </div>
          <div className="bg-[#0d1412] rounded-2xl border border-[#1D9E75]/20 p-3 text-center">
            <TrendingUp className="w-4 h-4 text-[#2fd6a0] mx-auto mb-1" />
            <p className="text-lg font-bold text-white">{climb.avgGradientPct}%</p>
            <p className="text-xs text-gray-500">Avg Grade</p>
          </div>
          <div className="bg-[#0d1412] rounded-2xl border border-[#1D9E75]/20 p-3 text-center flex flex-col items-center justify-center">
            <span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${difficultyColors[climb.difficulty]}`}>
              {climb.difficulty === 'hors-categorie' ? 'HC' : climb.difficulty.charAt(0).toUpperCase() + climb.difficulty.slice(1)}
            </span>
            <p className="text-xs text-gray-500 mt-1">Difficulty</p>
          </div>
        </div>

        <section>
          <h2 className="text-xl font-bold text-white mb-3">The Story</h2>
          <p className="text-gray-400 leading-relaxed">{climb.story}</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-white mb-3">Race History</h2>
          <div className="bg-[#1D9E75]/8 rounded-2xl p-5 border border-[#1D9E75]/25">
            <p className="text-gray-300 leading-relaxed">{climb.tourHistory}</p>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-bold text-white mb-4">Pro Times &amp; Notable Ascents</h2>
          <div className="overflow-hidden rounded-2xl border border-white/10">
            {climb.proRecords.map((r, i) => (
              <div
                key={i}
                className={`flex items-start gap-4 px-4 py-3 ${i % 2 === 0 ? 'bg-[#0d1412]' : 'bg-[#0a100e]'}`}
              >
                <div className="min-w-[70px] text-center">
                  <p className="text-base font-bold neon-green">{r.time}</p>
                  <p className="text-xs text-gray-500">{r.year}</p>
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-white">{r.rider}</p>
                  {r.note && <p className="text-sm text-gray-500">{r.note}</p>}
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-600 mt-2">Times are the fastest known / most notable ascents; a dash means no official time was recorded.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-white mb-4">Pros on this Climb</h2>
          <div className="space-y-4">
            {climb.proQuotes.map((pq, i) => (
              <blockquote key={i} className="relative bg-[#0d1412] rounded-2xl p-5 border-l-4 border-[#1D9E75] border-t border-r border-b border-white/5">
                <Quote className="w-5 h-5 text-[#2fd6a0] mb-2 opacity-60" />
                <p className="text-gray-300 italic leading-relaxed">"{pq.quote}"</p>
                <footer className="mt-2 text-sm text-gray-500 font-medium">
                  — {pq.cyclist}, {pq.year}
                </footer>
              </blockquote>
            ))}
          </div>
        </section>

        <section className="bg-[#0d1412] rounded-2xl border border-[#1D9E75]/25 p-5 shadow-[0_0_24px_rgba(29,158,117,0.1)]">
          <h2 className="text-xl font-bold text-white mb-4">Your Ride</h2>
          {climb.completed ? (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#1D9E75]/15 border border-[#1D9E75]/40 rounded-full flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-[#2fd6a0]" />
              </div>
              <div>
                <p className="font-semibold text-white">You've climbed this!</p>
                <p className="text-sm text-gray-500">Great effort. This climb is in your collection.</p>
              </div>
              <button
                onClick={() => toggleCompleted(climb.id)}
                className="ml-auto text-sm text-gray-500 hover:text-red-400 transition-colors"
              >
                Remove
              </button>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-gray-500 text-sm mb-4">Haven't conquered this one yet?</p>
              <button
                onClick={() => toggleCompleted(climb.id)}
                className="bg-[#1D9E75] hover:bg-[#2fd6a0] text-[#070b0a] font-bold px-6 py-3 rounded-full transition-all shadow-[0_0_20px_rgba(29,158,117,0.4)] hover:shadow-[0_0_30px_rgba(47,214,160,0.6)]"
              >
                Mark as Climbed
              </button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
