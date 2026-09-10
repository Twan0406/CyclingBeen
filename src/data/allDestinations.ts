import type { Destination } from '../types/destination';
import { destinations } from './destinations';
import { adventures } from './adventures';
import { destinationGuides } from './destinationGuides';
import { routeWaypoints } from './routeWaypoints';
import { moreDestinations, moreAdventures } from './moreDestinations';

/** Every destination and adventure, with its editorial guide and route waypoints merged in. */
export const allDestinations: Destination[] = [
  ...destinations,
  ...moreDestinations,
  ...adventures,
  ...moreAdventures,
].map((d) => {
  const guide = destinationGuides[d.id] ?? {};
  const wp = routeWaypoints[d.id];
  return {
    ...d,
    ...guide,
    routes: (guide.routes ?? d.routes)?.map((r) => (wp?.[r.name] ? { ...r, waypoints: wp[r.name] } : r)),
  };
});
