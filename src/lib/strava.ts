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

export async function fetchActivities(
  refreshToken: string,
): Promise<{ activities: StravaActivitySlim[]; refresh_token: string }> {
  // Pull the most recent ~300 activities (3 pages of 100).
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

export interface ClimbMatch {
  climbId: string;
  seconds: number;
  date: string;
  activityId: number;
  activityName: string;
}

// Matches rides to climbs by checking whether the ride's GPS track passes near
// the climb summit. Keeps the fastest matching ride per climb.
export function matchActivitiesToClimbs(
  activities: StravaActivitySlim[],
  climbs: Climb[],
): ClimbMatch[] {
  const best = new Map<string, ClimbMatch>();
  const RADIUS_KM = 1.5;

  for (const act of activities) {
    const isRide = !act.type || act.type === 'Ride' || act.sport_type === 'Ride' ||
      act.sport_type === 'MountainBikeRide' || act.sport_type === 'GravelRide';
    if (!isRide) continue;
    const track = act.summary_polyline ? decodePolyline(act.summary_polyline) : [];
    if (track.length === 0) continue;

    for (const climb of climbs) {
      // Quick reject: skip climbs whose summit is far from the ride start.
      if (act.start_latlng && distanceKm(act.start_latlng[0], act.start_latlng[1], climb.lat, climb.lng) > 120) {
        continue;
      }
      if (!trackPassesNear(track, climb.lat, climb.lng, RADIUS_KM)) continue;

      const seconds = act.moving_time || act.elapsed_time || 0;
      const existing = best.get(climb.id);
      if (!existing || seconds < existing.seconds) {
        best.set(climb.id, {
          climbId: climb.id,
          seconds,
          date: act.start_date,
          activityId: act.id,
          activityName: act.name,
        });
      }
    }
  }

  return [...best.values()];
}

export function formatDuration(seconds: number): string {
  if (!seconds) return '—';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${m}:${String(s).padStart(2, '0')}`;
}
