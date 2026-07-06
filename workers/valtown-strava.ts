/**
 * Collect — Strava proxy for Val.town (HTTP val)
 *
 * Set these as Environment Variables in Val.town (Settings → Environment Variables):
 *   STRAVA_CLIENT_ID
 *   STRAVA_CLIENT_SECRET
 *
 * Endpoints (POST, JSON):
 *   /exchange    { code }
 *   /activities  { refresh_token, page?, perPage? }
 */

const STRAVA = "https://www.strava.com";

function withCors(resp: Response): Response {
  const h = new Headers(resp.headers);
  h.set("Access-Control-Allow-Origin", "*");
  h.set("Access-Control-Allow-Methods", "POST, OPTIONS");
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
  try {
    if (url.pathname.endsWith("/exchange") && request.method === "POST") {
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

    if (url.pathname.endsWith("/activity") && request.method === "POST") {
      const { refresh_token, activityId } = await request.json();
      const t = await refresh(refresh_token);
      if (!t.access_token) return json({ error: "refresh failed", detail: t }, 400);
      const ar = await fetch(
        `${STRAVA}/api/v3/activities/${activityId}?include_all_efforts=true`,
        { headers: { Authorization: `Bearer ${t.access_token}` } },
      );
      const a = await ar.json();
      const segment_efforts = ((a && a.segment_efforts) || []).map((e: any) => ({
        elapsed_time: e.elapsed_time,
        moving_time: e.moving_time,
        distance: e.distance,
        segment: e.segment
          ? {
              id: e.segment.id,
              name: e.segment.name,
              climb_category: e.segment.climb_category,
              distance: e.segment.distance,
              start_latlng: e.segment.start_latlng,
              end_latlng: e.segment.end_latlng,
            }
          : null,
      }));
      return json({ segment_efforts, refresh_token: t.refresh_token });
    }

    if (url.pathname.endsWith("/activities") && request.method === "POST") {
      const { refresh_token, page = 1, perPage = 100 } = await request.json();
      const t = await refresh(refresh_token);
      if (!t.access_token) return json({ error: "refresh failed", detail: t }, 400);
      const ar = await fetch(
        `${STRAVA}/api/v3/athlete/activities?per_page=${perPage}&page=${page}`,
        { headers: { Authorization: `Bearer ${t.access_token}` } },
      );
      const acts = await ar.json();
      if (!Array.isArray(acts)) return json({ error: "activities failed", detail: acts }, 400);
      const activities = acts.map((a: Record<string, unknown> & { map?: { summary_polyline?: string } }) => ({
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
