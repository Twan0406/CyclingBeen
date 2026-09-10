import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

/** Anything that can sit on the globe: a climb, a destination, an event. */
export interface MapPoint {
  id: string;
  name: string;
  lat: number;
  lng: number;
  /** Category accent, so terrain is readable at a glance. */
  color: string;
  /** Ridden or conquered — drawn filled and glowing. */
  done: boolean;
  href: string;
}

interface Props {
  points: MapPoint[];
  /** Legend entries to show, usually the categories currently on the map. */
  legend?: Array<{ label: string; color: string }>;
  height?: number;
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

export default function RideMap({ points, legend = [], height = 560 }: Props) {
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
      center: [8, 44],
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
    const stop = () => {
      spinning = false;
    };
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

    for (const p of points) {
      const el = document.createElement('div');
      el.className = p.done ? 'ride-dot ride-dot--done' : 'ride-dot';
      el.style.setProperty('--dot', p.color);
      el.title = p.name;
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        navigateRef.current(p.href);
      });
      const popup = new maplibregl.Popup({
        offset: 14,
        closeButton: false,
        className: 'climb-popup',
      }).setText(p.name + (p.done ? ' ✓' : ''));
      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([p.lng, p.lat])
        .setPopup(popup)
        .addTo(map);
      el.addEventListener('mouseenter', () => marker.togglePopup());
      el.addEventListener('mouseleave', () => marker.togglePopup());
      markers.push(marker);
    }
    return () => markers.forEach((m) => m.remove());
  }, [points]);

  return (
    <div className="relative rounded-[24px] overflow-hidden border border-[#2a241e] bg-[radial-gradient(120%_120%_at_50%_0%,#1a1712_0%,#100e0c_60%)]">
      <div className="starfield absolute inset-0 pointer-events-none opacity-70" />
      <div ref={containerRef} style={{ height, width: '100%' }} className="relative z-[1]" />

      <div className="absolute bottom-6 left-6 right-6 z-10 flex flex-wrap items-center gap-x-5 gap-y-2 bg-[rgba(22,19,16,0.72)] backdrop-blur-md border border-[#322b24] rounded-2xl px-[18px] py-[10px] w-fit max-w-[calc(100%-3rem)]">
        {legend.map((l) => (
          <span key={l.label} className="flex items-center gap-2">
            <span
              className="w-[10px] h-[10px] rounded-full border-2"
              style={{ borderColor: l.color }}
            />
            <span className="text-[13px] text-[#d6cec2] font-medium">{l.label}</span>
          </span>
        ))}
        <span className="flex items-center gap-2">
          <span className="w-[10px] h-[10px] rounded-full bg-[#dfa04a] shadow-[0_0_8px_rgba(223,160,74,0.8)]" />
          <span className="text-[13px] text-[#f4efe7] font-medium">Ridden</span>
        </span>
        <span className="font-mono-dc text-[11px] text-[#7a7066] hidden md:inline">
          drag to spin the globe
        </span>
      </div>
    </div>
  );
}
