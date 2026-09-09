import { Link } from 'react-router-dom';
import ClimbPhoto from './ClimbPhoto';
import { categories, type Destination } from '../types/destination';

export default function DestinationCard({ destination }: { destination: Destination }) {
  const cat = categories.find((c) => c.id === destination.category);

  return (
    <Link to={`/place/${destination.id}`} className="group block">
      <div className="rounded-2xl overflow-hidden bg-[#1c1915] border border-[#322b24] hover:border-[#4a4038] transition-all duration-150 group-hover:-translate-y-0.5">
        <div className="relative h-[190px] overflow-hidden">
          <ClimbPhoto subject={destination} size={480} className="absolute inset-0 w-full h-full" />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(20,18,15,0)_30%,rgba(20,18,15,0.55)_62%,rgba(20,18,15,0.95)_100%)]" />
          {cat && (
            <span
              className="absolute bottom-3 left-3 font-mono-dc text-[10px] font-medium tracking-[0.08em] uppercase px-[9px] py-[3px] rounded-md"
              style={{ background: `${cat.color}e6`, color: '#1a1206' }}
            >
              {cat.label}
            </span>
          )}
        </div>
        <div className="px-[18px] pt-4 pb-[18px]">
          <h3 className="text-[19px] font-semibold text-[#f4efe7] leading-tight">{destination.name}</h3>
          <p className="text-[13px] text-[#a1968a] mt-[3px]">
            {destination.region}, {destination.country}
          </p>
          <p className="text-[13px] text-[#7a7066] mt-2 leading-snug line-clamp-2">{destination.summary}</p>
          <div className="flex gap-[22px] mt-4">
            {destination.category === 'bikepacking' && destination.totalKm != null ? (
              <>
                <Stat label="Route" value={`${destination.totalKm.toLocaleString('de-DE')} km`} />
                {destination.days != null && <Stat label="Days" value={`± ${destination.days}`} />}
              </>
            ) : destination.category === 'events' ? (
              <>
                <Stat label="Distance" value={`${destination.typicalRideKm} km`} />
                {destination.whenHeld && <Stat label="When" value={destination.whenHeld.split(',')[0]} />}
              </>
            ) : (
              <>
                <Stat label="Typical ride" value={`${destination.typicalRideKm} km`} />
                {destination.elevationGainM != null && (
                  <Stat label="Climbing" value={`${destination.elevationGainM.toLocaleString('de-DE')} m`} />
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="font-mono-dc text-[9px] tracking-[0.12em] uppercase text-[#6b6157] mb-1">{label}</div>
      <div className="text-[14px] font-semibold text-[#f4efe7]">{value}</div>
    </div>
  );
}
