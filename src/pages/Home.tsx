import { useState, useMemo, lazy, Suspense } from 'react';
import { Search } from 'lucide-react';
import ClimbCard from '../components/ClimbCard';
import { useClimbs } from '../context/ClimbsContext';
import { usePageMeta } from '../hooks/usePageMeta';

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

  const total = climbs.length;
  const conquered = climbs.filter((c) => c.completed).length;
  const pct = total ? (conquered / total) * 100 : 0;

  usePageMeta({
    title: 'Collect — the legendary climbs of cycling',
    description: `Track and plan the world's great cycling ascents. ${total} legendary climbs with ride guides, race history and your own times.`,
  });

  return (
    <div className="max-w-[1240px] mx-auto px-6 md:px-12 py-10 pb-20">
      {/* Header stat block */}
      <div className="flex items-end justify-between gap-8 flex-wrap mb-7">
        <div>
          <div className="font-mono-dc text-[12px] tracking-[0.18em] uppercase text-[#8b93a3] mb-2.5">
            Your World
          </div>
          <div className="flex items-baseline gap-3.5">
            <span className="text-[52px] font-extrabold tracking-[-0.02em] leading-none text-[#eef1f6]">
              {conquered}
            </span>
            <span className="text-[22px] font-medium text-[#8b93a3]">
              of {total} legendary ascents conquered
            </span>
          </div>
        </div>
        <div className="flex-1 min-w-[260px] max-w-[520px]">
          <div className="h-2 rounded-full bg-[#1a1e27] overflow-hidden">
            <div
              className="h-full rounded-full bg-[linear-gradient(90deg,#f2b53a,#f78e3d)] shadow-[0_0_12px_rgba(242,181,58,0.5)] transition-all duration-700"
              style={{ width: `${pct}%` }}
            />
          </div>
          <div className="flex justify-between font-mono-dc text-[11px] text-[#6b7284] mt-2">
            <span>{Math.round(pct)}% complete</span>
            <span>{total - conquered} to climb</span>
          </div>
        </div>
      </div>

      {/* Globe */}
      <Suspense fallback={<div className="h-[600px] rounded-[24px] bg-[#10131b] animate-pulse" />}>
        <ClimbMap climbs={climbs} />
      </Suspense>

      {/* Peek divider */}
      <div className="flex items-center justify-center gap-2.5 mt-7 mb-[18px] text-[#6b7284]">
        <span className="w-10 h-px bg-[#20242e]" />
        <span className="font-mono-dc tracking-[0.08em] uppercase text-[11px]">Browse all {total} ascents</span>
        <span className="text-[14px]">↓</span>
        <span className="w-10 h-px bg-[#20242e]" />
      </div>

      {/* Filters + search */}
      <div className="flex items-center justify-between gap-4 flex-wrap mb-7">
        <div className="flex gap-2.5">
          {([['all', 'All'], ['completed', 'Conquered'], ['uncompleted', 'Bucket List']] as const).map(
            ([key, label]) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`text-[14px] px-5 py-[9px] rounded-full transition-colors ${
                  filter === key
                    ? 'bg-[#f2b53a] text-[#161009] font-semibold'
                    : 'bg-transparent border border-[#262b36] text-[#c4cad6] font-medium hover:text-white'
                }`}
              >
                {label}
              </button>
            ),
          )}
        </div>
        <div className="relative min-w-[280px] flex-1 sm:flex-none">
          <Search className="absolute left-[18px] top-1/2 -translate-y-1/2 w-[15px] h-[15px] text-[#6b7284]" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search climb or country…"
            className="w-full bg-[#12151c] border border-[#262b36] rounded-full pl-11 pr-[18px] py-[9px] text-[14px] text-[#eef1f6] placeholder:text-[#6b7284] focus:border-[#f2b53a]/50 focus:outline-none transition-colors"
          />
        </div>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <p className="text-[#6b7284] text-center py-16">No climbs match your search.</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {filtered.map((climb) => (
            <ClimbCard key={climb.id} climb={climb} />
          ))}
        </div>
      )}
    </div>
  );
}
