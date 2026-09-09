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
}

function keyFor(t: Target) {
  return `climbphoto:2:${t.size}:${t.query ?? t.title}`;
}

function isPhoto(name: string) {
  return /\.(jpe?g)$/i.test(name); // skip svg/png maps, logos and diagrams
}

/** Free-text image search on Commons — lets us ask for cycling specifically. */
async function commonsSearch(t: Target): Promise<string | null> {
  if (!t.query) return null;
  const url =
    `https://commons.wikimedia.org/w/api.php?action=query&format=json&origin=*` +
    `&generator=search&gsrnamespace=6&gsrlimit=15` +
    `&gsrsearch=${encodeURIComponent(`${t.query} filetype:bitmap`)}` +
    `&prop=imageinfo&iiprop=url|mime|size&iiurlwidth=${t.size}`;
  const res = await fetch(url);
  const data = await res.json();
  const pages = data?.query?.pages;
  if (!pages) return null;
  const imgs = (
    Object.values(pages) as Array<{
      title?: string;
      index?: number;
      imageinfo?: Array<{ thumburl?: string; mime?: string; width?: number; height?: number }>;
    }>
  )
    .filter((p) => p.imageinfo?.[0]?.thumburl)
    // Landscape photos only — portraits and thin panoramas crop badly in cards.
    .filter((p) => {
      const i = p.imageinfo![0];
      if (!i.width || !i.height) return true;
      const ratio = i.width / i.height;
      return ratio > 1.1 && ratio < 2.6;
    })
    .filter((p) => p.imageinfo![0].mime === 'image/jpeg' || (p.title ? isPhoto(p.title) : false))
    // Keep Commons' own relevance ranking.
    .sort((a, b) => (a.index ?? 0) - (b.index ?? 0));
  return imgs[0]?.imageinfo?.[0]?.thumburl ?? null;
}

async function wikipediaLeadImage(t: Target): Promise<string | null> {
  const url =
    `https://en.wikipedia.org/w/api.php?action=query&format=json&origin=*&redirects=1` +
    `&titles=${encodeURIComponent(t.title)}&prop=pageimages&piprop=thumbnail&pithumbsize=${t.size}`;
  const res = await fetch(url);
  const data = await res.json();
  const pages = data?.query?.pages ?? {};
  const page = Object.values(pages)[0] as { thumbnail?: { source?: string } } | undefined;
  return page?.thumbnail?.source ?? null;
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
  const jpg = imgs.find(
    (p) => (p.imageinfo![0].mime === 'image/jpeg') || (p.title ? isPhoto(p.title) : false),
  );
  return (jpg ?? imgs[0])?.imageinfo?.[0]?.thumburl ?? null;
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
  for (const step of [commonsSearch, wikipediaLeadImage, commonsNearby]) {
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
): string | null {
  const target: Target = { title, lat, lng, size, query };
  const [url, setUrl] = useState<string | null>(() => memory.get(keyFor(target)) ?? null);

  useEffect(() => {
    let alive = true;
    resolvePhoto({ title, lat, lng, size, query }).then((u) => {
      if (alive) setUrl(u);
    });
    return () => {
      alive = false;
    };
  }, [title, lat, lng, size, query]);

  return url;
}
