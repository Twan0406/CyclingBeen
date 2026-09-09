import { Link } from 'react-router-dom';
import { Climb } from '../types/climb';
import ClimbPhoto from './ClimbPhoto';

interface Props {
  climb: Climb;
}

const cat: Record<string, { label: string; bg: string; fg: string }> = {
  'hors-categorie': { label: 'HC', bg: 'rgba(226,72,72,0.9)', fg: '#fff' },
  'hard': { label: 'hard', bg: 'rgba(240,142,61,0.9)', fg: '#1a1206' },
  'medium': { label: 'medium', bg: 'rgba(120,130,150,0.85)', fg: '#fff' },
  'easy': { label: 'easy', bg: 'rgba(120,130,150,0.85)', fg: '#fff' },
};

export default function ClimbCard({ climb }: Props) {
  const done = climb.completed;
  const c = cat[climb.difficulty] ?? cat.medium;

  return (
    <Link to={`/climb/${climb.id}`} className="group block">
      <div
        className={`rounded-2xl overflow-hidden bg-[#1c1915] transition-all duration-150 group-hover:-translate-y-0.5 ${
          done
            ? 'border border-[rgba(223,160,74,0.55)] shadow-[0_0_0_1px_rgba(223,160,74,0.15),0_8px_30px_rgba(223,160,74,0.08)] group-hover:border-[rgba(223,160,74,0.8)]'
            : 'border border-[#322b24] opacity-[0.82] group-hover:opacity-100'
        }`}
      >
        {/* Photo */}
        <div className="relative h-[190px] overflow-hidden">
          <ClimbPhoto
            subject={climb}
            size={480}
            className={`absolute inset-0 w-full h-full ${done ? '' : 'grayscale-[.7] brightness-[.72]'}`}
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(20,18,15,0)_30%,rgba(20,18,15,0.55)_62%,rgba(20,18,15,0.95)_100%)]" />

          {done && (
            <div className="absolute top-3 right-3 flex items-center gap-1 bg-[#dfa04a] text-[#1a1206] font-mono-dc text-[10px] font-medium tracking-[0.08em] uppercase pl-[7px] pr-[9px] py-1 rounded-full">
              <span className="text-[11px]">✓</span> Conquered
            </div>
          )}

          <div
            className="absolute bottom-3 right-3 font-mono-dc text-[10px] font-medium tracking-[0.06em] uppercase px-[9px] py-[3px] rounded-md"
            style={{ background: c.bg, color: c.fg }}
          >
            {c.label}
          </div>
        </div>

        {/* Body */}
        <div className="px-[18px] pt-4 pb-[18px]">
          <h3 className="text-[18px] font-bold tracking-[-0.01em] text-[#f4efe7] leading-tight">{climb.name}</h3>
          <p className="text-[13px] text-[#a1968a] mt-[3px] mb-4">{climb.region}, {climb.country}</p>
          <div className="flex gap-[22px]">
            <Stat label="Elevation" value={`${climb.elevationM.toLocaleString('de-DE')} m`} />
            <Stat label="Distance" value={`${climb.lengthKm} km`} />
          </div>
        </div>
      </div>
    </Link>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="font-mono-dc text-[9px] tracking-[0.12em] uppercase text-[#6b6157] mb-[3px]">{label}</div>
      <div className="text-[14px] font-semibold text-[#f4efe7]">{value}</div>
    </div>
  );
}
