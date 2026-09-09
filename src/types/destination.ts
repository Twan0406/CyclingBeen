/** The kinds of riding the site covers. 'climbs' is served by the climb data. */
export type RideCategory = 'climbs' | 'gravel' | 'hills' | 'flat' | 'mtb' | 'bikepacking' | 'events';

export interface CategoryMeta {
  id: RideCategory;
  label: string;
  tagline: string;
  /** Accent used for the category across cards, filters and headers. */
  color: string;
}

export const categories: CategoryMeta[] = [
  { id: 'climbs', label: 'Mountains', tagline: 'The legendary ascents', color: '#dfa04a' },
  { id: 'gravel', label: 'Gravel', tagline: 'Off the tarmac', color: '#7f8f5f' },
  { id: 'hills', label: 'Hills', tagline: 'Short, sharp and relentless', color: '#c4633a' },
  { id: 'flat', label: 'Flat & coastal', tagline: 'Big skies and open roads', color: '#7d9aa8' },
  { id: 'mtb', label: 'Mountain bike', tagline: 'Trails and descents', color: '#9a7bab' },
  {
    id: 'bikepacking',
    label: 'Bikepacking',
    tagline: 'Multi-day routes, everything on the bike',
    color: '#b08968',
  },
  {
    id: 'events',
    label: 'Events',
    tagline: 'A date in the calendar to train for',
    color: '#c9805a',
  },
];

/** A concrete ride you could do from a destination. */
export interface RouteSuggestion {
  name: string;
  distanceKm: number;
  elevationM?: number;
  difficulty: 'easy' | 'moderate' | 'hard';
  description: string;
}

/**
 * A place or an adventure to ride, rather than a single climb to tick off.
 * Destinations are inspiration: they are not tracked or marked as conquered.
 */
export interface Destination {
  id: string;
  name: string;
  country: string;
  region: string;
  lat: number;
  lng: number;
  category: Exclude<RideCategory, 'climbs'>;
  /** One line for cards and search results. */
  summary: string;
  /** A few sentences of real description. */
  story: string;
  /** A typical day's ride in this area. */
  typicalRideKm: number;
  elevationGainM?: number;
  surface: string;
  bestMonths: string;
  startTown: string;
  tips: string[];
  /** English Wikipedia title — the photo is fetched at runtime. */
  wikiTitle: string;
  /** Commons search phrase so the photo shows cycling, not just scenery. */
  photoQuery?: string;
  gradient: string;

  // --- Guide depth (optional; pages degrade gracefully without them) ---
  routes?: RouteSuggestion[];
  highlights?: string[];
  gettingThere?: string;
  basedIn?: string;
  refuel?: string;

  // --- Multi-day routes ---
  days?: number;
  totalKm?: number;
  totalElevationM?: number;

  // --- Events ---
  whenHeld?: string;
  distanceOptionsKm?: number[];
  eventNote?: string;
}
