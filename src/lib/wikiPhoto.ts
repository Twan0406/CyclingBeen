import { useEffect, useState } from 'react';

// Resolves a real photo. Runs in the browser (which can reach Wikipedia and
// Wikimedia Commons). Strategy, in order:
//   1. A Commons search on an explicit query — used to steer places towards
//      cycling imagery instead of a generic landscape or town-hall shot
//   2. Lead image of the English Wikipedia article (by title)
//   3. A geotagged photo on Commons near the coordinates
// Results are cached in localStorage so each subject resolves only once.

const memory = new Map<string, string | null>();

interface Target {
  title: string;
  lat: number;
  lng: number;
  size: number;
  /** Commons search phrase, e.g. "cycling Veluwe forest track". */
  query?: string;
  /** An exact Commons file, e.g. "Alpe d'Huez hairpins.jpg". Beats every search. */
  file?: string;
}

function keyFor(t: Target) {
  return `climbphoto:4:${t.size}:${t.file ?? t.query ?? t.title}`;
}

function isPhoto(name: string) {
  return /\.(jpe?g)$/i.test(name); // skip svg/png maps, logos and diagrams
}

/**
 * Titles that are never a good photo of a place: maps, logos, coats of arms,
 * diagrams. Commons search matches text, so "Zeeland" happily returns a map of
 * the province — these have to be thrown out rather than merely ranked down.
 */
const REJECT = [
  /\b(map|maps|kaart|karte|carte|mapa|mappa)\b/,
  /\b(logo|icon|symbol|emblem|seal|badge|pictogram)\b/,
  /coat of arms|wapen van|blason|wappen/,
  /\b(flag|vlag|drapeau|flagge)\b/,
  /\b(diagram|chart|graph|scheme|schema|plattegrond|grundriss)\b/,
  /\b(poster|banner|leaflet|cover|stamp|postzegel|coin|munt)\b/,
  /\b(signpost|wegwijzer|signage|nameplate|plaque)\b/,
  /\b(portrait|headshot|bust|statue of)\b/,
  /\b(profile|elevation profile|hoogteprofiel)\b/,
];

/** Words that suggest the photo actually shows riding. */
const CYCLING = /bicycl|bike|biking|cycling|cyclist|peloton|fiets|wielren|radfahr|radweg|vélo|velo|mtb|gravel|randonneur/;
/** Words that suggest an appealing outdoor scene. */
const SCENIC = /landscape|panorama|view|vista|road|route|trail|path|pass|col|hairpin|mountain|coast|beach|dune|forest|valley|lake|vineyard|cobbl/;
/** Wrong season for most of these destinations. */
const WINTER = /\b(snow|winter|ski|skiing|schnee|neige|sneeuw|piste)\b/;

/** Reject on the filename alone — used where only a URL comes back. */
function fileLooksWrong(name: string): boolean {
  const n = decodeURIComponent(name).toLowerCase().replace(/_/g, ' ');
  if (!isPhoto(n)) return true;
  return REJECT.some((r) => r.test(n));
}

interface Candidate {
  title: string;
  index: number;
  thumburl: string;
  mime?: string;
  width?: number;
  height?: number;
}

function scoreCandidate(c: Candidate): number | null {
  const title = c.title.toLowerCase();
  if (REJECT.some((r) => r.test(title))) return null;
  if (c.mime && c.mime !== 'image/jpeg' && !/\.jpe?g$/i.test(c.title)) return null;
  if (c.width && c.width < 640) return null;

  const ratio = c.width && c.height ? c.width / c.height : 1.5;
  if (ratio < 1.1 || ratio > 2.8) return null; // crops badly in a card

  let score = 0;
  if (CYCLING.test(title)) score += 6;
  if (SCENIC.test(title)) score += 2;
  if (WINTER.test(title)) score -= 3;
  if (c.width && c.width >= 1600) score += 1;
  if (ratio >= 1.3 && ratio <= 2.1) score += 1;
  // Commons' own relevance still counts, but only as a tie-breaker.
  score -= c.index * 0.05;
  return score;
}

/** Free-text image search on Commons — lets us ask for cycling specifically. */
/**
 * An exact Commons file, chosen by hand. Search is a guess; this is not, so it
 * is how any photo that comes out wrong gets fixed for good.
 */
async function pinnedFile(t: Target): Promise<string | null> {
  if (!t.file) return null;
  const name = t.file.replace(/^File:/i, '').replace(/ /g, '_');
  return `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(name)}?width=${t.size}`;
}

async function commonsSearch(t: Target): Promise<string | null> {
  if (!t.query) return null;
  const url =
    `https://commons.wikimedia.org/w/api.php?action=query&format=json&origin=*` +
    `&generator=search&gsrnamespace=6&gsrlimit=30` +
    `&gsrsearch=${encodeURIComponent(`${t.query} filetype:bitmap`)}` +
    `&prop=imageinfo&iiprop=url|mime|size&iiurlwidth=${t.size}`;
  const res = await fetch(url);
  const data = await res.json();
  const pages = data?.query?.pages;
  if (!pages) return null;

  const scored = (
    Object.values(pages) as Array<{
      title?: string;
      index?: number;
      imageinfo?: Array<{ thumburl?: string; mime?: string; width?: number; height?: number }>;
    }>
  )
    .filter((p) => p.imageinfo?.[0]?.thumburl && p.title)
    .map((p) => {
      const i = p.imageinfo![0];
      const c: Candidate = {
        title: p.title!,
        index: p.index ?? 0,
        thumburl: i.thumburl!,
        mime: i.mime,
        width: i.width,
        height: i.height,
      };
      return { c, score: scoreCandidate(c) };
    })
    .filter((x): x is { c: Candidate; score: number } => x.score !== null)
    .sort((a, b) => b.score - a.score);

  // Surviving the reject list is not the same as being a good photo. Without a
  // cycling or scenic word in the title this is just "an image that mentions
  // the place" — a wine bottle, a church, a crystal. Better to fall through.
  const best = scored[0];
  return best && best.score >= 2 ? best.c.thumburl : null;
}

async function wikipediaLeadImage(t: Target): Promise<string | null> {
  const url =
    `https://en.wikipedia.org/w/api.php?action=query&format=json&origin=*&redirects=1` +
    `&titles=${encodeURIComponent(t.title)}&prop=pageimages&piprop=thumbnail&pithumbsize=${t.size}`;
  const res = await fetch(url);
  const data = await res.json();
  const pages = data?.query?.pages ?? {};
  const page = Object.values(pages)[0] as { thumbnail?: { source?: string } } | undefined;
  const src = page?.thumbnail?.source;
  if (!src) return null;
  // The article's lead image is whatever the editors chose to open with, which
  // for a wine region is a bottle and for a province is a map. Vet the filename.
  return fileLooksWrong(src.split('/').pop() ?? '') ? null : src;
}

async function commonsNearby(t: Target): Promise<string | null> {
  const url =
    `https://commons.wikimedia.org/w/api.php?action=query&format=json&origin=*` +
    `&generator=geosearch&ggsnamespace=6&ggsradius=5000&ggslimit=20` +
    `&ggscoord=${t.lat}|${t.lng}&prop=imageinfo&iiprop=url|mime&iiurlwidth=${t.size}`;
  const res = await fetch(url);
  const data = await res.json();
  const pages = data?.query?.pages;
  if (!pages) return null;
  const imgs = (Object.values(pages) as Array<{
    title?: string;
    imageinfo?: Array<{ thumburl?: string; mime?: string }>;
  }>).filter((p) => p.imageinfo?.[0]?.thumburl);
  const ok = imgs.filter((p) => p.title && !fileLooksWrong(p.title));
  const jpg = ok.find((p) => p.imageinfo![0].mime === 'image/jpeg');
  return (jpg ?? ok[0])?.imageinfo?.[0]?.thumburl ?? null;
}

async function resolvePhoto(t: Target): Promise<string | null> {
  const key = keyFor(t);
  if (memory.has(key)) return memory.get(key)!;

  const stored = localStorage.getItem(key);
  if (stored !== null) {
    const val = stored === '' ? null : stored;
    memory.set(key, val);
    return val;
  }

  let url: string | null = null;
  for (const step of [pinnedFile, commonsSearch, wikipediaLeadImage, commonsNearby]) {
    if (url) break;
    try {
      url = await step(t);
    } catch {
      /* try the next source */
    }
  }

  try {
    localStorage.setItem(key, url ?? '');
  } catch {
    /* ignore quota */
  }
  memory.set(key, url);
  return url;
}

export function useClimbPhoto(
  title: string,
  lat: number,
  lng: number,
  size = 800,
  query?: string,
  file?: string,
): string | null {
  const target: Target = { title, lat, lng, size, query, file };
  const [url, setUrl] = useState<string | null>(() => memory.get(keyFor(target)) ?? null);

  useEffect(() => {
    let alive = true;
    resolvePhoto({ title, lat, lng, size, query, file }).then((u) => {
      if (alive) setUrl(u);
    });
    return () => {
      alive = false;
    };
  }, [title, lat, lng, size, query, file]);

  return url;
}
