import { useEffect, useState } from 'react';

// Fetches a lead photo for a Wikipedia article via the public API (CORS-enabled
// with origin=*). Results are cached in localStorage so each climb photo is
// only ever fetched once per browser.

const memory = new Map<string, string | null>();

function cacheKey(title: string, size: number) {
  return `wikiphoto:${size}:${title}`;
}

async function fetchWikiPhoto(title: string, size: number): Promise<string | null> {
  const key = cacheKey(title, size);
  if (memory.has(key)) return memory.get(key)!;

  const stored = localStorage.getItem(key);
  if (stored !== null) {
    const val = stored === '' ? null : stored;
    memory.set(key, val);
    return val;
  }

  try {
    const url = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(
      title,
    )}&prop=pageimages&piprop=thumbnail&pithumbsize=${size}&format=json&origin=*`;
    const res = await fetch(url);
    const data = await res.json();
    const pages = data?.query?.pages ?? {};
    const page = Object.values(pages)[0] as { thumbnail?: { source?: string } } | undefined;
    const src = page?.thumbnail?.source ?? null;
    localStorage.setItem(key, src ?? '');
    memory.set(key, src);
    return src;
  } catch {
    return null;
  }
}

export function useWikiPhoto(title: string, size = 800): string | null {
  const [url, setUrl] = useState<string | null>(() => memory.get(cacheKey(title, size)) ?? null);

  useEffect(() => {
    let alive = true;
    fetchWikiPhoto(title, size).then((u) => {
      if (alive) setUrl(u);
    });
    return () => {
      alive = false;
    };
  }, [title, size]);

  return url;
}
