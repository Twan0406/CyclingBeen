/**
 * Collect — Strava proxy (Cloudflare Worker)
 *
 * Keeps the Strava Client Secret server-side. The website only ever talks to
 * this Worker, never directly to Strava's token endpoint.
 *
 * Set these as Worker variables/secrets in the Cloudflare dashboard:
 *   STRAVA_CLIENT_ID      (Settings → Variables)          e.g. 12345
 *   STRAVA_CLIENT_SECRET  (Settings → Variables, "Encrypt")  the long secret
 *
 * Endpoints (all POST, JSON):
 *   /exchange    { code }            -> { access_token, refresh_token, expires_at, athlete }
 *   /activities  { refresh_token, page?, perPage? }
 *                -> { activities, refresh_token, expires_at }
 */

const STRAVA = 'https://www.strava.com';

function withCors(resp) {
  const h = new Headers(resp.headers);
  h.set('Access-Control-Allow-Origin', '*');
  h.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  h.set('Access-Control-Allow-Headers', 'Content-Type');
  return new Response(resp.body, { status: resp.status, headers: h });
}

function json(data, status = 200) {
  return withCors(
    new Response(JSON.stringify(data), {
      status,
      headers: { 'Content-Type': 'application/json' },
    }),
  );
}

async function refresh(env, refreshToken) {
  const r = await fetch(`${STRAVA}/oauth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: env.STRAVA_CLIENT_ID,
      client_secret: env.STRAVA_CLIENT_SECRET,
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    }),
  });
  return r.json();
}

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') return withCors(new Response(null, { status: 204 }));

    const url = new URL(request.url);
    try {
      if (url.pathname === '/exchange' && request.method === 'POST') {
        const { code } = await request.json();
        const r = await fetch(`${STRAVA}/oauth/token`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            client_id: env.STRAVA_CLIENT_ID,
            client_secret: env.STRAVA_CLIENT_SECRET,
            code,
            grant_type: 'authorization_code',
          }),
        });
        const d = await r.json();
        if (!d.access_token) return json({ error: d.message || 'exchange failed', detail: d }, 400);
        return json({
          access_token: d.access_token,
          refresh_token: d.refresh_token,
          expires_at: d.expires_at,
          athlete: d.athlete
            ? {
                id: d.athlete.id,
                firstname: d.athlete.firstname,
                lastname: d.athlete.lastname,
                profile: d.athlete.profile,
              }
            : null,
        });
      }

      if (url.pathname === '/activities' && request.method === 'POST') {
        const { refresh_token, page = 1, perPage = 100 } = await request.json();
        const t = await refresh(env, refresh_token);
        if (!t.access_token) return json({ error: 'refresh failed', detail: t }, 400);
        const ar = await fetch(
          `${STRAVA}/api/v3/athlete/activities?per_page=${perPage}&page=${page}`,
          { headers: { Authorization: `Bearer ${t.access_token}` } },
        );
        const acts = await ar.json();
        if (!Array.isArray(acts)) return json({ error: 'activities failed', detail: acts }, 400);
        const activities = acts.map((a) => ({
          id: a.id,
          name: a.name,
          type: a.type,
          sport_type: a.sport_type,
          start_date: a.start_date,
          elapsed_time: a.elapsed_time,
          moving_time: a.moving_time,
          distance: a.distance,
          total_elevation_gain: a.total_elevation_gain,
          summary_polyline: a.map && a.map.summary_polyline,
          start_latlng: a.start_latlng,
          end_latlng: a.end_latlng,
        }));
        return json({ activities, refresh_token: t.refresh_token, expires_at: t.expires_at });
      }

      return json({ error: 'not found' }, 404);
    } catch (e) {
      return json({ error: String(e) }, 500);
    }
  },
};
