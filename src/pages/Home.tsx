import { useState, useMemo, lazy, Suspense } from 'react';
import { Search } from 'lucide-react';
import ClimbCard from '../components/ClimbCard';
import { useClimbs } from '../context/ClimbsContext';

const ClimbMap = lazy(() => import('../components/ClimbMap'));

export default function Home() {
  const { climbs } = useClimbs();
  const [filter, setFilter] = useState<'all' | 'completed' | 'uncompleted'>('all');
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return climbs.filter((c) => {
      if (filter === 'completed' && !c.completed) return false;
      if (filter === 'uncompleted' && c.completed) return false;
      if (!q) return true;
      return (
        c.name.toLowerCase().includes(q) ||
        c.country.toLowerCase().includes(q) ||
        c.region.toLowerCase().includes(q)
      );
    });
  }, [climbs, filter, query]);

  const completedCount = climbs.filter((c) => c.completed).length;
  const pct = climbs.length ? (completedCount / climbs.length) * 100 : 0;

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="mb-8">
        <p className="text-xs uppercase tracking-[0.3em] text-amber-400/80 mb-2">The world's great climbs</p>
        <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">Explore</h1>
        <p className="text-slate-400">
          {completedCount} of {climbs.length} legendary ascents conquered
        </p>
        <div className="mt-4 h-1.5 bg-white/8 rounded-full overflow-hidden w-full max-w-sm">
          <div
            className="h-full bg-gradient-to-r from-amber-500 to-amber-300 rounded-full transition-all duration-700"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      <div className="mb-10">
        <Suspense fallback={<div className="h-[440px] rounded-3xl bg-white/5 animate-pulse" />}>
          <ClimbMap climbs={climbs} />
        </Suspense>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
        <div className="flex gap-2">
          {(['all', 'completed', 'uncompleted'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                filter === f
                  ? 'bg-amber-400/15 text-amber-300 ring-1 ring-amber-400/30'
                  : 'bg-white/5 text-slate-400 hover:text-white'
              }`}
            >
              {f === 'all' ? 'All' : f === 'completed' ? 'Conquered' : 'Bucket List'}
            </button>
          ))}
        </div>
        <div className="relative sm:ml-auto sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search climb or country…"
            className="w-full bg-white/5 rounded-full pl-9 pr-4 py-2 text-sm text-white placeholder:text-slate-500 ring-1 ring-white/10 focus:ring-amber-400/40 focus:outline-none transition"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="text-slate-500 text-center py-16">No climbs match your search.</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((climb) => (
            <ClimbCard key={climb.id} climb={climb} />
          ))}
        </div>
      )}
    </div>
  );
}
