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

interface SegmentEffort {
  elapsed_time: number;
  moving_time: number;
  distance: number;
  segment: {
    id: number;
    name: string;
    climb_category: number;
    distance: number;
    start_latlng?: [number, number];
    end_latlng?: [number, number];
  } | null;
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

async function fetchActivityEfforts(
  refreshToken: string,
  activityId: number,
): Promise<{ segment_efforts: SegmentEffort[]; refresh_token: string }> {
  const res = await fetch(`${WORKER_URL}/activity`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh_token: refreshToken, activityId }),
  });
  const data = await res.json();
  if (!res.ok || data.error) throw new Error(data.error || 'activity failed');
  return data;
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

// Picks the best (fastest) segment effort that represents the full climb: a
// categorized climb whose top sits near the summit and that covers most of the
// climb's length. Returns elapsed seconds, or null if no good match.
function bestEffortForClimb(efforts: SegmentEffort[], climb: Climb): number | null {
  const NEAR_KM = 1.5;
  const targetM = climb.lengthKm * 1000;
  // A "full climb" segment tops out near the summit and has a length close to
  // the climb's own length (so partial segments and wrong routes are rejected).
  const candidates = efforts.filter((e) => {
    const seg = e.segment;
    if (!seg || !seg.end_latlng) return false;
    const nearSummit = distanceKm(seg.end_latlng[0], seg.end_latlng[1], climb.lat, climb.lng) <= NEAR_KM;
    const d = seg.distance ?? 0;
    const lengthOk = d >= targetM * 0.7 && d <= targetM * 1.3;
    return nearSummit && lengthOk;
  });
  if (candidates.length === 0) return null;
  // Prefer the segment whose length best matches the climb; fastest effort on it.
  candidates.sort(
    (a, b) => Math.abs((a.segment!.distance ?? 0) - targetM) - Math.abs((b.segment!.distance ?? 0) - targetM),
  );
  const bestSegId = candidates[0].segment!.id;
  const sameSeg = candidates.filter((c) => c.segment!.id === bestSegId);
  return Math.min(...sameSeg.map((c) => c.elapsed_time));
}

export interface SyncResult {
  matches: ClimbMatch[];
  refresh_token: string;
  ridesScanned: number;
  segmentTimes: number;
}

// Full sync: proximity-match rides to climbs, count attempts, then refine each
// matched climb with the precise Strava segment time where available.
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

  for (const act of activities) {
    if (!isRide(act)) continue;
    const track = act.summary_polyline ? decodePolyline(act.summary_polyline) : [];
    if (track.length === 0) continue;
    for (const climb of climbs) {
      if (act.start_latlng && distanceKm(act.start_latlng[0], act.start_latlng[1], climb.lat, climb.lng) > 120) {
        continue;
      }
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
    }
  }

  // Refine with precise segment times (best-effort; skipped if the worker is an
  // older version without the /activity endpoint).
  const matchedActIds = [...actToClimbs.keys()].slice(0, 60);
  let rt = refresh_token;
  const precise = new Map<string, number>();
  let done = 0;
  for (const actId of matchedActIds) {
    done += 1;
    onProgress?.(`Reading climb segments… ${done}/${matchedActIds.length}`);
    try {
      const { segment_efforts, refresh_token: nrt } = await fetchActivityEfforts(rt, actId);
      if (nrt) rt = nrt;
      for (const cid of actToClimbs.get(actId) || []) {
        const climb = climbs.find((c) => c.id === cid);
        if (!climb) continue;
        const t = bestEffortForClimb(segment_efforts, climb);
        if (t != null) {
          const prev = precise.get(cid);
          if (prev == null || t < prev) precise.set(cid, t);
        }
      }
    } catch {
      // /activity not available — keep ride-time fallback
    }
  }

  const matches: ClimbMatch[] = [];
  let segmentTimes = 0;
  for (const [cid, agg] of perClimb) {
    const seg = precise.get(cid);
    if (seg != null) segmentTimes += 1;
    matches.push({
      climbId: cid,
      seconds: seg ?? agg.best,
      date: agg.date,
      activityId: agg.actId,
      activityName: agg.actName,
      attempts: agg.attempts,
      isSegmentTime: seg != null,
    });
  }

  return { matches, refresh_token: rt, ridesScanned: activities.length, segmentTimes };
}

export function formatDuration(seconds: number): string {
  if (!seconds) return '—';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${m}:${String(s).padStart(2, '0')}`;
}
