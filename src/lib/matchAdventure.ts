import type { Climb } from '../types/climb';
import type { Destination, RideCategory } from '../types/destination';
import { categories } from '../types/destination';
import { monthsFor, monthName } from './season';
import { distanceKm } from './polyline';
import { seasonFor } from './climbGuide';

export type TripLength = 'day' | 'weekend' | 'week' | 'longer';
export type BikeType = 'road' | 'gravel' | 'mtb' | 'any';
export type Reach = 'home' | 'nearby' | 'europe';
export type Effort = 'easy' | 'steady' | 'brutal';
export type Craving = 'mountains' | 'quiet' | 'punchy' | 'trails' | 'goal' | 'surprise';

/**
 * What the rider is after. This is the whole input to the recommendation, kept
 * as plain data so the same answers could later be handed to a language model
 * instead of — or alongside — the scoring below.
 */
export interface Preferences {
  length: TripLength;
  bike: BikeType;
  reach: Reach;
  effort: Effort;
  craving: Craving;
  /** 1–12, or null when the rider has no month in mind. */
  month: number | null;
}

export interface Suggestion {
  id: string;
  name: string;
  where: string;
  category: RideCategory;
  categoryLabel: string;
  color: string;
  summary: string;
  href: string;
  score: number;
  /** Why this one came out on top, in the rider's terms. */
  reasons: string[];
  /** What to be aware of — an honest counterweight to the reasons. */
  caveats: string[];
}

/** Home for this site: the Low Countries. Distance is measured from Utrecht. */
const HOME: [number, number] = [52.09, 5.12];
const HOME_COUNTRIES = ['Netherlands', 'Belgium'];

const BIKE_CATEGORIES: Record<BikeType, RideCategory[]> = {
  road: ['climbs', 'hills', 'flat', 'events'],
  gravel: ['gravel', 'bikepacking'],
  mtb: ['mtb', 'bikepacking'],
  any: ['climbs', 'hills', 'flat', 'events', 'gravel', 'bikepacking', 'mtb'],
};

const CRAVING_CATEGORIES: Record<Craving, RideCategory[]> = {
  mountains: ['climbs'],
  quiet: ['flat'],
  punchy: ['hills'],
  trails: ['mtb', 'gravel'],
  goal: ['events'],
  surprise: [],
};

/** A destination or a climb, reduced to the fields the matcher reasons about. */
interface Candidate {
  id: string;
  name: string;
  where: string;
  country: string;
  category: RideCategory;
  summary: string;
  href: string;
  lat: number;
  lng: number;
  months: Set<number>;
  /** The span of days the trip realistically wants, inclusive. */
  minDays: number;
  maxDays: number;
  /** 1 gentle, 2 steady, 3 brutal. */
  effort: Effort;
  bestMonthsText: string;
}

function climbEffort(c: Climb): Effort {
  if (c.difficulty === 'hors-categorie' || c.difficulty === 'hard') return 'brutal';
  if (c.difficulty === 'medium') return 'steady';
  return 'easy';
}

function placeEffort(d: Destination): Effort {
  if (d.category === 'flat') return 'easy';
  if (d.category === 'bikepacking') return 'brutal';
  const gain = d.elevationGainM ?? 0;
  if (gain >= 1500) return 'brutal';
  if (gain >= 600) return 'steady';
  return 'easy';
}

export function toCandidates(places: Destination[], climbs: Climb[]): Candidate[] {
  const fromPlaces = places.map<Candidate>((d) => ({
    id: d.id,
    name: d.name,
    where: `${d.region}, ${d.country}`,
    country: d.country,
    category: d.category,
    summary: d.summary,
    href: `/place/${d.id}`,
    lat: d.lat,
    lng: d.lng,
    months: monthsFor(d.bestMonths),
    // A bikepacking route takes as long as it takes; an event is a day; an
    // area is whatever you make of it, from an afternoon to a long weekend.
    minDays: d.days ?? 1,
    maxDays: d.days ?? (d.category === 'events' ? 1 : 4),
    effort: placeEffort(d),
    bestMonthsText: d.bestMonths,
  }));

  const fromClimbs = climbs.map<Candidate>((c) => ({
    id: c.id,
    name: c.name,
    where: `${c.region}, ${c.country}`,
    country: c.country,
    category: 'climbs',
    summary: c.shortDescription,
    href: `/climb/${c.id}`,
    lat: c.lat,
    lng: c.lng,
    months: monthsFor(seasonFor(c)),
    minDays: 1,
    maxDays: 1,
    effort: climbEffort(c),
    bestMonthsText: seasonFor(c),
  }));

  return [...fromPlaces, ...fromClimbs];
}

const daysWanted: Record<TripLength, number> = { day: 1, weekend: 2, week: 7, longer: 14 };

/**
 * Score every candidate against the answers and return the best few.
 *
 * Nothing is filtered out outright except an outright wrong bike, so the rider
 * always gets an answer; a poor fit simply sinks, and the mismatch is named in
 * the caveats rather than hidden.
 */
export function recommend(prefs: Preferences, candidates: Candidate[], limit = 3): Suggestion[] {
  const wanted = daysWanted[prefs.length];
  const allowedByBike = BIKE_CATEGORIES[prefs.bike];
  const craved = CRAVING_CATEGORIES[prefs.craving];

  const scored = candidates.map((c) => {
    const reasons: string[] = [];
    const caveats: string[] = [];
    let score = 0;

    // --- The bike under you. A road bike on singletrack is a non-starter.
    if (allowedByBike.includes(c.category)) score += 6;
    else if (prefs.bike !== 'any') {
      score -= 12;
      caveats.push(`This is ${categoryLabel(c.category).toLowerCase()} riding, not really a ${prefs.bike} trip.`);
    }

    // --- What they said they were craving.
    if (craved.includes(c.category)) {
      score += 8;
      reasons.push(cravingReason(prefs.craving, c));
    } else if (prefs.craving === 'surprise') {
      score += 2;
    }

    // --- Trip length. Bikepacking routes want a week; a climb is an afternoon.
    if (wanted >= c.minDays * 0.75 && wanted <= c.maxDays * 1.5) {
      score += 6;
      reasons.push(lengthReason(prefs.length, c));
    } else if (wanted < c.minDays) {
      score -= 5;
      caveats.push(`Really wants about ${c.minDays} days — you would be riding part of it.`);
    } else {
      score -= 1;
      if (prefs.length !== 'day') {
        caveats.push('Short enough on its own that you would pair it with something nearby.');
      }
    }

    // --- How far from home.
    const km = distanceKm(HOME[0], HOME[1], c.lat, c.lng);
    const isHome = HOME_COUNTRIES.includes(c.country);
    if (prefs.reach === 'home') {
      if (isHome) {
        score += 7;
        reasons.push('Close to home — no flight, no ferry, ride out of the door of the train.');
      } else {
        score -= 10;
        caveats.push(`${Math.round(km)} km from the Netherlands, so this is not a home trip.`);
      }
    } else if (prefs.reach === 'nearby') {
      if (km <= 600) {
        score += 6;
        reasons.push(`About ${Math.round(km)} km away — a drive or a train ride, not a flight.`);
      } else if (km <= 1000) score += 2;
      else {
        score -= 4;
        caveats.push(`${Math.round(km)} km away — you would want to fly.`);
      }
    } else {
      score += 2;
    }

    // --- Effort.
    if (c.effort === prefs.effort) {
      score += 5;
      reasons.push(effortReason(prefs.effort));
    } else if (
      (prefs.effort === 'easy' && c.effort === 'brutal') ||
      (prefs.effort === 'brutal' && c.effort === 'easy')
    ) {
      score -= 6;
      caveats.push(
        prefs.effort === 'easy'
          ? 'Harder than you asked for — there is real climbing here.'
          : 'Gentler than you asked for; you would have to make it hard yourself.',
      );
    }

    // --- The month they are going.
    if (prefs.month != null && c.months.size > 0) {
      if (c.months.has(prefs.month)) {
        score += 6;
        reasons.push(`${monthName(prefs.month)} is a good month for it.`);
      } else {
        score -= 9;
        caveats.push(`${monthName(prefs.month)} is out of season here — ${c.bestMonthsText}.`);
      }
    }

    return { c, score, reasons, caveats };
  });

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ c, score, reasons, caveats }) => ({
      id: c.id,
      name: c.name,
      where: c.where,
      category: c.category,
      categoryLabel: categoryLabel(c.category),
      color: categories.find((x) => x.id === c.category)?.color ?? '#dfa04a',
      summary: c.summary,
      href: c.href,
      score,
      reasons,
      caveats,
    }));
}

function categoryLabel(id: RideCategory) {
  return categories.find((c) => c.id === id)?.label ?? id;
}

function cravingReason(craving: Craving, c: Candidate) {
  switch (craving) {
    case 'mountains':
      return 'A proper mountain, which is what you came for.';
    case 'quiet':
      return 'Open, quiet roads where the only thing to beat is the wind.';
    case 'punchy':
      return 'Short, steep and relentless — exactly the kind of hills you asked for.';
    case 'trails':
      return 'Off the tarmac, which is where you said you wanted to be.';
    case 'goal':
      return 'A date on the calendar to train for.';
    default:
      return `${c.name} is worth the detour.`;
  }
}

function lengthReason(length: TripLength, c: Candidate) {
  switch (length) {
    case 'day':
      return 'Doable in a single day.';
    case 'weekend':
      return 'Fits a weekend without rushing.';
    case 'week':
      return c.minDays >= 5 ? `About ${c.minDays} days of riding — a week away.` : 'Plenty here to fill a week.';
    default:
      return c.minDays >= 5 ? `A long one: roughly ${c.minDays} days on the bike.` : 'Enough to keep going for as long as you like.';
  }
}

function effortReason(effort: Effort) {
  switch (effort) {
    case 'easy':
      return 'Steady rather than savage — you can enjoy the view.';
    case 'steady':
      return 'Enough climbing to feel it, not so much that it ruins the week.';
    default:
      return 'Genuinely hard. That is the point.';
  }
}
