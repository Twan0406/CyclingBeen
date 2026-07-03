import { Link } from 'react-router-dom';
import { Climb } from '../types/climb';
import { Check, ArrowUp, Ruler } from 'lucide-react';
import ClimbPhoto from './ClimbPhoto';

interface Props {
  climb: Climb;
}

const difficultyColors: Record<string, string> = {
  'easy': 'bg-emerald-400/15 text-emerald-300',
  'medium': 'bg-sky-400/15 text-sky-300',
  'hard': 'bg-orange-400/15 text-orange-300',
  'hors-categorie': 'bg-rose-400/15 text-rose-300',
};

export default function ClimbCard({ climb }: Props) {
  return (
    <Link to={`/climb/${climb.id}`} className="group block">
      <div
        className={`relative rounded-2xl overflow-hidden bg-[#111827] ring-1 transition-all duration-300 ${
          climb.completed
            ? 'ring-amber-400/40 shadow-lg shadow-amber-500/10'
            : 'ring-white/8 hover:ring-white/20'
        }`}
      >
        <div className="h-40 w-full relative">
          <ClimbPhoto climb={climb} size={480} className="absolute inset-0 w-full h-full" />
          {climb.completed && (
            <div className="absolute top-3 right-3 z-10 w-7 h-7 rounded-full bg-amber-400 flex items-center justify-center shadow-lg shadow-amber-500/40">
              <Check className="w-4 h-4 text-[#0a0f1c]" strokeWidth={3} />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#111827] via-transparent to-transparent" />
          <div className="absolute bottom-3 left-3 right-3 z-10">
            <h3 className="text-white font-semibold text-base leading-tight">{climb.name}</h3>
            <p className="text-slate-400 text-xs mt-0.5">{climb.region}, {climb.country}</p>
          </div>
        </div>
        <div className="px-3 py-2.5">
          <div className="flex items-center gap-3 text-xs text-slate-400">
            <span className="flex items-center gap-1"><ArrowUp className="w-3 h-3 text-amber-400/80" />{climb.elevationM.toLocaleString()}m</span>
            <span className="flex items-center gap-1"><Ruler className="w-3 h-3 text-amber-400/80" />{climb.lengthKm}km</span>
            <span className={`ml-auto px-2 py-0.5 rounded-full text-[11px] font-semibold ${difficultyColors[climb.difficulty]}`}>
              {climb.difficulty === 'hors-categorie' ? 'HC' : climb.difficulty}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
