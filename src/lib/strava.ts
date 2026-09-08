import type { Climb } from '../types/climb';
import { decodePolyline, distanceKm, trackPassesNear } from './polyline';

const CLIENT_ID = import.meta.env.VITE_STRAVA_CLIENT_ID;
const WORKER_URL = (import.meta.env.VITE_STRAVA_WORKER_URL || '').replace(/\/$/, '');

export function stravaConfigured(): boolean {
  return Boolean(CLIENT_ID && WORKER_URL);
}

export function redirectUri(): string {
  return `${window.location.origin}/strava-callback`;
}

export function stravaAuthorizeUrl(): string {
  const params = new URLSearchParams({
    client_id: String(CLIENT_ID),
    redirect_uri: redirectUri(),
    response_type: 'code',
    approval_prompt: 'auto',
    scope: 'read,activity:read',
  });
  return `https://www.strava.com/oauth/authorize?${params.toString()}`;
}

export interface StravaTokens {
  access_token: string;
  refresh_token: string;
  expires_at: number;
  athlete: { id: number; firstname: string; lastname: string; profile?: string } | null;
}

export interface StravaActivitySlim {
  id: number;
  name: string;
  type: string;
  sport_type?: string;
  start_date: string;
  elapsed_time: number;
  moving_time: number;
  distance: number;
  total_elevation_gain: number;
  summary_polyline?: string;
  start_latlng?: [number, number];
  end_latlng?: [number, number];
}

export interface ClimbMatch {
  climbId: string;
  seconds: number;
  date: string;
  activityId: number;
  activityName: string;
  attempts: number;
  isSegmentTime: boolean;
}

export async function exchangeCode(code: string): Promise<StravaTokens> {
  const res = await fetch(`${WORKER_URL}/exchange`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code }),
  });
  const data = await res.json();
  if (!res.ok || data.error) throw new Error(data.error || 'Strava exchange failed');
  return data;
}

/** 2 = worker supports the generic /api proxy (exact climb times). 1 = old worker. */
export async function workerVersion(): Promise<number> {
  try {
    const res = await fetch(`${WORKER_URL}/version`);
    if (!res.ok) return 1;
    const data = await res.json();
    return typeof data.version === 'number' ? data.version : 1;
  } catch {
    return 1;
  }
}

async function fetchActivities(
  refreshToken: string,
): Promise<{ activities: StravaActivitySlim[]; refresh_token: string }> {
  const all: StravaActivitySlim[] = [];
  let refresh = refreshToken;
  for (let page = 1; page <= 3; page++) {
    const res = await fetch(`${WORKER_URL}/activities`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refresh, page, perPage: 100 }),
    });
    const data = await res.json();
    if (!res.ok || data.error) throw new Error(data.error || 'Could not load activities');
    if (data.refresh_token) refresh = data.refresh_token;
    all.push(...(data.activities || []));
    if (!data.activities || data.activities.length < 100) break;
  }
  return { activities: all, refresh_token: refresh };
}

interface StreamSet {
  latlng?: { data: [number, number][] };
  time?: { data: number[] };
  altitude?: { data: number[] };
  distance?: { data: number[] };
}

async function fetchStreams(
  refreshToken: string,
  activityId: number,
): Promise<{ streams: StreamSet; refresh_token: string }> {
  const res = await fetch(`${WORKER_URL}/api`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      refresh_token: refreshToken,
      endpoint: `activities/${activityId}/streams?keys=latlng,time,altitude,distance&key_by_type=true`,
    }),
  });
  const body = await res.json();
  if (!res.ok || body.error) throw new Error(body.error || 'streams failed');
  return { streams: (body.data || {}) as StreamSet, refresh_token: body.refresh_token };
}

function isRide(a: StravaActivitySlim): boolean {
  return (
    !a.type ||
    a.type === 'Ride' ||
    a.sport_type === 'Ride' ||
    a.sport_type === 'MountainBikeRide' ||
    a.sport_type === 'GravelRide'
  );
}

/**
 * Finds every ascent of `climb` inside one ride and returns their durations.
 *
 * For each pass near the summit we walk back through the altitude stream to the
 * foot of the final continuous climb, then take the time between there and the
 * top. This measures the actual climb — not the whole ride — and naturally
 * handles repeats of the same climb within one ride.
 */
export function ascentSeconds(streams: StreamSet, climb: Climb): number[] {
  const ll = streams.latlng?.data;
  const t = streams.time?.data;
  const alt = streams.altitude?.data;
  const dist = streams.distance?.data;
  if (!ll || !t || !alt || !dist) return [];
  const n = Math.min(ll.length, t.length, alt.length, dist.length);
  if (n < 10) return [];

  // Points that pass close to the summit.
  const radiusKm = Math.max(0.4, Math.min(1.2, climb.lengthKm * 0.15));
  const near: number[] = [];
  for (let i = 0; i < n; i++) {
    if (distanceKm(ll[i][0], ll[i][1], climb.lat, climb.lng) <= radiusKm) near.push(i);
  }
  if (near.length === 0) return [];

  // Split into separate passes (a gap of >5 min means a new attempt).
  const passes: number[][] = [];
  let cur: number[] = [near[0]];
  for (let k = 1; k < near.length; k++) {
    if (t[near[k]] - t[near[k - 1]] > 300) {
      passes.push(cur);
      cur = [];
    }
    cur.push(near[k]);
  }
  passes.push(cur);

  const expectedGain = climb.lengthKm * 1000 * (climb.avgGradientPct / 100);
  const maxBackM = climb.lengthKm * 1000 * 1.8 + 500;
  const results: number[] = [];

  for (const pass of passes) {
    // The summit is the highest point of the pass.
    let top = pass[0];
    for (const i of pass) if (alt[i] > alt[top]) top = i;

    // Walk back to the bottom of the final continuous ascent.
    let lo = top;
    let minAlt = alt[top];
    for (let j = top - 1; j >= 0; j--) {
      if (dist[top] - dist[j] > maxBackM) { lo = j; break; }
      if (alt[j] < minAlt) minAlt = alt[j];
      else if (alt[j] > minAlt + 25) { lo = j; break; }
      lo = j;
    }
    // Start at the point nearest the top that still sits at the bottom height,
    // so a flat approach isn't counted as part of the climb. The small tolerance
    // absorbs GPS altitude noise without eating into the climb itself.
    let base = lo;
    for (let j = lo; j < top; j++) if (alt[j] <= minAlt + 2) base = j;

    const seconds = t[top] - t[base];
    const gain = alt[top] - alt[base];
    const covered = dist[top] - dist[base];

    if (
      seconds > 60 &&
      gain >= expectedGain * 0.5 &&
      covered >= climb.lengthKm * 1000 * 0.4
    ) {
      results.push(seconds);
    }
  }
  return results;
}

export interface SyncResult {
  matches: ClimbMatch[];
  refresh_token: string;
  ridesScanned: number;
  exactTimes: number;
  workerOutdated: boolean;
}

export async function syncStrava(
  refreshToken: string,
  climbs: Climb[],
  onProgress?: (msg: string) => void,
): Promise<SyncResult> {
  onProgress?.('Loading your Strava rides…');
  const { activities, refresh_token } = await fetchActivities(refreshToken);

  onProgress?.(`Scanning ${activities.length} rides…`);
  interface Agg { best: number; date: string; actId: number; actName: string; attempts: number }
  const perClimb = new Map<string, Agg>();
  const actToClimbs = new Map<number, string[]>();
  const actById = new Map<number, StravaActivitySlim>();

  for (const act of activities) {
    if (!isRide(act)) continue;
    const track = act.summary_polyline ? decodePolyline(act.summary_polyline) : [];
    if (track.length === 0) continue;
    for (const climb of climbs) {
      if (
        act.start_latlng &&
        distanceKm(act.start_latlng[0], act.start_latlng[1], climb.lat, climb.lng) > 120
      ) continue;
      if (!trackPassesNear(track, climb.lat, climb.lng, 1.5)) continue;

      const ride = act.moving_time || act.elapsed_time || 0;
      const cur = perClimb.get(climb.id);
      if (!cur) {
        perClimb.set(climb.id, { best: ride, date: act.start_date, actId: act.id, actName: act.name, attempts: 1 });
      } else {
        cur.attempts += 1;
        if (ride < cur.best) {
          cur.best = ride;
          cur.date = act.start_date;
          cur.actId = act.id;
          cur.actName = act.name;
        }
      }
      actToClimbs.set(act.id, [...(actToClimbs.get(act.id) || []), climb.id]);
      actById.set(act.id, act);
    }
  }

  // Exact climb times from the ride's GPS/altitude streams.
  let rt = refresh_token;
  const version = await workerVersion();
  const workerOutdated = version < 2;
  const exact = new Map<string, { seconds: number; date: string; actId: number; actName: string }>();
  const passes = new Map<string, number>();

  if (!workerOutdated) {
    const ids = [...actToClimbs.keys()].slice(0, 40);
    let done = 0;
    for (const actId of ids) {
      done += 1;
      onProgress?.(`Measuring climb times… ${done}/${ids.length}`);
      try {
        const { streams, refresh_token: nrt } = await fetchStreams(rt, actId);
        if (nrt) rt = nrt;
        const act = actById.get(actId);
        for (const cid of actToClimbs.get(actId) || []) {
          const climb = climbs.find((c) => c.id === cid);
          if (!climb) continue;
          const secs = ascentSeconds(streams, climb);
          if (secs.length === 0) continue;
          passes.set(cid, (passes.get(cid) ?? 0) + secs.length);
          const fastest = Math.min(...secs);
          const prev = exact.get(cid);
          if (!prev || fastest < prev.seconds) {
            exact.set(cid, {
              seconds: fastest,
              date: act?.start_date ?? new Date().toISOString(),
              actId,
              actName: act?.name ?? '',
            });
          }
        }
      } catch {
        /* skip this ride */
      }
    }
  }

  const matches: ClimbMatch[] = [];
  let exactTimes = 0;
  for (const [cid, agg] of perClimb) {
    const e = exact.get(cid);
    if (e) exactTimes += 1;
    matches.push({
      climbId: cid,
      seconds: e ? e.seconds : agg.best,
      date: e ? e.date : agg.date,
      activityId: e ? e.actId : agg.actId,
      activityName: e ? e.actName : agg.actName,
      attempts: passes.get(cid) ?? agg.attempts,
      isSegmentTime: Boolean(e),
    });
  }

  return { matches, refresh_token: rt, ridesScanned: activities.length, exactTimes, workerOutdated };
}

export function formatDuration(seconds: number): string {
  if (!seconds) return '—';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${m}:${String(s).padStart(2, '0')}`;
}
