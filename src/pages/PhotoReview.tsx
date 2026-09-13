import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { allDestinations } from '../data/allDestinations';
import { seedClimbs } from '../data/climbs';
import { photos } from '../data/photos';
import { commonsFileUrl } from '../lib/photoRank';
import { usePageMeta } from '../hooks/usePageMeta';

/**
 * Every photo in the guide on one page, so the ones that are wrong can be
 * spotted in a minute instead of by browsing the whole site.
 *
 * Not linked from anywhere and kept out of the sitemap — it is a working tool,
 * not a page for visitors. Each card shows the id to report and the Commons
 * file that was chosen, with a link to the file so a replacement can be picked.
 */
export default function PhotoReview() {
  const [filter, setFilter] = useState<'all' | 'missing' | 'pinned'>('all');

  usePageMeta({ title: 'Photo review | Ridewild', description: 'Internal photo check.' });

  const rows = useMemo(() => {
    const all = [
      ...allDestinations.map((d) => ({ id: d.id, name: d.name, where: `${d.region}, ${d.country}`, href: `/place/${d.id}` })),
      ...seedClimbs.map((c) => ({ id: c.id, name: c.name, where: `${c.region}, ${c.country}`, href: `/climb/${c.id}` })),
    ];
    return all.filter((r) => {
      const entry = photos[r.id];
      if (filter === 'missing') return !entry;
      if (filter === 'pinned') return entry?.pinned;
      return true;
    });
  }, [filter]);

  const total = allDestinations.length + seedClimbs.length;
  const withPhoto = rows.filter((r) => photos[r.id]).length;

  return (
    <div className="max-w-[1240px] mx-auto px-6 md:px-12 py-10 pb-24">
      <p className="font-mono-dc text-[11px] tracking-[0.22em] uppercase text-[#7a7066] mb-3">
        Internal
      </p>
      <h1 className="text-[clamp(26px,4vw,38px)] font-semibold text-[#f4efe7]">Photo review</h1>
      <p className="text-[15px] text-[#a1968a] mt-2 max-w-[70ch]">
        {Object.keys(photos).length} of {total} subjects have a photo resolved at build time.
        Anything without one falls back to its gradient. Tell me the ids that are wrong and
        they get pinned by hand, which no later run will overwrite.
      </p>

      <div className="flex gap-2.5 mt-6">
        {(['all', 'missing', 'pinned'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`text-[13px] px-4 py-2 rounded-full border transition-colors ${
              filter === f
                ? 'bg-[#dfa04a] text-[#1a1206] font-semibold border-transparent'
                : 'border-[#3a322a] text-[#d6cec2] hover:border-[#6b6157]'
            }`}
          >
            {f}
          </button>
        ))}
        <span className="self-center font-mono-dc text-[11px] text-[#6b6157] ml-2">
          showing {rows.length}, {withPhoto} with a photo
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-8">
        {rows.map((r) => {
          const entry = photos[r.id];
          return (
            <div key={r.id} className="bg-[#1c1915] ring-1 ring-[#322b24] rounded-2xl overflow-hidden">
              <div className="relative h-40 bg-[#14120f]">
                {entry ? (
                  <img
                    src={commonsFileUrl(entry.file, 480)}
                    alt={r.name}
                    loading="lazy"
                    decoding="async"
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                ) : (
                  <span className="absolute inset-0 grid place-items-center font-mono-dc text-[11px] text-[#6b6157]">
                    no photo
                  </span>
                )}
              </div>
              <div className="px-4 py-3">
                <Link to={r.href} className="text-[15px] font-semibold text-[#f4efe7] hover:text-[#dfa04a]">
                  {r.name}
                </Link>
                <p className="font-mono-dc text-[10px] text-[#7a7066] mt-1 select-all">{r.id}</p>
                {entry && (
                  <>
                    <a
                      href={`https://commons.wikimedia.org/wiki/File:${encodeURIComponent(entry.file.replace(/ /g, '_'))}`}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="block text-[11px] text-[#a1968a] hover:text-[#dfa04a] mt-1.5 break-words"
                    >
                      {entry.file}
                    </a>
                    <p className="font-mono-dc text-[10px] text-[#6b6157] mt-1">
                      {entry.pinned ? 'pinned by hand' : entry.via}
                    </p>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
