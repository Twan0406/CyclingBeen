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
  /\b(signpost|wegwijzer|signage|nameplate|plaque|wegweiser|panneau|panneaux|segnali|segnale|cartel)\b/,
  // Street furniture and objects that happen to stand in the view.
  /\b(bench|benches|banc|bank|picknick|picnic table|fountain|letterbox)\b/,
  // Wartime leftovers: mines, gun positions, bunkers, chains as art.
  /\b(mine|mines|stellung|gipfelstellung|bunker|kette|chain|wreck)\b/,
  /\b(rescue|ambulance|helicopter|helikopter)\b/,
  // Historical atlases, which are maps that never say "map".
  /\b(diercke|atlas|bodenverhaeltnisse|bodenverhältnisse)\b/,
  /notre.?dame|sacr[ée].?c[oœ]ur/,
  /\b(portrait|headshot|bust|statue|sculpture|monument|memorial)\b/,
  /\b(mural|fresco|shrine|altar|chapel interior|interior|museum)\b/,
  /\b(bottle|fiasco|wine|glass|vineyard bottle|cheese|dish|recipe)\b/,
  /\b(profile|profil|elevation profile|hoogteprofiel|hohenprofil)\b/,
  // Seen from orbit or from a plane: technically the place, useless as a photo.
  /\biss0|\bsts-\d|view of earth|satellite|aerial view overhead/,
  // A machine in front of the scenery, not the scenery.
  /\b(car|cars|vehicle|automobile|lorry|truck|bus|tram|train|locomotive|aircraft|spitfire)\b/,
  // Reproductions of printed matter rather than photographs of the place.
  /\b(postcard|carte postale|cartes postales|engraving|lithograph|painting|drawing|book|brochure)\b/,
  // Press clippings and albums rather than a photograph of the place.
  /\b(recueil|collection|album|scrapbook|clipping|journal)\b/,
  // Buildings that happen to stand there. A guide is about the riding.
  /\b(church|chapel|cathedral|abbey|basilica|collegiata|duomo|kerk|kirche|église|iglesia|chiesa|organ|hospiz|hospice)\b/,
];

/**
 * There is no score threshold, and there must not be one: relevance is decided
 * by isRelevant, and the number that comes back only orders the survivors. A
 * threshold of 0 quietly rejected every photo whose sole claim was naming the
 * place — "ColduGlandon.jpg" scores 0 and then loses 0.05 for its position in
 * the list — which is how 33 of the 49 climbs ended up with no photo at all.
 */

/** Words that suggest the photo actually shows riding. */
export const CYCLING =
  /bicycl|bike|biking|cycling|cyclist|peloton|fiets|wielren|radfahr|radweg|vélo|velo|mtb|gravel|randonneur|kassei|cobble|pavé/;

/**
 * Terrain words that are short enough to appear inside unrelated names, so they
 * only count as whole words. Without this, "col" matched Emily *Col*lins and
 * *Col*legiata, and a bare "see" matches half of English.
 */
const SCENIC_EXACT = new RegExp(
  '\\b(?:' +
    [
      'col|cols|pass|passo|puerto|alto|port|top|summit|ridge|moor|heath|fell',
      'road|roads|route|trail|path|track|lane|way|weg|dijk|dike',
      'view|views|vista|lake|loch|see|sjö|river|glen|dale|tal|val|valle',
      'berg|bergen|hill|hills|heuvel|monte|mont|puig|sierra|alpe|alpen',
      'bos|wood|woods|forest|skog|wald|field|fields|polder|heide',
      'coast|kust|côte|beach|strand|playa|dune|duin|duinen|cliff|fjord',
    ].join('|') +
    ')\\b',
  'i',
);

/**
 * Longer terrain words, matched as stems so plurals and compounds count —
 * "landschaft", "bergstraße", "hairpins", "vineyards".
 */
const SCENIC_STEM = new RegExp(
  [
    'landscape|landschap|landschaft|landskap|paysage|paesaggio|panorama|scenery',
    'hairpin|lacet|serpentin|switchback|kasseiweg|cobbl|pavé|pave',
    'mountain|montagne|montagna|gebirge|hochalpen|massif',
    'vallée|valley|vineyard|orchard|windmill|watermill|meadow|moorland',
    'uitzicht|aussicht|panoramablick|backar|chemin|sentiero|carretera|strada|straße|strasse',
    'wattenmeer|waddenzee|nationalpark|national park',
  ].join('|'),
  'i',
);

/** Words that suggest an appealing outdoor scene, in whatever language. */
export const SCENIC = {
  test: (t: string) => SCENIC_EXACT.test(t) || SCENIC_STEM.test(t),
};

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
  /** The place this photo is meant to show, used to judge relevance. */
  subject?: string;
  mime?: string;
  width?: number;
  height?: number;
}

/** Lowercase, unaccented, letters only — so "ColduGlandon" and "Col du Glandon" match. */
function squash(text: string) {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z]/g, '');
}

/**
 * Does the title name the subject? The strongest signal there is, and one no
 * word list can replace: "ColduGlandon.jpg" has no spaces and no terrain word,
 * but it is unmistakably a photo of the Col du Glandon.
 */
export function namesSubject(title: string, subject: string): boolean {
  const haystack = squash(title);
  const words = subject
    .split(/[\s—–-]+/)
    .map(squash)
    .filter((w) => w.length >= 4);
  return words.some((w) => haystack.includes(w));
}

/**
 * Does the title say this is a picture of the place, or of somewhere you would
 * ride?
 *
 * Kept separate from the score on purpose. Mixing the two was the bug: a file
 * whose title said nothing at all could still clear the bar on the strength of
 * its resolution and aspect ratio, which is how a BMW motorbike and a Polish
 * polder got in, while a photo of the Muur van Geraardsbergen was dropped for
 * being 1200px wide.
 */
export function isRelevant(title: string, subject?: string): boolean {
  const t = title.toLowerCase();
  if (CYCLING.test(t) || SCENIC.test(t)) return true;
  return subject ? namesSubject(title, subject) : false;
}

/** null means "not usable at all"; otherwise higher is better. */
export function scoreCandidate(c: Candidate): number | null {
  const title = c.title.toLowerCase();
  if (REJECT.some((r) => r.test(title))) return null;
  if (!isRelevant(title, c.subject)) return null;
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
