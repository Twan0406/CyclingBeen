import type { RouteSuggestion } from '../types/destination';
import type { SnappedTrack } from './snapRoute';
import { routeSlug } from './routeSlug';

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/**
 * Build a GPX 1.1 file for a route.
 *
 * With a snapped track the trackpoints are the real line along the roads, at
 * full resolution with elevation — the file a computer can follow turn by turn.
 * Without one it falls back to the waypoint outline, which a route planner
 * still snaps onto roads on import.
 *
 * The named waypoints are written either way, so the places stay visible.
 */
export function routeToGpx(
  route: RouteSuggestion,
  placeName: string,
  track?: SnappedTrack | null,
): string {
  const pts = route.waypoints ?? [];
  const name = `${route.name} — ${placeName}`;

  const wpts = pts
    .map(
      (p) =>
        `  <wpt lat="${p.lat.toFixed(6)}" lon="${p.lng.toFixed(6)}"><name>${esc(p.name)}</name></wpt>`,
    )
    .join('\n');

  const trkpts = track
    ? track.coords
        .map(([lng, lat, ele]) => {
          const e = typeof ele === 'number' ? `<ele>${ele.toFixed(1)}</ele>` : '';
          return `      <trkpt lat="${lat.toFixed(6)}" lon="${lng.toFixed(6)}">${e}</trkpt>`;
        })
        .join('\n')
    : pts
        .map(
          (p) =>
            `      <trkpt lat="${p.lat.toFixed(6)}" lon="${p.lng.toFixed(6)}"><name>${esc(p.name)}</name></trkpt>`,
        )
        .join('\n');

  const km = track ? track.distanceKm.toFixed(1) : String(route.distanceKm);
  const climb = track?.elevationM ?? route.elevationM;
  const desc = `${route.description} ${km} km${climb ? `, ${Math.round(climb)} m climbing` : ''}.${
    track ? '' : ' Course outline — import into a route planner to snap it onto roads.'
  }`;

  return `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="Ridewild" xmlns="http://www.topografix.com/GPX/1/1">
  <metadata>
    <name>${esc(name)}</name>
    <desc>${esc(desc)}</desc>
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

export function downloadGpx(
  route: RouteSuggestion,
  placeName: string,
  track?: SnappedTrack | null,
) {
  const blob = new Blob([routeToGpx(route, placeName, track)], { type: 'application/gpx+xml' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${routeSlug(route.name)}.gpx`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
