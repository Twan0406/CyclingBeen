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
  );
  const photo = subject.photoUrl ?? fetched;

  return (
    <div className={`bg-cover bg-center ${className}`} style={{ background: subject.gradient }}>
      {photo && (
        <img
          src={photo}
          alt={subject.name}
          loading="lazy"
          className="absolute inset-0 w-full h-full object-cover animate-[fadein_0.5s_ease]"
        />
      )}
    </div>
  );
}
