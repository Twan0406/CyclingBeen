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
    { id: 'bg', type: 'background', paint: { 'background-color': '#100e0c' } },
    { id: 'carto', type: 'raster', source: 'carto' },
  ],
};

export default function ClimbMap({ climbs }: Props) {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const navigateRef = useRef(navigate);
  navigateRef.current = navigate;

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
    map.addControl(new maplibregl.NavigationControl({ visualizePitch: false }), 'top-right');
    map.addControl(new maplibregl.AttributionControl({ compact: true }));

    map.on('style.load', () => {
      map.setProjection({ type: 'globe' });
      map.setSky({
        'sky-color': '#14120f',
        'sky-horizon-blend': 0.5,
        'horizon-color': '#322b24',
        'horizon-fog-blend': 0.6,
        'fog-color': '#14120f',
        'fog-ground-blend': 0.4,
        'atmosphere-blend': 0.9,
      });
    });

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

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const markers: maplibregl.Marker[] = [];
    for (const climb of climbs) {
      const el = document.createElement('div');
      el.className = climb.completed ? 'climb-dot climb-dot--done' : 'climb-dot';
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        navigateRef.current(`/climb/${climb.id}`);
      });
      const popup = new maplibregl.Popup({ offset: 14, closeButton: false, className: 'climb-popup' })
        .setText(climb.name + (climb.completed ? ' ✓' : ''));
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

  return (
    <div className="relative rounded-[24px] overflow-hidden border border-[#2a241e] bg-[radial-gradient(120%_120%_at_50%_0%,#1a1712_0%,#100e0c_60%)]">
      <div className="starfield absolute inset-0 pointer-events-none opacity-70" />
      <div ref={containerRef} style={{ height: '600px', width: '100%' }} className="relative z-[1]" />

      {/* Legend */}
      <div className="absolute bottom-6 left-6 z-10 flex items-center gap-5 bg-[rgba(22,19,16,0.7)] backdrop-blur-md border border-[#322b24] rounded-full px-[18px] py-[10px]">
        <span className="flex items-center gap-2">
          <span className="w-[11px] h-[11px] rounded-full bg-[#dfa04a] shadow-[0_0_8px_rgba(223,160,74,0.8)]" />
          <span className="text-[13px] text-[#f4efe7] font-medium">Conquered</span>
        </span>
        <span className="w-px h-4 bg-[#3a322a]" />
        <span className="flex items-center gap-2">
          <span className="w-[11px] h-[11px] rounded-full border-2 border-[#7d9aa8] bg-transparent" />
          <span className="text-[13px] text-[#d6cec2] font-medium">To climb</span>
        </span>
        <span className="w-px h-4 bg-[#3a322a] hidden sm:block" />
        <span className="font-mono-dc text-[11px] text-[#7a7066] hidden sm:inline">drag to spin the globe</span>
      </div>
    </div>
  );
}
