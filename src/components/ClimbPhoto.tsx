import { useEffect, useRef, useState } from 'react';
import { useClimbPhoto } from '../lib/wikiPhoto';
import { photoFor } from '../data/photos';

/** Anything with a place and a Wikipedia title can carry a photo. */
export interface PhotoSubject {
  /** Key into the build-time photo manifest. */
  id?: string;
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
  /** Show the Commons author and licence under the image. */
  showCredit?: boolean;
}

/** Renders the subject's photo over its gradient placeholder. */
export default function ClimbPhoto({
  subject,
  size = 800,
  className = '',
  showCredit = false,
}: Props) {
  // Resolved at build time: a file name we already have, so the image starts
  // loading on the first paint with no lookup in between.
  const known = photoFor(subject.id, size);

  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  // Only subjects missing from the manifest still need the live lookup, and
  // even then only once their card is near the viewport — forty cards must not
  // start forty searches at once.
  const needsLookup = !known && !subject.photoUrl;

  useEffect(() => {
    const el = ref.current;
    if (!el || visible || !needsLookup) return;
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
  }, [visible, needsLookup]);

  const fetched = useClimbPhoto(
    subject.wikiTitle,
    subject.lat,
    subject.lng,
    size,
    subject.photoQuery,
    subject.photoFile,
    visible && needsLookup,
  );

  const candidate = subject.photoUrl ?? known?.url ?? fetched;
  const [broken, setBroken] = useState<string | null>(null);
  // A file that has since been renamed or deleted on Commons must not leave a
  // broken image behind — fall back to the gradient instead.
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
          decoding="async"
          onError={() => setBroken(photo)}
          className="absolute inset-0 w-full h-full object-cover animate-[fadein_0.5s_ease]"
        />
      )}
      {showCredit && photo && known?.entry.credit && (
        <span className="absolute bottom-1.5 right-2.5 z-10 font-mono-dc text-[9px] text-white/55 drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
          {known.entry.credit}
          {known.entry.license ? ` · ${known.entry.license}` : ''}
        </span>
      )}
    </div>
  );
}
