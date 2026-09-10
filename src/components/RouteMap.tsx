import { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import type { RouteWaypoint } from '../types/destination';
import { baseStyle } from '../lib/basemap';

/**
 * A flat map of one route: the line it follows, with each waypoint numbered.
 * `line` is the snapped track when the router has returned one, and the
 * straight waypoint outline until then.
 */
export default function RouteMap({
  waypoints,
  line,
  color = '#dfa04a',
  height = 420,
}: {
  waypoints: RouteWaypoint[];
  line: [number, number][];
  color?: string;
  height?: number;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);

  // Create the map once, framed on the route.
  useEffect(() => {
    if (!containerRef.current || mapRef.current || waypoints.length === 0) return;

    const start: [number, number] = [waypoints[0].lng, waypoints[0].lat];
    const bounds = waypoints.reduce(
      (b, w) => b.extend([w.lng, w.lat] as [number, number]),
      new maplibregl.LngLatBounds(start, start),
    );

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: baseStyle,
      bounds,
      fitBoundsOptions: { padding: 60, maxZoom: 13 },
      attributionControl: false,
    });
    mapRef.current = map;
    map.addControl(new maplibregl.NavigationControl({ visualizePitch: false }), 'top-right');
    map.addControl(new maplibregl.AttributionControl({ compact: true }));

    map.on('load', () => {
      map.addSource('route', {
        type: 'geojson',
        data: { type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: [] } },
      });
      map.addLayer({
        id: 'route-casing',
        type: 'line',
        source: 'route',
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: { 'line-color': '#14120f', 'line-width': 7, 'line-opacity': 0.75 },
      });
      map.addLayer({
        id: 'route-line',
        type: 'line',
        source: 'route',
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: { 'line-color': color, 'line-width': 4 },
      });
    });

    const markers = waypoints.map((w, i) => {
      const el = document.createElement('div');
      el.className = 'route-pin';
      el.style.setProperty('--dot', color);
      el.textContent = String(i + 1);
      return new maplibregl.Marker({ element: el })
        .setLngLat([w.lng, w.lat])
        .setPopup(
          new maplibregl.Popup({ offset: 16, closeButton: false, className: 'climb-popup' }).setText(
            w.name,
          ),
        )
        .addTo(map);
    });

    return () => {
      markers.forEach((m) => m.remove());
      map.remove();
      mapRef.current = null;
    };
  }, [waypoints, color]);

  // Redraw whenever the line changes — the snapped track replaces the outline.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || line.length < 2) return;

    const draw = () => {
      const src = map.getSource('route') as maplibregl.GeoJSONSource | undefined;
      if (!src) return;
      src.setData({
        type: 'Feature',
        properties: {},
        geometry: { type: 'LineString', coordinates: line },
      });
      const bounds = line.reduce(
        (b, c) => b.extend(c),
        new maplibregl.LngLatBounds(line[0], line[0]),
      );
      map.fitBounds(bounds, { padding: 60, maxZoom: 13, duration: 600 });
    };

    if (map.isStyleLoaded() && map.getSource('route')) draw();
    else map.once('idle', draw);
  }, [line]);

  return (
    <div className="rounded-[20px] overflow-hidden border border-[#2a241e]">
      <div ref={containerRef} style={{ height, width: '100%' }} />
    </div>
  );
}
