import { useEffect, useRef, useState } from 'react';
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
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  // A browse page holds forty cards. Resolving every photo at once floods the
  // connection pool and the ones you are actually looking at queue behind the
  // ones you are not, so a photo is only looked up once its card is near view.
  useEffect(() => {
    const el = ref.current;
    if (!el || visible) return;
    if (typeof IntersectionObserver === 'undefined') {
      setVisible(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setVisible(true);
          io.disconnect();
        }
      },
      { rootMargin: '400px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [visible]);

  const fetched = useClimbPhoto(
    subject.wikiTitle,
    subject.lat,
    subject.lng,
    size,
    subject.photoQuery,
    subject.photoFile,
    visible,
  );
  const candidate = subject.photoUrl ?? fetched;
  const [broken, setBroken] = useState<string | null>(null);
  // A pinned file that no longer exists on Commons must not leave a broken
  // image behind — fall back to the gradient instead.
  const photo = candidate && candidate !== broken ? candidate : null;

  return (
    <div
      ref={ref}
      className={`bg-cover bg-center ${className}`}
      style={{ background: subject.gradient }}
    >
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
