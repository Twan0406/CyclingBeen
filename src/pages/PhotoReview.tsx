import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, Copy, Loader2, RotateCcw, Search } from 'lucide-react';
import { allDestinations } from '../data/allDestinations';
import { seedClimbs } from '../data/climbs';
import { photos } from '../data/photos';
import { commonsFileUrl } from '../lib/photoRank';
import { candidatesFor, type PhotoCandidate } from '../lib/photoCandidates';
import { usePageMeta } from '../hooks/usePageMeta';

/**
 * Every photo in the guide on one page, with a way to change the ones that are
 * wrong.
 *
 * Filename rules got the photos to "the right place" and no further. Whether a
 * picture makes someone want to go there is a judgement, so this page hands
 * that judgement back: open a subject, look at what Commons has, click the one
 * you like. The choices are copied out as JSON and pinned in the manifest,
 * where no later run will touch them.
 *
 * Unlinked and disallowed in robots.txt — a working tool, not a page.
 */

const STORAGE_KEY = 'photopicks:1';

interface Row {
  id: string;
  name: string;
  where: string;
  href: string;
  wikiTitle: string;
  lat: number;
  lng: number;
  photoQuery?: string;
}

export default function PhotoReview() {
  const [filter, setFilter] = useState<'all' | 'missing' | 'picked'>('all');
  const [open, setOpen] = useState<string | null>(null);
  const [picks, setPicks] = useState<Record<string, string>>({});
  const [copied, setCopied] = useState(false);

  usePageMeta({ title: 'Photo review | Ridewild', description: 'Internal photo check.' });

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setPicks(JSON.parse(saved));
    } catch {
      /* private browsing; picks just will not survive a reload */
    }
  }, []);

  const remember = useCallback((next: Record<string, string>) => {
    setPicks(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  }, []);

  const rows: Row[] = useMemo(
    () => [
      ...allDestinations.map((d) => ({
        id: d.id,
        name: d.name,
        where: `${d.region}, ${d.country}`,
        href: `/place/${d.id}`,
        wikiTitle: d.wikiTitle,
        lat: d.lat,
        lng: d.lng,
        photoQuery: d.photoQuery,
      })),
      ...seedClimbs.map((c) => ({
        id: c.id,
        name: c.name,
        where: `${c.region}, ${c.country}`,
        href: `/climb/${c.id}`,
        wikiTitle: c.wikiTitle,
        lat: c.lat,
        lng: c.lng,
      })),
    ],
    [],
  );

  const shown = rows.filter((r) => {
    if (filter === 'missing') return !photos[r.id] && !picks[r.id];
    if (filter === 'picked') return !!picks[r.id];
    return true;
  });

  const pickCount = Object.keys(picks).length;

  function copyPicks() {
    const json = JSON.stringify(
      Object.fromEntries(Object.entries(picks).map(([id, file]) => [id, { file, pinned: true }])),
      null,
      2,
    );
    navigator.clipboard?.writeText(json).then(
      () => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      },
      () => {
        // Clipboard blocked: show it instead so it can be copied by hand.
        window.prompt('Copy this and send it over:', json);
      },
    );
  }

  return (
    <div className="max-w-[1240px] mx-auto px-6 md:px-12 py-10 pb-24">
      <p className="font-mono-dc text-[11px] tracking-[0.22em] uppercase text-[#7a7066] mb-3">
        Internal
      </p>
      <h1 className="text-[clamp(26px,4vw,38px)] font-semibold text-[#f4efe7]">Photo review</h1>
      <p className="text-[15px] text-[#a1968a] mt-2 max-w-[72ch]">
        {Object.keys(photos).length} of {rows.length} have a photo resolved at build time. Open any
        card to see what else Commons has for that place and click a better one — your choices are
        remembered here, and the button copies them out so they can be pinned for good.
      </p>

      <div className="flex flex-wrap gap-2.5 mt-6 items-center">
        {(['all', 'missing', 'picked'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`text-[13px] px-4 py-2 rounded-full border transition-colors ${
              filter === f
                ? 'bg-[#dfa04a] text-[#1a1206] font-semibold border-transparent'
                : 'border-[#3a322a] text-[#d6cec2] hover:border-[#6b6157]'
            }`}
          >
            {f === 'picked' ? `picked (${pickCount})` : f}
          </button>
        ))}

        {pickCount > 0 && (
          <>
            <button
              onClick={copyPicks}
              className="inline-flex items-center gap-2 text-[13px] font-semibold bg-[#7f8f5f] text-[#12150c] px-4 py-2 rounded-full hover:opacity-90 transition-opacity"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied' : `Copy ${pickCount} choice${pickCount === 1 ? '' : 's'}`}
            </button>
            <button
              onClick={() => remember({})}
              className="inline-flex items-center gap-1.5 text-[13px] text-[#a1968a] hover:text-[#f4efe7] transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" /> clear
            </button>
          </>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-8">
        {shown.map((r) => {
          const entry = photos[r.id];
          const picked = picks[r.id];
          const file = picked ?? entry?.file;
          return (
            <div
              key={r.id}
              className={`bg-[#1c1915] rounded-2xl overflow-hidden ring-1 transition-colors ${
                picked ? 'ring-[#7f8f5f]' : 'ring-[#322b24]'
              }`}
            >
              <button
                onClick={() => setOpen(open === r.id ? null : r.id)}
                className="relative block w-full h-40 bg-[#14120f] group"
              >
                {file ? (
                  <img
                    src={commonsFileUrl(file, 480)}
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
                <span className="absolute inset-0 bg-[#14120f]/0 group-hover:bg-[#14120f]/55 transition-colors grid place-items-center">
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity inline-flex items-center gap-1.5 text-[12px] font-semibold text-[#f4efe7]">
                    <Search className="w-3.5 h-3.5" /> other photos
                  </span>
                </span>
                {picked && (
                  <span className="absolute top-2 right-2 bg-[#7f8f5f] text-[#12150c] rounded-full p-1">
                    <Check className="w-3.5 h-3.5" strokeWidth={3} />
                  </span>
                )}
              </button>

              <div className="px-4 py-3">
                <Link to={r.href} className="text-[15px] font-semibold text-[#f4efe7] hover:text-[#dfa04a]">
                  {r.name}
                </Link>
                <p className="font-mono-dc text-[10px] text-[#7a7066] mt-1 select-all">{r.id}</p>
                {file && (
                  <a
                    href={`https://commons.wikimedia.org/wiki/File:${encodeURIComponent(file.replace(/ /g, '_'))}`}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="block text-[11px] text-[#a1968a] hover:text-[#dfa04a] mt-1.5 break-words"
                  >
                    {file}
                  </a>
                )}
              </div>

              {open === r.id && (
                <Picker
                  row={r}
                  chosen={picked}
                  onChoose={(f) => {
                    const next = { ...picks };
                    if (f === null) delete next[r.id];
                    else next[r.id] = f;
                    remember(next);
                  }}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Picker({
  row,
  chosen,
  onChoose,
}: {
  row: Row;
  chosen?: string;
  onChoose: (file: string | null) => void;
}) {
  const [state, setState] = useState<'loading' | 'ready' | 'failed'>('loading');
  const [options, setOptions] = useState<PhotoCandidate[]>([]);

  useEffect(() => {
    let alive = true;
    setState('loading');
    candidatesFor(row)
      .then((list) => {
        if (!alive) return;
        setOptions(list);
        setState(list.length ? 'ready' : 'failed');
      })
      .catch(() => alive && setState('failed'));
    return () => {
      alive = false;
    };
  }, [row]);

  return (
    <div className="border-t border-[#322b24] px-3 py-3">
      {state === 'loading' && (
        <p className="flex items-center gap-2 text-[12px] text-[#7a7066] py-3">
          <Loader2 className="w-3.5 h-3.5 animate-spin" /> looking for photos…
        </p>
      )}
      {state === 'failed' && (
        <p className="text-[12px] text-[#7a7066] py-3">Commons had nothing usable for this one.</p>
      )}
      {state === 'ready' && (
        <>
          <div className="grid grid-cols-3 gap-1.5 max-h-[280px] overflow-y-auto">
            {options.map((o) => (
              <button
                key={o.file}
                onClick={() => onChoose(o.file === chosen ? null : o.file)}
                title={`${o.file}\n${o.width}×${o.height}${o.assessed ? ` · ${o.assessed}` : ''}`}
                className={`relative aspect-[4/3] rounded-lg overflow-hidden ring-1 transition-all hover:ring-[#dfa04a] ${
                  o.file === chosen ? 'ring-2 ring-[#7f8f5f]' : 'ring-[#322b24]'
                }`}
              >
                <img src={o.thumb} alt="" loading="lazy" className="w-full h-full object-cover" />
                {o.assessed && (
                  <span className="absolute bottom-0 left-0 right-0 bg-[#14120f]/80 font-mono-dc text-[8px] uppercase tracking-[0.08em] text-[#dfa04a] py-0.5">
                    {o.assessed}
                  </span>
                )}
              </button>
            ))}
          </div>
          <p className="font-mono-dc text-[10px] text-[#6b6157] mt-2">
            {options.length} found · click to choose, click again to undo
          </p>
        </>
      )}
    </div>
  );
}
