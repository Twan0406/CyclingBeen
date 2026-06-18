import { useParams, useNavigate } from 'react-router-dom';
import { useClimbs } from '../context/ClimbsContext';
import { ArrowLeft, ArrowUp, Ruler, TrendingUp, CheckCircle, Quote } from 'lucide-react';

const difficultyColors: Record<string, string> = {
  'easy': 'bg-green-100 text-green-700 border-green-200',
  'medium': 'bg-yellow-100 text-yellow-700 border-yellow-200',
  'hard': 'bg-orange-100 text-orange-700 border-orange-200',
  'hors-categorie': 'bg-red-100 text-red-700 border-red-200',
};

export default function ClimbDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { climbs, loading, toggleCompleted } = useClimbs();
  const climb = climbs.find(c => c.id === id);

  if (loading) return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="h-64 bg-gray-100 rounded-2xl animate-pulse mb-6" />
      <div className="space-y-3">
        <div className="h-6 bg-gray-100 rounded animate-pulse w-3/4" />
        <div className="h-4 bg-gray-100 rounded animate-pulse w-1/2" />
      </div>
    </div>
  );

  if (!climb) return (
    <div className="max-w-3xl mx-auto px-4 py-16 text-center">
      <p className="text-gray-500">Climb not found.</p>
      <button onClick={() => navigate('/')} className="mt-4 text-[#1D9E75] underline">Go back</button>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto">
      <div className="relative h-72 md:h-96" style={{ background: climb.heroImageUrl }}>
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 bg-black/30 hover:bg-black/50 text-white rounded-full p-2 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        {climb.completed && (
          <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-[#1D9E75] text-white text-sm font-semibold px-3 py-1.5 rounded-full">
            <CheckCircle className="w-4 h-4" /> Conquered
          </div>
        )}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/70 to-transparent" />
        <div className="absolute bottom-6 left-6 right-6">
          <h1 className="text-white text-3xl font-bold drop-shadow-lg">{climb.name}</h1>
          <p className="text-white/80 mt-1">{climb.region}, {climb.country}</p>
        </div>
      </div>

      <div className="px-4 py-6 space-y-8">
        <div className="grid grid-cols-4 gap-3">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-3 text-center">
            <ArrowUp className="w-4 h-4 text-[#1D9E75] mx-auto mb-1" />
            <p className="text-lg font-bold text-gray-900">{climb.elevationM.toLocaleString()}m</p>
            <p className="text-xs text-gray-400">Elevation</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-3 text-center">
            <Ruler className="w-4 h-4 text-[#1D9E75] mx-auto mb-1" />
            <p className="text-lg font-bold text-gray-900">{climb.lengthKm}km</p>
            <p className="text-xs text-gray-400">Length</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-3 text-center">
            <TrendingUp className="w-4 h-4 text-[#1D9E75] mx-auto mb-1" />
            <p className="text-lg font-bold text-gray-900">{climb.avgGradientPct}%</p>
            <p className="text-xs text-gray-400">Avg Grade</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-3 text-center flex flex-col items-center justify-center">
            <span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${difficultyColors[climb.difficulty]}`}>
              {climb.difficulty === 'hors-categorie' ? 'HC' : climb.difficulty.charAt(0).toUpperCase() + climb.difficulty.slice(1)}
            </span>
            <p className="text-xs text-gray-400 mt-1">Difficulty</p>
          </div>
        </div>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">The Story</h2>
          <p className="text-gray-600 leading-relaxed">{climb.story}</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Pros on this Climb</h2>
          <div className="space-y-4">
            {climb.proQuotes.map((pq, i) => (
              <blockquote key={i} className="relative bg-gray-50 rounded-xl p-5 border-l-4 border-[#1D9E75]">
                <Quote className="w-5 h-5 text-[#1D9E75] mb-2 opacity-60" />
                <p className="text-gray-700 italic leading-relaxed">"{pq.quote}"</p>
                <footer className="mt-2 text-sm text-gray-500 font-medium">
                  — {pq.cyclist}, {pq.year}
                </footer>
              </blockquote>
            ))}
          </div>
        </section>

        <section className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Your Ride</h2>
          {climb.completed ? (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#1D9E75]/10 rounded-full flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-[#1D9E75]" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">You've climbed this!</p>
                <p className="text-sm text-gray-500">Great effort. This climb is in your collection.</p>
              </div>
              <button
                onClick={() => toggleCompleted(climb.id)}
                className="ml-auto text-sm text-gray-400 hover:text-red-500 transition-colors"
              >
                Remove
              </button>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-gray-500 text-sm mb-4">Haven't conquered this one yet?</p>
              <button
                onClick={() => toggleCompleted(climb.id)}
                className="bg-[#1D9E75] hover:bg-[#178a64] text-white font-semibold px-6 py-3 rounded-xl transition-colors"
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
