export interface ProQuote {
  quote: string;
  cyclist: string;
  year: number;
}

export interface Climb {
  id: string;
  name: string;
  country: string;
  region: string;
  elevationM: number;
  lengthKm: number;
  avgGradientPct: number;
  difficulty: 'easy' | 'medium' | 'hard' | 'hors-categorie';
  shortDescription: string;
  story: string;
  proQuotes: ProQuote[];
  heroImageUrl: string;
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
}
