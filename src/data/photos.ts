import raw from './photos.json';
import { commonsFileUrl } from '../lib/photoRank';

export interface PhotoEntry {
  file: string;
  credit?: string;
  license?: string;
  pinned?: boolean;
  via?: string;
}

/**
 * Photos resolved at build time by scripts/fetchPhotos.ts.
 *
 * Shipping the answer means a card renders its image immediately instead of
 * asking Commons who it should be asking. Anything missing here falls back to
 * the live lookup, so the site still works for a subject added since the last
 * run — it is just slower for that one.
 */
export const photos: Record<string, PhotoEntry> = raw as Record<string, PhotoEntry>;

export function photoFor(id: string | undefined, width: number) {
  const entry = id ? photos[id] : undefined;
  return entry ? { url: commonsFileUrl(entry.file, width), entry } : null;
}
