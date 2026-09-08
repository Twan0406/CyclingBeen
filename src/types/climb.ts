export interface ProQuote {
  quote: string;
  cyclist: string;
  year: number;
}

export interface ProRecord {
  rider: string;
  time: string;
  year: number;
  note?: string;
}

export interface Climb {
  id: string;
  name: string;
  country: string;
  region: string;
  lat: number;
  lng: number;
  elevationM: number;
  lengthKm: number;
  avgGradientPct: number;
  difficulty: 'easy' | 'medium' | 'hard' | 'hors-categorie';
  shortDescription: string;
  story: string;
  /** English Wikipedia page title; the photo is fetched from the Wikipedia API at runtime. */
  wikiTitle: string;
  photoUrl?: string;
  gradient: string;
  tourHistory?: string;
  proRecords?: ProRecord[];
  proQuotes?: ProQuote[];

  // --- Ride guide (all optional; pages degrade gracefully without them) ---
  /** Town riders usually start the ascent from. */
  startTown?: string;
  /** Overrides the season derived from elevation, e.g. 'Year-round'. */
  bestMonths?: string;
  /** Practical, hard-won advice: parking, water, when to avoid. */
  tips?: string[];
  /** Curated YouTube video id for an embedded ascent. */
  videoId?: string;

  completed: boolean;
}

export interface UserClimb {
  userId: string;
  climbId: string;
  stravaActivityId?: string;
  completedAt: Date;
}

export interface StravaActivity {
  id: number;
  name: string;
  distance: number;
  moving_time: number;
  elapsed_time: number;
  total_elevation_gain: number;
  start_date: string;
  start_date_local: string;
  start_latlng?: [number, number];
  end_latlng?: [number, number];
}
