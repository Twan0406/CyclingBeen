import type { Destination } from '../types/destination';
import { destinations } from './destinations';
import { adventures } from './adventures';
import { destinationGuides } from './destinationGuides';

/** Every destination and adventure, with its editorial guide merged in. */
export const allDestinations: Destination[] = [...destinations, ...adventures].map((d) => ({
  ...d,
  ...(destinationGuides[d.id] ?? {}),
}));
