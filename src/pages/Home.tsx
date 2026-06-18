import { useState } from 'react';
import ClimbCard from '../components/ClimbCard';
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

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-1">Famous Climbs</h1>
        <p className="text-gray-500">
          {completedCount} of {climbs.length} climbs conquered
        </p>
        <div className="mt-3 h-2 bg-gray-100 rounded-full overflow-hidden w-full max-w-xs">
          <div
            className="h-full bg-[#1D9E75] rounded-full transition-all duration-500"
            style={{ width: `${climbs.length ? (completedCount / climbs.length) * 100 : 0}%` }}
          />
        </div>
      </div>

      <div className="flex gap-2 mb-6">
        {(['all', 'completed', 'uncompleted'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${filter === f ? 'bg-[#1D9E75] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            {f === 'all' ? 'All' : f === 'completed' ? 'Completed' : 'Bucket List'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-48 bg-gray-100 rounded-xl animate-pulse" />
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
  );
}
