import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import type { Climb } from '../types/climb';

interface Props {
  climbs: Climb[];
}

const STYLE: maplibregl.StyleSpecification = {
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
    { id: 'bg', type: 'background', paint: { 'background-color': '#0a0f1c' } },
    { id: 'carto', type: 'raster', source: 'carto' },
  ],
};

export default function ClimbMap({ climbs }: Props) {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const navigateRef = useRef(navigate);
  navigateRef.current = navigate;

  // Create the map once.
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const map = new maplibregl.Map({
      container: containerRef.current,
      style: STYLE,
      center: [8, 40],
      zoom: 2.1,
      pitch: 0,
      attributionControl: false,
    });
    mapRef.current = map;
    map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), 'top-right');
    map.addControl(new maplibregl.AttributionControl({ compact: true }));

    map.on('style.load', () => {
      map.setProjection({ type: 'globe' });
      map.setSky({
        'sky-color': '#0a0f1c',
        'sky-horizon-blend': 0.5,
        'horizon-color': '#1e293b',
        'horizon-fog-blend': 0.6,
        'fog-color': '#0a0f1c',
        'fog-ground-blend': 0.4,
        'atmosphere-blend': 0.9,
      });
    });

    // Gentle auto-spin until the user interacts.
    let spinning = true;
    const stop = () => { spinning = false; };
    map.on('mousedown', stop);
    map.on('touchstart', stop);
    map.on('wheel', stop);
    const spin = () => {
      if (spinning && !map.isMoving()) {
        const c = map.getCenter();
        map.easeTo({ center: [c.lng + 0.15, c.lat], duration: 100, easing: (t) => t });
      }
      raf = requestAnimationFrame(spin);
    };
    let raf = requestAnimationFrame(spin);

    return () => {
      cancelAnimationFrame(raf);
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Sync markers whenever climbs change.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const markers: maplibregl.Marker[] = [];

    for (const climb of climbs) {
      const el = document.createElement('div');
      el.className = climb.completed ? 'climb-dot climb-dot--done' : 'climb-dot';
      el.title = climb.name;
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        navigateRef.current(`/climb/${climb.id}`);
      });
      const popup = new maplibregl.Popup({
        offset: 14,
        closeButton: false,
        className: 'climb-popup',
      }).setText(climb.name + (climb.completed ? ' ✓' : ''));
      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([climb.lng, climb.lat])
        .setPopup(popup)
        .addTo(map);
      el.addEventListener('mouseenter', () => marker.togglePopup());
      el.addEventListener('mouseleave', () => marker.togglePopup());
      markers.push(marker);
    }

    return () => markers.forEach((m) => m.remove());
  }, [climbs]);

  const conquered = climbs.filter((c) => c.completed).length;

  return (
    <div className="relative">
      <div ref={containerRef} style={{ height: '520px', width: '100%' }} />

      <div className="absolute top-4 left-4 z-10 pointer-events-none">
        <div className="bg-[#0a0f1c]/80 backdrop-blur-md ring-1 ring-white/10 rounded-2xl px-4 py-2.5">
          <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400">Your world</p>
          <p className="text-xl font-bold text-white leading-tight">
            <span className="text-amber-400">{conquered}</span>
            <span className="text-slate-500 text-sm font-normal"> / {climbs.length} conquered</span>
          </p>
        </div>
      </div>

      <div className="absolute bottom-4 left-4 z-10 pointer-events-none">
        <div className="flex items-center gap-4 bg-[#0a0f1c]/80 backdrop-blur-md ring-1 ring-white/10 rounded-full px-4 py-2 text-xs">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.9)]" />
            <span className="text-slate-300">Conquered</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-slate-600" />
            <span className="text-slate-400">To climb</span>
          </span>
          <span className="text-slate-500 hidden sm:inline">· drag to spin the globe</span>
        </div>
      </div>
    </div>
  );
}
