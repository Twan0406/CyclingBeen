import { useEffect, useState } from 'react';

// Resolves a real photo for a climb. Runs in the browser (which can reach
// Wikipedia/Wikimedia). Strategy, in order:
//   1. Lead image of the English Wikipedia article (by title)
//   2. A geotagged photo on Wikimedia Commons near the climb's coordinates
// Results are cached in localStorage so each climb resolves only once.

const memory = new Map<string, string | null>();

interface Target {
  title: string;
  lat: number;
  lng: number;
  size: number;
}

function keyFor(t: Target) {
  return `climbphoto:${t.size}:${t.title}`;
}

function isPhoto(name: string) {
  return /\.(jpe?g)$/i.test(name); // skip svg/png maps, logos and diagrams
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
  try {
    url = await wikipediaLeadImage(t);
  } catch {
    /* try next source */
  }
  if (!url) {
    try {
      url = await commonsNearby(t);
    } catch {
      /* give up gracefully */
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

export function useClimbPhoto(title: string, lat: number, lng: number, size = 800): string | null {
  const target: Target = { title, lat, lng, size };
  const [url, setUrl] = useState<string | null>(() => memory.get(keyFor(target)) ?? null);

  useEffect(() => {
    let alive = true;
    resolvePhoto({ title, lat, lng, size }).then((u) => {
      if (alive) setUrl(u);
    });
    return () => {
      alive = false;
    };
  }, [title, lat, lng, size]);

  return url;
}
