import { useWikiPhoto } from '../lib/wikiPhoto';
import type { Climb } from '../types/climb';

interface Props {
  climb: Climb;
  size?: number;
  className?: string;
}

/** Renders the climb's Wikipedia photo over its gradient placeholder. */
export default function ClimbPhoto({ climb, size = 800, className = '' }: Props) {
  const photo = useWikiPhoto(climb.wikiTitle, size);

  return (
    <div
      className={`bg-cover bg-center ${className}`}
      style={{ background: climb.gradient }}
    >
      {photo && (
        <img
          src={photo}
          alt={climb.name}
          loading="lazy"
          className="absolute inset-0 w-full h-full object-cover animate-[fadein_0.5s_ease]"
        />
      )}
    </div>
  );
}
