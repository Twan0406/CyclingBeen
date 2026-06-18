import { Link } from 'react-router-dom';
import { Climb } from '../types/climb';
import { CheckCircle, ArrowUp, Ruler } from 'lucide-react';

interface Props {
  climb: Climb;
}

const difficultyColors: Record<string, string> = {
  'easy': 'bg-green-100 text-green-800',
  'medium': 'bg-yellow-100 text-yellow-800',
  'hard': 'bg-orange-100 text-orange-800',
  'hors-categorie': 'bg-red-100 text-red-800',
};

export default function ClimbCard({ climb }: Props) {
  return (
    <Link to={`/climb/${climb.id}`} className="group block">
      <div className={`relative rounded-xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 ${!climb.completed ? 'opacity-70' : ''}`}>
        <div
          className="h-36 w-full relative"
          style={{ background: climb.heroImageUrl }}
        >
          {climb.completed && (
            <div className="absolute top-3 right-3">
              <CheckCircle className="w-7 h-7 text-white drop-shadow-md" fill="#1D9E75" />
            </div>
          )}
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-3 left-3 right-3">
            <h3 className="text-white font-bold text-base leading-tight drop-shadow">{climb.name}</h3>
            <p className="text-white/80 text-xs">{climb.region}, {climb.country}</p>
          </div>
        </div>
        <div className="bg-white px-3 py-2.5">
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <span className="flex items-center gap-1"><ArrowUp className="w-3 h-3" />{climb.elevationM.toLocaleString()}m</span>
            <span className="flex items-center gap-1"><Ruler className="w-3 h-3" />{climb.lengthKm}km</span>
            <span className={`ml-auto px-1.5 py-0.5 rounded text-xs font-medium ${difficultyColors[climb.difficulty]}`}>
              {climb.difficulty === 'hors-categorie' ? 'HC' : climb.difficulty}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
