import { scoreCandidate, type Candidate } from './photoRank';

/**
 * Candidate photos for one subject, fetched in the browser.
 *
 * The build-time resolver picks the top one; this hands back the whole
 * shortlist so a person can look at them and choose. Which is the point: the
 * difference between "the right place" and "a photo that makes you want to go"
 * is a judgement no filename test can make.
 */
export interface PhotoCandidate {
  file: string;
  thumb: string;
  width?: number;
  height?: number;
  assessed?: 'featured' | 'quality';
  score: number;
  source: string;
}

interface Subject {
  name: string;
  wikiTitle: string;
  lat: number;
  lng: number;
  photoQuery?: string;
}

const API = 'https://commons.wikimedia.org/w/api.php';
const FEATURED = 'Category:Featured pictures on Wikimedia Commons';
const QUALITY = 'Category:Quality images';

type Page = {
  title?: string;
  index?: number;
  categories?: Array<{ title?: string }>;
  imageinfo?: Array<{ thumburl?: string; mime?: string; width?: number; height?: number }>;
};

async function query(params: Record<string, string>): Promise<Record<string, Page>> {
  const url = `${API}?${new URLSearchParams({ action: 'query', format: 'json', origin: '*', ...params })}`;
  const res = await fetch(url);
  if (!res.ok) return {};
  const data = await res.json();
  return data?.query?.pages ?? {};
}

function collect(
  pages: Record<string, Page>,
  subject: string,
  source: string,
  into: Map<string, PhotoCandidate>,
) {
  for (const p of Object.values(pages)) {
    const info = p.imageinfo?.[0];
    if (!p.title || !info?.thumburl) continue;
    const file = p.title.replace(/^File:/, '');
    if (into.has(file)) continue;

    const assessed = (p.categories ?? []).some((c) => c.title === FEATURED)
      ? 'featured'
      : (p.categories ?? []).some((c) => c.title === QUALITY)
        ? 'quality'
        : undefined;

    const candidate: Candidate = {
      title: file,
      index: p.index ?? 0,
      thumburl: info.thumburl,
      subject,
      assessed,
      mime: info.mime,
      width: info.width,
      height: info.height,
    };
    const score = scoreCandidate(candidate, { requireRelevance: false });
    if (score === null) continue;

    into.set(file, {
      file,
      thumb: info.thumburl,
      width: info.width,
      height: info.height,
      assessed,
      score,
      source,
    });
  }
}

/** The Commons category a Wikipedia article's subject is filed under. */
async function categoryFor(wikiTitle: string): Promise<string | null> {
  try {
    const res = await fetch(
      `https://en.wikipedia.org/w/api.php?action=query&format=json&origin=*&redirects=1` +
        `&titles=${encodeURIComponent(wikiTitle)}&prop=pageprops&ppprop=wikibase_item`,
    );
    const qid = Object.values((await res.json())?.query?.pages ?? {})[0] as {
      pageprops?: { wikibase_item?: string };
    };
    const id = qid?.pageprops?.wikibase_item;
    if (!id) return null;

    const claims = await fetch(
      `https://www.wikidata.org/w/api.php?action=wbgetclaims&format=json&origin=*&property=P373&entity=${id}`,
    );
    const data = await claims.json();
    return data?.claims?.P373?.[0]?.mainsnak?.datavalue?.value ?? null;
  } catch {
    return null;
  }
}

/**
 * Everything worth looking at for this subject, best first.
 *
 * Deliberately wider than the resolver: a person can dismiss a bad photo at a
 * glance, so it is better to offer too many than to hide the good one.
 */
export interface CandidateResult {
  options: PhotoCandidate[];
  /** What each source returned, so an empty shortlist explains itself. */
  notes: string[];
}

export async function candidatesFor(subject: Subject, limit = 24): Promise<CandidateResult> {
  const found = new Map<string, PhotoCandidate>();
  const common = {
    prop: 'imageinfo|categories',
    iiprop: 'url|mime|size',
    iiurlwidth: '400',
    cllimit: '500',
    clcategories: `${FEATURED}|${QUALITY}`,
  };

  const notes: string[] = [];
  const category = await categoryFor(subject.wikiTitle);
  notes.push(category ? `category: ${category}` : `no Commons category for "${subject.wikiTitle}"`);

  const searches: Array<[string, Record<string, string>]> = [];
  if (category) {
    searches.push([
      'category',
      { generator: 'categorymembers', gcmtitle: `Category:${category}`, gcmtype: 'file', gcmlimit: '100', ...common },
    ]);
  }
  searches.push([
    'reviewed',
    {
      generator: 'search',
      gsrnamespace: '6',
      gsrlimit: '20',
      gsrsearch: `incategory:"Quality images" ${subject.wikiTitle} filetype:bitmap filew:>1200`,
      ...common,
    },
  ]);
  if (subject.photoQuery) {
    searches.push([
      'search',
      { generator: 'search', gsrnamespace: '6', gsrlimit: '20', gsrsearch: `${subject.photoQuery} filetype:bitmap`, ...common },
    ]);
  }
  searches.push([
    'nearby',
    {
      generator: 'geosearch',
      ggsnamespace: '6',
      ggsradius: '25000',
      ggslimit: '30',
      ggscoord: `${subject.lat}|${subject.lng}`,
      ...common,
    },
  ]);

  const results = await Promise.all(
    searches.map(async ([source, params]) => {
      try {
        return [source, await query(params)] as const;
      } catch {
        return [source, {}] as const;
      }
    }),
  );
  for (const [source, pages] of results) {
    const before = found.size;
    const raw = Object.keys(pages).length;
    collect(pages, subject.name, source, found);
    notes.push(`${source}: ${raw} found, ${found.size - before} usable`);
  }

  return {
    options: [...found.values()].sort((a, b) => b.score - a.score).slice(0, limit),
    notes,
  };
}
