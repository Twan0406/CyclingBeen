/**
 * Resolve every subject's photo once, at build time, and write it to
 * src/data/photos.json.
 *
 * The photos are known long before anyone opens the site, so looking them up in
 * the visitor's browser was work that never needed doing: four API calls per
 * card, forty cards to a page. This script does it once; the app then ships a
 * file name and renders the image directly.
 *
 * Run it from a machine with network access (CI does this):
 *
 *   npx vite-node scripts/fetchPhotos.ts             # fill in what is missing
 *   npx vite-node scripts/fetchPhotos.ts --refresh   # re-resolve everything
 *   npx vite-node scripts/fetchPhotos.ts --only eifel,chianti
 *
 * Entries marked "pinned" are chosen by hand and are never overwritten.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { seedClimbs } from '../src/data/climbs';
import { climbGuides } from '../src/data/climbGuides';
import { allDestinations } from '../src/data/allDestinations';
import { type Candidate, fileLooksWrong, scoreCandidate } from '../src/lib/photoRank';

const OUT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../src/data/photos.json',
);

const UA = 'Ridewild/1.0 (https://cyclingbeen-28952.web.app; build-time photo resolver)';

export interface PhotoEntry {
  /** Commons file name, e.g. "Col du Galibier 2019.jpg". */
  file: string;
  /** Uploader or author, as Commons reports it. Shown as the credit. */
  credit?: string;
  license?: string;
  /** Hand-picked entries are never overwritten by a later run. */
  pinned?: boolean;
  /** What the search was, so a bad pick can be understood and corrected. */
  via?: string;
}

interface Subject {
  id: string;
  name: string;
  title: string;
  query?: string;
  lat: number;
  lng: number;
}

async function api(url: string): Promise<unknown> {
  const res = await fetch(url, { headers: { 'User-Agent': UA, 'Api-User-Agent': UA } });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json();
}


/**
 * The image Wikidata records for the subject itself (P18).
 *
 * This is the decisive improvement over searching: P18 is a human saying "this
 * picture shows this thing". Free-text search only knows that a file's title
 * mentions some of the same words, which is how a Spitfire ended up on West
 * Jutland and a war memorial on the Ötztaler.
 */
async function wikidataImage(title: string): Promise<string | null> {
  const idUrl =
    `https://en.wikipedia.org/w/api.php?action=query&format=json&redirects=1` +
    `&titles=${encodeURIComponent(title)}&prop=pageprops&ppprop=wikibase_item`;
  const idData = (await api(idUrl)) as {
    query?: { pages?: Record<string, { pageprops?: { wikibase_item?: string } }> };
  };
  const qid = Object.values(idData.query?.pages ?? {})[0]?.pageprops?.wikibase_item;
  if (!qid) return null;

  const claimUrl = `https://www.wikidata.org/w/api.php?action=wbgetclaims&format=json&property=P18&entity=${qid}`;
  const claimData = (await api(claimUrl)) as {
    claims?: { P18?: Array<{ mainsnak?: { datavalue?: { value?: string } } }> };
  };
  const file = claimData.claims?.P18?.[0]?.mainsnak?.datavalue?.value;
  if (!file || fileLooksWrong(file)) return null;
  return file;
}

/** The Commons category for the subject, which is curated per place. */
async function commonsCategory(title: string): Promise<string | null> {
  const idUrl =
    `https://en.wikipedia.org/w/api.php?action=query&format=json&redirects=1` +
    `&titles=${encodeURIComponent(title)}&prop=pageprops&ppprop=wikibase_item`;
  const idData = (await api(idUrl)) as {
    query?: { pages?: Record<string, { pageprops?: { wikibase_item?: string } }> };
  };
  const qid = Object.values(idData.query?.pages ?? {})[0]?.pageprops?.wikibase_item;
  if (!qid) return null;

  const catUrl = `https://www.wikidata.org/w/api.php?action=wbgetclaims&format=json&property=P373&entity=${qid}`;
  const catData = (await api(catUrl)) as {
    claims?: { P373?: Array<{ mainsnak?: { datavalue?: { value?: string } } }> };
  };
  const category = catData.claims?.P373?.[0]?.mainsnak?.datavalue?.value;
  if (!category) return null;

  // Everything filed under the place, ranked by our own scorer — so a photo
  // that shows riding wins over one that shows the church.
  const listUrl =
    `https://commons.wikimedia.org/w/api.php?action=query&format=json` +
    `&generator=categorymembers&gcmtitle=${encodeURIComponent(`Category:${category}`)}` +
    `&gcmtype=file&gcmlimit=100&prop=imageinfo&iiprop=url|mime|size`;
  const listData = (await api(listUrl)) as {
    query?: { pages?: Record<string, {
      title?: string;
      imageinfo?: Array<{ url?: string; mime?: string; width?: number; height?: number }>;
    }> };
  };
  const pages = listData.query?.pages;
  if (!pages) return null;

  const scored = Object.values(pages)
    .filter((p) => p.title && p.imageinfo?.[0])
    .map((p, i) => {
      const info = p.imageinfo![0];
      const c: Candidate = {
        title: p.title!.replace(/^File:/, ''),
        index: i,
        thumburl: info.url ?? '',
        mime: info.mime,
        width: info.width,
        height: info.height,
      };
      return { c, score: scoreCandidate(c) };
    })
    .filter((x): x is { c: Candidate; score: number } => x.score !== null)
    .sort((a, b) => b.score - a.score);

  return scored[0]?.c.title ?? null;
}

/** Commons search, returning the best file name rather than a thumbnail URL. */
async function search(query: string): Promise<string | null> {
  const url =
    `https://commons.wikimedia.org/w/api.php?action=query&format=json` +
    `&generator=search&gsrnamespace=6&gsrlimit=30` +
    `&gsrsearch=${encodeURIComponent(`${query} filetype:bitmap`)}` +
    `&prop=imageinfo&iiprop=url|mime|size`;
  const data = (await api(url)) as {
    query?: { pages?: Record<string, {
      title?: string;
      index?: number;
      imageinfo?: Array<{ url?: string; mime?: string; width?: number; height?: number }>;
    }> };
  };
  const pages = data.query?.pages;
  if (!pages) return null;

  const scored = Object.values(pages)
    .filter((p) => p.title && p.imageinfo?.[0])
    .map((p) => {
      const info = p.imageinfo![0];
      const c: Candidate = {
        title: p.title!.replace(/^File:/, ''),
        index: p.index ?? 99,
        thumburl: info.url ?? '',
        mime: info.mime,
        width: info.width,
        height: info.height,
      };
      return { c, score: scoreCandidate(c) };
    })
    .filter((x): x is { c: Candidate; score: number } => x.score !== null)
    .sort((a, b) => b.score - a.score);

  return scored[0]?.c.title ?? null;
}

/** Geotagged photos near the coordinates — the last resort before giving up. */
async function nearby(lat: number, lng: number): Promise<string | null> {
  const url =
    `https://commons.wikimedia.org/w/api.php?action=query&format=json` +
    `&generator=geosearch&ggsnamespace=6&ggsradius=5000&ggslimit=20` +
    `&ggscoord=${lat}|${lng}&prop=imageinfo&iiprop=url|mime|size`;
  const data = (await api(url)) as {
    query?: { pages?: Record<string, {
      title?: string;
      imageinfo?: Array<{ mime?: string; width?: number; height?: number }>;
    }> };
  };
  const pages = data.query?.pages;
  if (!pages) return null;
  const ok = Object.values(pages)
    .filter((p) => p.title && !fileLooksWrong(p.title))
    .filter((p) => (p.imageinfo?.[0]?.width ?? 0) >= 640);
  return ok[0]?.title?.replace(/^File:/, '') ?? null;
}

/** Author and licence, so the credit can be shown next to the photo. */
async function credits(file: string): Promise<{ credit?: string; license?: string }> {
  const url =
    `https://commons.wikimedia.org/w/api.php?action=query&format=json` +
    `&titles=${encodeURIComponent(`File:${file}`)}` +
    `&prop=imageinfo&iiprop=extmetadata`;
  try {
    const data = (await api(url)) as {
      query?: { pages?: Record<string, {
        imageinfo?: Array<{ extmetadata?: Record<string, { value?: string }> }>;
      }> };
    };
    const meta = Object.values(data.query?.pages ?? {})[0]?.imageinfo?.[0]?.extmetadata;
    const strip = (html?: string) =>
      html?.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim() || undefined;
    return {
      credit: strip(meta?.Artist?.value),
      license: strip(meta?.LicenseShortName?.value),
    };
  } catch {
    return {};
  }
}

function subjects(): Subject[] {
  const places = allDestinations.map((d) => ({
    id: d.id,
    name: d.name,
    title: d.wikiTitle,
    query: d.photoQuery,
    lat: d.lat,
    lng: d.lng,
  }));
  const climbs = seedClimbs.map((c) => ({
    id: c.id,
    name: c.name,
    title: c.wikiTitle,
    query: climbGuides[c.id]?.photoQuery,
    lat: c.lat,
    lng: c.lng,
  }));
  return [...places, ...climbs];
}

async function main() {
  const args = process.argv.slice(2);
  const refresh = args.includes('--refresh');
  const onlyArg = args.find((a) => a.startsWith('--only'));
  const only = onlyArg
    ? new Set((onlyArg.split('=')[1] ?? args[args.indexOf(onlyArg) + 1] ?? '').split(','))
    : null;

  const existing: Record<string, PhotoEntry> = fs.existsSync(OUT)
    ? JSON.parse(fs.readFileSync(OUT, 'utf8'))
    : {};

  const all = subjects();
  const todo = all.filter((s) => {
    if (only && !only.has(s.id)) return false;
    const have = existing[s.id];
    if (have?.pinned) return false; // hand-picked, leave alone
    return refresh || !have;
  });

  console.log(`${all.length} subjects, ${todo.length} to resolve`);
  let found = 0;
  const failed: string[] = [];

  for (const s of todo) {
    let file: string | null = null;
    let via = '';
    // Best evidence first: a picture someone recorded as being of this subject,
    // then the subject's own Commons category, and only then a text search.
    try {
      if (s.title) {
        file = await commonsCategory(s.title);
        via = 'commons category';
      }
      if (!file && s.title) {
        file = await wikidataImage(s.title);
        via = 'wikidata P18';
      }
      if (!file && s.query) {
        file = await search(s.query);
        via = `search: ${s.query}`;
      }
      if (!file) {
        file = await search(`${s.name} cycling`);
        via = `search: ${s.name} cycling`;
      }
      if (!file) {
        file = await nearby(s.lat, s.lng);
        via = 'geosearch';
      }
    } catch (err) {
      console.warn(`  ${s.id}: ${(err as Error).message}`);
    }

    if (!file) {
      failed.push(s.id);
      console.log(`  ✗ ${s.id}`);
      continue;
    }

    const meta = await credits(file);
    existing[s.id] = { file, ...meta, via };
    found++;
    console.log(`  ✓ ${s.id} → ${file}`);

    // Commons asks for a gentle pace; this runs once per build, not per visit.
    await new Promise((r) => setTimeout(r, 250));
  }

  const sorted = Object.fromEntries(Object.entries(existing).sort(([a], [b]) => a.localeCompare(b)));
  fs.writeFileSync(OUT, `${JSON.stringify(sorted, null, 2)}\n`);

  const missing = all.filter((s) => !sorted[s.id]).map((s) => s.id);
  console.log(`\nresolved ${found}, still without a photo: ${missing.length}`);
  if (missing.length) console.log(missing.join(', '));
  if (failed.length) console.log(`failed this run: ${failed.join(', ')}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
