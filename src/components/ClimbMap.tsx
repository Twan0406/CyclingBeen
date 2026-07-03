import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, CircleMarker, Tooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import type { Climb } from '../types/climb';

interface Props {
  climbs: Climb[];
}

export default function ClimbMap({ climbs }: Props) {
  const navigate = useNavigate();
  const conquered = climbs.filter(c => c.completed).length;

  return (
    <div className="relative rounded-3xl overflow-hidden ring-1 ring-white/10 shadow-2xl shadow-black/40">
      <MapContainer
        center={[45.5, 6.0]}
        zoom={5}
        minZoom={3}
        scrollWheelZoom={false}
        style={{ height: '440px', width: '100%' }}
        preferCanvas
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        {climbs.map((climb) => (
          climb.completed ? (
            <CircleMarker
              key={climb.id}
              center={[climb.lat, climb.lng]}
              radius={8}
              className="marker-conquered"
              pathOptions={{ color: '#fcd34d', fillColor: '#fbbf24', fillOpacity: 1, weight: 2.5 }}
              eventHandlers={{ click: () => navigate(`/climb/${climb.id}`) }}
            >
              <Tooltip direction="top" offset={[0, -8]} className="climb-tip">
                <strong>{climb.name}</strong> — ✓ conquered
              </Tooltip>
            </CircleMarker>
          ) : (
            <CircleMarker
              key={climb.id}
              center={[climb.lat, climb.lng]}
              radius={5}
              pathOptions={{ color: '#64748b', fillColor: '#334155', fillOpacity: 0.7, weight: 1.5 }}
              eventHandlers={{ click: () => navigate(`/climb/${climb.id}`) }}
            >
              <Tooltip direction="top" offset={[0, -6]} className="climb-tip">
                <strong>{climb.name}</strong>
              </Tooltip>
            </CircleMarker>
          )
        ))}
      </MapContainer>

      <div className="absolute top-4 left-4 z-[500] pointer-events-none">
        <div className="bg-[#0a0f1c]/80 backdrop-blur-md ring-1 ring-white/10 rounded-2xl px-4 py-2.5">
          <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400">Your world</p>
          <p className="text-xl font-bold text-white leading-tight">
            <span className="text-amber-400">{conquered}</span>
            <span className="text-slate-500 text-sm font-normal"> / {climbs.length} conquered</span>
          </p>
        </div>
      </div>

      <div className="absolute bottom-4 left-4 z-[500] pointer-events-none">
        <div className="flex items-center gap-4 bg-[#0a0f1c]/80 backdrop-blur-md ring-1 ring-white/10 rounded-full px-4 py-2 text-xs">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.9)]" />
            <span className="text-slate-300">Conquered</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-slate-600" />
            <span className="text-slate-400">To climb</span>
          </span>
        </div>
      </div>
    </div>
  );
}
