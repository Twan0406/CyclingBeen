import { useState } from 'react';
import { useClimbPhoto } from '../lib/wikiPhoto';

/** Anything with a place and a Wikipedia title can carry a photo. */
export interface PhotoSubject {
  name: string;
  wikiTitle: string;
  lat: number;
  lng: number;
  gradient: string;
  photoUrl?: string;
  /** Commons search phrase, used to steer towards cycling imagery. */
  photoQuery?: string;
  /** An exact Commons file, pinned by hand when search gets it wrong. */
  photoFile?: string;
}

interface Props {
  subject: PhotoSubject;
  size?: number;
  className?: string;
}

/** Renders the subject's photo over its gradient placeholder. */
export default function ClimbPhoto({ subject, size = 800, className = '' }: Props) {
  const fetched = useClimbPhoto(
    subject.wikiTitle,
    subject.lat,
    subject.lng,
    size,
    subject.photoQuery,
    subject.photoFile,
  );
  const candidate = subject.photoUrl ?? fetched;
  const [broken, setBroken] = useState<string | null>(null);
  // A pinned file that no longer exists on Commons must not leave a broken
  // image behind — fall back to the gradient instead.
  const photo = candidate && candidate !== broken ? candidate : null;

  return (
    <div className={`bg-cover bg-center ${className}`} style={{ background: subject.gradient }}>
      {photo && (
        <img
          src={photo}
          alt={subject.name}
          loading="lazy"
          onError={() => setBroken(photo)}
          className="absolute inset-0 w-full h-full object-cover animate-[fadein_0.5s_ease]"
        />
      )}
    </div>
  );
}
