import { Link } from 'react-router-dom';
import { Climb } from '../types/climb';
import { CheckCircle, ArrowUp, Ruler } from 'lucide-react';

interface Props {
  climb: Climb;
}

const difficultyColors: Record<string, string> = {
  'easy': 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  'medium': 'bg-yellow-500/15 text-yellow-300 border-yellow-500/30',
  'hard': 'bg-orange-500/15 text-orange-300 border-orange-500/30',
  'hors-categorie': 'bg-red-500/15 text-red-300 border-red-500/30',
};

export default function ClimbCard({ climb }: Props) {
  return (
    <Link to={`/climb/${climb.id}`} className="group block">
      <div className={`relative rounded-2xl overflow-hidden border transition-all duration-300 ${climb.completed ? 'border-[#1D9E75]/40 shadow-[0_0_24px_rgba(29,158,117,0.2)] hover:shadow-[0_0_36px_rgba(29,158,117,0.35)]' : 'border-white/10 opacity-75 hover:opacity-100 hover:border-white/25'}`}>
        <div
          className="h-40 w-full relative bg-cover bg-center"
          style={{ background: climb.gradient }}
        >
          <img
            src={climb.photoUrl}
            alt={climb.name}
            loading="lazy"
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          {climb.completed && (
            <div className="absolute top-3 right-3 z-10">
              <CheckCircle className="w-7 h-7 text-[#070b0a] drop-shadow-[0_0_8px_rgba(47,214,160,0.9)]" fill="#2fd6a0" />
            </div>
          )}
          <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-[#070b0a] to-transparent" />
          <div className="absolute bottom-3 left-3 right-3">
            <h3 className="text-white font-bold text-base leading-tight">{climb.name}</h3>
            <p className="text-gray-400 text-xs">{climb.region}, {climb.country}</p>
          </div>
        </div>
        <div className="bg-[#0d1412] px-3 py-2.5 border-t border-white/5">
          <div className="flex items-center gap-3 text-xs text-gray-400">
            <span className="flex items-center gap-1"><ArrowUp className="w-3 h-3 text-[#2fd6a0]" />{climb.elevationM.toLocaleString()}m</span>
            <span className="flex items-center gap-1"><Ruler className="w-3 h-3 text-[#2fd6a0]" />{climb.lengthKm}km</span>
            <span className={`ml-auto px-2 py-0.5 rounded-full text-xs font-semibold border ${difficultyColors[climb.difficulty]}`}>
              {climb.difficulty === 'hors-categorie' ? 'HC' : climb.difficulty}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
