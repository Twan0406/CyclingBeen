import type { Climb } from '../types/climb';
import { distanceKm } from './polyline';

/**
 * Guidance derived from the climb's own data, so every climb gets a usable
 * guide without hand-written content. An explicit `bestMonths` always wins.
 */
export function seasonFor(climb: Climb): string {
  if (climb.bestMonths) return climb.bestMonths;
  const lat = Math.abs(climb.lat);
  if (lat < 33) return 'Year-round — only the summit turns cold in winter';
  if (climb.elevationM >= 2000) return 'Late June – September — snow closes the pass in winter';
  if (climb.elevationM >= 1500) return 'May – October';
  if (climb.elevationM >= 800) return 'April – October';
  if (lat < 42) return 'Year-round, at its best March – November';
  return 'March – November';
}

/** A rough gearing hint — steeper and longer asks for an easier bottom gear. */
export function gearingFor(climb: Climb): string {
  if (climb.avgGradientPct >= 10) return 'Go easy: 34×34 or lower. Ramps here punish big gears.';
  if (climb.avgGradientPct >= 8) return 'A compact with a 32-tooth sprocket is the comfortable choice.';
  if (climb.avgGradientPct >= 6) return 'A compact with 28–30 at the back is plenty for most riders.';
  return 'Nothing special needed — a standard compact handles this comfortably.';
}

/** Rough time a fit amateur needs, from length, gradient and a ~750 m/h VAM. */
export function estimatedAmateurMinutes(climb: Climb): number {
  const gain = climb.lengthKm * 1000 * (climb.avgGradientPct / 100);
  return Math.max(3, Math.round((gain / 750) * 60));
}

export interface NearbyClimb {
  climb: Climb;
  km: number;
}

/** Other climbs from the catalogue within `radiusKm`, nearest first. */
export function nearbyClimbs(climb: Climb, all: Climb[], radiusKm = 75, limit = 6): NearbyClimb[] {
  return all
    .filter((c) => c.id !== climb.id)
    .map((c) => ({ climb: c, km: distanceKm(climb.lat, climb.lng, c.lat, c.lng) }))
    .filter((n) => n.km <= radiusKm)
    .sort((a, b) => a.km - b.km)
    .slice(0, limit);
}

/** A YouTube search for on-bike footage — always valid, unlike a guessed id. */
export function videoSearchUrl(climb: Climb): string {
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(
    `cycling ${climb.name} climb`,
  )}`;
}
