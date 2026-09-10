import { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import type { RouteWaypoint } from '../types/destination';

/**
 * A flat map of one route: the line through its waypoints, each point numbered.
 * Unlike the browse globe this is a working map — it opens framed on the ride.
 */
export default function RouteMap({
  waypoints,
  color = '#dfa04a',
  height = 420,
}: {
  waypoints: RouteWaypoint[];
  color?: string;
  height?: number;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || waypoints.length === 0) return;

    const coords = waypoints.map((w) => [w.lng, w.lat] as [number, number]);
    const bounds = coords.reduce(
      (b, c) => b.extend(c),
      new maplibregl.LngLatBounds(coords[0], coords[0]),
    );

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: {
        version: 8,
        sources: {
          carto: {
            type: 'raster',
            tiles: [
              'https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png',
              'https://b.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png',
              'https://c.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png',
            ],
            tileSize: 256,
            attribution: '© OpenStreetMap © CARTO',
          },
        },
        layers: [
          { id: 'bg', type: 'background', paint: { 'background-color': '#100e0c' } },
          { id: 'carto', type: 'raster', source: 'carto' },
        ],
      },
      bounds,
      fitBoundsOptions: { padding: 60, maxZoom: 12 },
      attributionControl: false,
    });
    map.addControl(new maplibregl.NavigationControl({ visualizePitch: false }), 'top-right');
    map.addControl(new maplibregl.AttributionControl({ compact: true }));

    map.on('load', () => {
      map.addSource('route', {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: { type: 'LineString', coordinates: coords },
        },
      });
      map.addLayer({
        id: 'route-casing',
        type: 'line',
        source: 'route',
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: { 'line-color': '#14120f', 'line-width': 7, 'line-opacity': 0.7 },
      });
      map.addLayer({
        id: 'route-line',
        type: 'line',
        source: 'route',
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: { 'line-color': color, 'line-width': 3.5 },
      });
    });

    const markers = waypoints.map((w, i) => {
      const el = document.createElement('div');
      el.className = 'route-pin';
      el.style.setProperty('--dot', color);
      el.textContent = String(i + 1);
      return new maplibregl.Marker({ element: el })
        .setLngLat([w.lng, w.lat])
        .setPopup(new maplibregl.Popup({ offset: 16, closeButton: false, className: 'climb-popup' }).setText(w.name))
        .addTo(map);
    });

    return () => {
      markers.forEach((m) => m.remove());
      map.remove();
    };
  }, [waypoints, color]);

  return (
    <div className="rounded-[20px] overflow-hidden border border-[#2a241e]">
      <div ref={containerRef} style={{ height, width: '100%' }} />
    </div>
  );
}
