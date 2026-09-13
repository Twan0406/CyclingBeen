/**
 * How a photo is judged. Shared by the build-time fetcher and the browser
 * fallback so the two can never drift apart — a picture rejected during the
 * build must stay rejected if it is ever looked up live.
 */

export function isPhoto(name: string) {
  return /\.(jpe?g)$/i.test(name); // skip svg/png maps, logos and diagrams
}

/**
 * Titles that are never a good photo of a place: maps, logos, coats of arms,
 * diagrams, monuments, bottles. Commons search matches text, so "Zeeland"
 * happily returns a map of the province — these have to be thrown out rather
 * than merely ranked down.
 */
export const REJECT = [
  /\b(map|maps|kaart|karte|carte|mapa|mappa|karta|kort)\b/,
  /\b(locator|location map|topograph\w*|relief|atlas|itinerar\w*|mapping)\b/,
  /\b(logo|icon|symbol|emblem|seal|badge|pictogram)\b/,
  /coat of arms|wapen van|blason|wappen/,
  /\b(flag|vlag|drapeau|flagge)\b/,
  /\b(diagram|chart|graph|scheme|schema|plattegrond|grundriss)\b/,
  /\b(poster|banner|leaflet|cover|stamp|postzegel|coin|munt)\b/,
  /\b(signpost|wegwijzer|signage|nameplate|plaque|wegweiser)\b/,
  /\b(portrait|headshot|bust|statue|sculpture|monument|memorial)\b/,
  /\b(mural|fresco|shrine|altar|chapel interior|interior|museum)\b/,
  /\b(bottle|fiasco|wine|glass|vineyard bottle|cheese|dish|recipe)\b/,
  /\b(profile|elevation profile|hoogteprofiel)\b/,
];

/** Words that suggest the photo actually shows riding. */
export const CYCLING =
  /bicycl|bike|biking|cycling|cyclist|peloton|fiets|wielren|radfahr|radweg|vélo|velo|mtb|gravel|randonneur/;
/** Words that suggest an appealing outdoor scene. */
export const SCENIC =
  /landscape|panorama|view|vista|road|route|trail|path|pass|col|hairpin|mountain|coast|beach|dune|forest|valley|lake|vineyard|cobbl/;
/** Wrong season for most of these destinations. */
export const WINTER = /\b(snow|winter|ski|skiing|schnee|neige|sneeuw|piste)\b/;

/** Reject on the filename alone — used where only a URL comes back. */
export function fileLooksWrong(name: string): boolean {
  const n = decodeURIComponent(name).toLowerCase().replace(/_/g, ' ');
  if (!isPhoto(n)) return true;
  return REJECT.some((r) => r.test(n));
}

export interface Candidate {
  title: string;
  index: number;
  thumburl: string;
  mime?: string;
  width?: number;
  height?: number;
}

/** null means "not usable at all"; otherwise higher is better. */
export function scoreCandidate(c: Candidate): number | null {
  const title = c.title.toLowerCase();
  if (REJECT.some((r) => r.test(title))) return null;
  if (c.mime && c.mime !== 'image/jpeg' && !/\.jpe?g$/i.test(c.title)) return null;
  if (c.width && c.width < 640) return null;

  const ratio = c.width && c.height ? c.width / c.height : 1.5;
  if (ratio < 1.1 || ratio > 2.8) return null; // crops badly in a card

  let score = 0;
  if (CYCLING.test(title)) score += 6;
  if (SCENIC.test(title)) score += 2;
  if (WINTER.test(title)) score -= 3;
  if (c.width && c.width >= 1600) score += 1;
  if (ratio >= 1.3 && ratio <= 2.1) score += 1;
  // Commons' own relevance still counts, but only as a tie-breaker.
  score -= c.index * 0.05;
  return score;
}

/**
 * A stable URL for a Commons file at any width. One redirect, no API call —
 * which is why the build stores file names rather than thumbnail URLs.
 */
export function commonsFileUrl(file: string, width: number) {
  const name = file.replace(/^File:/i, '').replace(/ /g, '_');
  return `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(name)}?width=${width}`;
}
