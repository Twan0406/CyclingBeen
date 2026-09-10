import type { RideCategory, RouteWaypoint } from '../types/destination';

/** A route snapped onto real roads and tracks. */
export interface SnappedTrack {
  /** [lng, lat, elevation?] along the road, hundreds to thousands of points. */
  coords: [number, number, number?][];
  /** Real riding distance in km, from the router. */
  distanceKm: number;
  /** Total ascent in m, from the router. */
  elevationM?: number;
}

export type SnapState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'ready'; track: SnappedTrack }
  | { status: 'failed' };

/**
 * BRouter's public instance: free, no key, and its profiles are built for
 * cycling rather than driving. Anything else here would be a car router.
 */
const BROUTER = 'https://brouter.de/brouter';

function profileFor(category: RideCategory): string {
  if (category === 'gravel') return 'gravel';
  if (category === 'mtb') return 'mtb';
  return 'trekking';
}

const cacheKey = (id: string, profile: string) => `routetrack:1:${profile}:${id}`;

async function request(waypoints: RouteWaypoint[], profile: string): Promise<SnappedTrack | null> {
  const lonlats = waypoints.map((w) => `${w.lng.toFixed(6)},${w.lat.toFixed(6)}`).join('|');
  const url = `${BROUTER}?lonlats=${lonlats}&profile=${profile}&alternativeidx=0&format=geojson`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const json = await res.json();
  const feature = json?.features?.[0];
  const coords = feature?.geometry?.coordinates;
  if (!Array.isArray(coords) || coords.length < 2) return null;
  const props = feature.properties ?? {};
  const metres = Number(props['track-length']);
  const ascent = Number(props['filtered ascend']);
  return {
    coords,
    distanceKm: Number.isFinite(metres) ? metres / 1000 : 0,
    elevationM: Number.isFinite(ascent) ? ascent : undefined,
  };
}

/**
 * Snap a route's waypoints onto the road network. Falls back from the
 * terrain-specific profile to plain trekking, and caches the result so a
 * revisit is instant.
 */
export async function snapRoute(
  id: string,
  waypoints: RouteWaypoint[],
  category: RideCategory,
): Promise<SnappedTrack | null> {
  const profile = profileFor(category);
  const key = cacheKey(id, profile);

  try {
    const cached = localStorage.getItem(key);
    if (cached) return JSON.parse(cached) as SnappedTrack;
  } catch {
    // Private browsing, or a stale entry. Fetch it again.
  }

  let track: SnappedTrack | null = null;
  try {
    track = await request(waypoints, profile);
    if (!track && profile !== 'trekking') track = await request(waypoints, 'trekking');
  } catch {
    return null;
  }
  if (!track) return null;

  try {
    localStorage.setItem(key, JSON.stringify(track));
  } catch {
    // Cache full or unavailable — not worth failing the page over.
  }
  return track;
}
