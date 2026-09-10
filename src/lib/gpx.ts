import type { RouteSuggestion } from '../types/destination';
import { routeSlug } from './routeSlug';

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/**
 * Build a GPX 1.1 course from a route's waypoints.
 *
 * The points are the real places the route runs through, in order — not a
 * metre-by-metre recording. Every planner (Komoot, Garmin, RideWithGPS,
 * Strava) will snap them onto roads and give you the exact line and profile.
 */
export function routeToGpx(route: RouteSuggestion, placeName: string): string {
  const pts = route.waypoints ?? [];
  const name = `${route.name} — ${placeName}`;
  const trkpts = pts
    .map(
      (p) =>
        `      <trkpt lat="${p.lat.toFixed(6)}" lon="${p.lng.toFixed(6)}"><name>${esc(p.name)}</name></trkpt>`,
    )
    .join('\n');
  const wpts = pts
    .map(
      (p) =>
        `  <wpt lat="${p.lat.toFixed(6)}" lon="${p.lng.toFixed(6)}"><name>${esc(p.name)}</name></wpt>`,
    )
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="Ridewild" xmlns="http://www.topografix.com/GPX/1/1">
  <metadata>
    <name>${esc(name)}</name>
    <desc>${esc(route.description)} Approx. ${route.distanceKm} km${
      route.elevationM ? `, ${route.elevationM} m climbing` : ''
    }. Course outline — import into a route planner to snap it onto roads.</desc>
  </metadata>
${wpts}
  <trk>
    <name>${esc(name)}</name>
    <trkseg>
${trkpts}
    </trkseg>
  </trk>
</gpx>
`;
}

export function downloadGpx(route: RouteSuggestion, placeName: string) {
  const blob = new Blob([routeToGpx(route, placeName)], { type: 'application/gpx+xml' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${routeSlug(route.name)}.gpx`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
