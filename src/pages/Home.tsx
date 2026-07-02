import { useState } from 'react';
import ClimbCard from '../components/ClimbCard';
import ClimbMap from '../components/ClimbMap';
import { useClimbs } from '../context/ClimbsContext';

export default function Home() {
  const { climbs, loading } = useClimbs();
  const [filter, setFilter] = useState<'all' | 'completed' | 'uncompleted'>('all');

  const filtered = climbs.filter(c => {
    if (filter === 'completed') return c.completed;
    if (filter === 'uncompleted') return !c.completed;
    return true;
  });

  const completedCount = climbs.filter(c => c.completed).length;
  const pct = climbs.length ? (completedCount / climbs.length) * 100 : 0;

  return (
    <div className="grid-backdrop">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="mb-8">
          <p className="text-xs uppercase tracking-[0.3em] text-[#2fd6a0] mb-2">Your climbing universe</p>
          <h1 className="text-4xl font-bold text-white mb-2">
            Famous <span className="neon-green">Climbs</span>
          </h1>
          <p className="text-gray-400">
            {completedCount} of {climbs.length} legendary ascents conquered
          </p>
          <div className="mt-4 h-1.5 bg-white/5 rounded-full overflow-hidden w-full max-w-sm border border-white/5">
            <div
              className="h-full bg-gradient-to-r from-[#1D9E75] to-[#2fd6a0] rounded-full transition-all duration-700 shadow-[0_0_10px_rgba(47,214,160,0.8)]"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        {loading ? (
          <div className="h-[440px] rounded-3xl bg-white/5 animate-pulse mb-10" />
        ) : (
          climbs.length > 0 && (
            <div className="mb-10">
              <ClimbMap climbs={climbs} />
            </div>
          )
        )}

        <div className="flex gap-2 mb-6">
          {(['all', 'completed', 'uncompleted'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all border ${filter === f ? 'bg-[#1D9E75]/20 text-[#2fd6a0] border-[#1D9E75]/50 shadow-[0_0_12px_rgba(29,158,117,0.3)]' : 'bg-white/5 text-gray-400 border-transparent hover:text-white hover:border-white/15'}`}
            >
              {f === 'all' ? 'All' : f === 'completed' ? 'Conquered' : 'Bucket List'}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-52 bg-white/5 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filtered.map(climb => (
              <ClimbCard key={climb.id} climb={climb} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
