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
    <div className="relative rounded-3xl overflow-hidden border border-[#1D9E75]/25 shadow-[0_0_40px_rgba(29,158,117,0.15)]">
      <MapContainer
        center={[45.0, 5.5]}
        zoom={5}
        minZoom={3}
        scrollWheelZoom={false}
        style={{ height: '440px', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        {climbs.map((climb) => (
          climb.completed ? (
            // Conquered: bright glowing double ring
            <CircleMarker
              key={climb.id}
              center={[climb.lat, climb.lng]}
              radius={9}
              className="marker-conquered"
              pathOptions={{
                color: '#2fd6a0',
                fillColor: '#1D9E75',
                fillOpacity: 1,
                weight: 3,
              }}
              eventHandlers={{ click: () => navigate(`/climb/${climb.id}`) }}
            >
              <Tooltip direction="top" offset={[0, -8]} className="climb-tip">
                <strong>{climb.name}</strong> — ✓ conquered
              </Tooltip>
            </CircleMarker>
          ) : (
            // Bucket list: dim hollow ring
            <CircleMarker
              key={climb.id}
              center={[climb.lat, climb.lng]}
              radius={7}
              pathOptions={{
                color: 'rgba(150, 170, 165, 0.8)',
                fillColor: '#0a1210',
                fillOpacity: 0.5,
                weight: 2,
                dashArray: '3 3',
              }}
              eventHandlers={{ click: () => navigate(`/climb/${climb.id}`) }}
            >
              <Tooltip direction="top" offset={[0, -8]} className="climb-tip">
                <strong>{climb.name}</strong> — bucket list
              </Tooltip>
            </CircleMarker>
          )
        ))}
      </MapContainer>

      {/* HUD overlay: progress chip */}
      <div className="absolute top-4 left-4 z-[500] pointer-events-none">
        <div className="bg-[#070b0a]/80 backdrop-blur-md border border-[#1D9E75]/40 rounded-2xl px-4 py-2.5 shadow-[0_0_20px_rgba(29,158,117,0.25)]">
          <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400">World Progress</p>
          <p className="text-xl font-bold text-white leading-tight">
            <span className="neon-green">{conquered}</span>
            <span className="text-gray-500 text-sm font-normal"> / {climbs.length} conquered</span>
          </p>
        </div>
      </div>

      {/* HUD overlay: legend */}
      <div className="absolute bottom-4 left-4 z-[500] pointer-events-none">
        <div className="flex items-center gap-4 bg-[#070b0a]/80 backdrop-blur-md border border-white/10 rounded-full px-4 py-2 text-xs">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#2fd6a0] shadow-[0_0_8px_rgba(47,214,160,0.9)]" />
            <span className="text-gray-300">Conquered</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full border border-dashed border-gray-400" />
            <span className="text-gray-400">Bucket list</span>
          </span>
        </div>
      </div>
    </div>
  );
}
