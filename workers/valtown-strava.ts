/**
 * Collect — Strava proxy for Val.town (HTTP val)  — v2
 *
 * Environment Variables (Val.town → Env vars):
 *   STRAVA_CLIENT_ID
 *   STRAVA_CLIENT_SECRET
 *
 * Endpoints (POST, JSON) — /api makes this future-proof: the app can call any
 * Strava GET endpoint without this worker ever needing another update.
 *   /version     -> { version: 2 }
 *   /exchange    { code }                  -> tokens + athlete
 *   /activities  { refresh_token, page?, perPage? }
 *   /api         { refresh_token, endpoint } -> { data, status, refresh_token }
 *                 endpoint e.g. "activities/123/streams?keys=latlng,time,altitude,distance&key_by_type=true"
 */

const STRAVA = "https://www.strava.com";

function withCors(resp: Response): Response {
  const h = new Headers(resp.headers);
  h.set("Access-Control-Allow-Origin", "*");
  h.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  h.set("Access-Control-Allow-Headers", "Content-Type");
  return new Response(resp.body, { status: resp.status, headers: h });
}

function json(data: unknown, status = 200): Response {
  return withCors(
    new Response(JSON.stringify(data), {
      status,
      headers: { "Content-Type": "application/json" },
    }),
  );
}

async function refresh(refreshToken: string) {
  const r = await fetch(`${STRAVA}/oauth/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: Deno.env.get("STRAVA_CLIENT_ID"),
      client_secret: Deno.env.get("STRAVA_CLIENT_SECRET"),
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
  });
  return r.json();
}

export default async function (request: Request): Promise<Response> {
  if (request.method === "OPTIONS") return withCors(new Response(null, { status: 204 }));

  const url = new URL(request.url);
  const path = url.pathname;

  try {
    if (path.endsWith("/version")) return json({ version: 2 });

    if (path.endsWith("/exchange") && request.method === "POST") {
      const { code } = await request.json();
      const r = await fetch(`${STRAVA}/oauth/token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_id: Deno.env.get("STRAVA_CLIENT_ID"),
          client_secret: Deno.env.get("STRAVA_CLIENT_SECRET"),
          code,
          grant_type: "authorization_code",
        }),
      });
      const d = await r.json();
      if (!d.access_token) return json({ error: d.message || "exchange failed", detail: d }, 400);
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

    // Generic, read-only Strava API proxy.
    if (path.endsWith("/api") && request.method === "POST") {
      const { refresh_token, endpoint } = await request.json();
      const safe =
        typeof endpoint === "string" &&
        endpoint.length < 300 &&
        !endpoint.includes("..") &&
        !endpoint.startsWith("/") &&
        /^[A-Za-z0-9_\-\/]+(\?[A-Za-z0-9_\-=&,%.]*)?$/.test(endpoint);
      if (!safe) return json({ error: "invalid endpoint" }, 400);

      const t = await refresh(refresh_token);
      if (!t.access_token) return json({ error: "refresh failed", detail: t }, 400);
      const r = await fetch(`${STRAVA}/api/v3/${endpoint}`, {
        headers: { Authorization: `Bearer ${t.access_token}` },
      });
      const data = await r.json();
      return json({ data, status: r.status, refresh_token: t.refresh_token });
    }

    if (path.endsWith("/activities") && request.method === "POST") {
      const { refresh_token, page = 1, perPage = 100 } = await request.json();
      const t = await refresh(refresh_token);
      if (!t.access_token) return json({ error: "refresh failed", detail: t }, 400);
      const ar = await fetch(
        `${STRAVA}/api/v3/athlete/activities?per_page=${perPage}&page=${page}`,
        { headers: { Authorization: `Bearer ${t.access_token}` } },
      );
      const acts = await ar.json();
      if (!Array.isArray(acts)) return json({ error: "activities failed", detail: acts }, 400);
      const activities = acts.map((a: any) => ({
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

    return json({ error: "not found" }, 404);
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
}
