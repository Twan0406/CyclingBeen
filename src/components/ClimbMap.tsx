import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, CircleMarker, Tooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import type { Climb } from '../types/climb';

interface Props {
  climbs: Climb[];
}

export default function ClimbMap({ climbs }: Props) {
  const navigate = useNavigate();

  return (
    <div className="rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
      <MapContainer
        center={[45.5, 6.5]}
        zoom={5}
        scrollWheelZoom={false}
        style={{ height: '340px', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {climbs.map((climb) => (
          <CircleMarker
            key={climb.id}
            center={[climb.lat, climb.lng]}
            radius={climb.completed ? 10 : 7}
            pathOptions={{
              color: climb.completed ? '#1D9E75' : '#9ca3af',
              fillColor: climb.completed ? '#1D9E75' : '#d1d5db',
              fillOpacity: climb.completed ? 0.9 : 0.6,
              weight: 2,
            }}
            eventHandlers={{ click: () => navigate(`/climb/${climb.id}`) }}
          >
            <Tooltip direction="top" offset={[0, -6]}>
              <span className="font-semibold">{climb.name}</span>
              {climb.completed ? ' ✓ conquered' : ' · bucket list'}
            </Tooltip>
          </CircleMarker>
        ))}
      </MapContainer>
      <div className="flex items-center gap-5 px-4 py-3 bg-white text-sm">
        <span className="flex items-center gap-2">
          <span className="w-3.5 h-3.5 rounded-full bg-[#1D9E75]" />
          <span className="text-gray-600">Conquered</span>
        </span>
        <span className="flex items-center gap-2">
          <span className="w-3.5 h-3.5 rounded-full bg-gray-300 border border-gray-400" />
          <span className="text-gray-600">Still to climb</span>
        </span>
        <span className="ml-auto text-gray-400 text-xs">Tap a dot to open the climb</span>
      </div>
    </div>
  );
}
