/**
 * Editorial ride guides, kept separate from the core climb data so content can
 * grow independently. Every field is optional: climbs without an entry still
 * get a useful guide from the values derived in `lib/climbGuide.ts`.
 *
 * Keep tips practical and durable — things that stay true for years. Avoid
 * opening hours, prices and anything that quietly goes stale.
 */
export interface ClimbGuide {
  startTown?: string;
  bestMonths?: string;
  tips?: string[];
  /** Curated YouTube video id; without one the page links to a search. */
  videoId?: string;
}

export const climbGuides: Record<string, ClimbGuide> = {
  'mont-ventoux': {
    startTown: 'Bédoin (the classic side)',
    tips: [
      'Three roads reach the summit: Bédoin is the famous one, Malaucène is a touch shorter and steeper in places, Sault is the gentlest.',
      'The forest section after Saint-Estève is relentless — it barely drops below 9% for ten kilometres. Settle into a rhythm early.',
      'Above Chalet Reynard the trees stop and so does the shade. On a hot day, start at dawn.',
      'The summit is one of the windiest places in France; the road closes when the mistral is up. Check before you commit.',
      'Carry more water than feels sensible. Chalet Reynard is the last reliable stop before the top.',
    ],
  },
  'alpe-dhuez': {
    startTown: "Bourg d'Oisans",
    tips: [
      'The 21 hairpins count down from 21 at the bottom to 1 at the top, each named after a stage winner.',
      'The opening ramps out of Bourg d\'Oisans are the steepest of the whole climb — go easier than feels right for the first two kilometres.',
      'Bend 7 is Dutch Corner, painted orange and rowdy whenever the Tour visits.',
      'The road stays open year-round because it serves the ski resort, so this is a rare Alpine climb you can ride outside summer.',
    ],
  },
  'col-du-galibier': {
    startTown: 'Valloire (north) or Col du Lautaret (south)',
    tips: [
      'Usually snowbound until late May or June — check the pass status before travelling.',
      'From the south you climb the Lautaret first, so the Galibier proper is only the final eight kilometres.',
      'The last two kilometres are the hardest, and at 2,642 m the air is noticeably thinner.',
      'Take a jacket even in August: the descent off the top is long and cold.',
    ],
  },
  'stelvio-pass': {
    startTown: 'Prato allo Stelvio (48 hairpins) or Bormio',
    tips: [
      'The Prato side is the postcard: 48 numbered hairpins stacked up the mountain.',
      'Generally open from late spring to October; snow can close it at either end of the season.',
      'It is cold at the top whatever the forecast says in the valley — pack a windproof layer.',
      'Motorbikes love this pass. Hold your line and expect company on the hairpins.',
    ],
  },
  'col-du-tourmalet': {
    startTown: 'Luz-Saint-Sauveur (west) or Sainte-Marie-de-Campan (east)',
    tips: [
      'The most-used climb in Tour history — both sides are genuine HC ascents.',
      'The east side ramps up hard after La Mongie ski station; the west side is more consistent.',
      'The Géant du Tourmalet statue at the summit is the photo everyone takes home.',
      'Weather here turns fast, and the col sits above the treeline. Do not set off without a layer.',
    ],
  },
  'sa-calobra': {
    startTown: 'Coll dels Reis (you descend it first, then climb back)',
    bestMonths: 'Year-round — Mallorca is a winter training classic',
    tips: [
      'It is a dead end: you ride down to the sea, then climb the same road back out. There is no other way home.',
      'The gradient is famously steady, which makes it a favourite for testing pacing and power.',
      'The "tie knot" — a hairpin that loops under itself — sits near the top.',
      'Tour coaches use this road all day. Ride it early to have the hairpins to yourself.',
    ],
  },
  'angliru': {
    startTown: 'La Vega / Riosa',
    tips: [
      'One of the hardest paved climbs in professional cycling; the difficulty is all in the second half.',
      'Cueña les Cabres touches roughly 23% — bring the lowest gear you own and then some.',
      'The first six kilometres are deceptively gentle. Do not spend anything there.',
      'Asturian weather is often wet and misty, which makes the steep, narrow descent genuinely serious.',
    ],
  },
  'zoncolan': {
    startTown: 'Ovaro (the brutal side) or Sutrio (the gentler one)',
    tips: [
      'From Ovaro this is arguably the steepest sustained climb used by the Giro — long stretches around 15%.',
      'A 34×34 is a sensible minimum; plenty of strong riders go lower.',
      'The road is narrow with tunnels near the top; a rear light helps.',
      'From Sutrio the same summit is a far more forgiving ride if Ovaro looks too much.',
    ],
  },
  'mortirolo': {
    startTown: 'Mazzo di Valtellina',
    tips: [
      'The Mazzo side is the legendary one, and the gradient rarely relents once the trees close in.',
      'The Pantani monument sits partway up, at the hairpin where his 1994 attack is remembered.',
      'It is a narrow farm road — surface and traffic are both unpredictable.',
      'Pair it with the Gavia or the Stelvio for one of the hardest days in the Alps.',
    ],
  },
  'grossglockner': {
    startTown: 'Bruck (north) or Heiligenblut (south)',
    tips: [
      'This is a toll road: cyclists are currently admitted free, but the road has opening hours and a season.',
      'Normally open from around May to October; it closes overnight and in winter.',
      'The Edelweißspitze spur is a short, steep, cobbled detour to the highest viewpoint.',
      'High and exposed — Alpine weather can arrive in minutes.',
    ],
  },
  'mount-teide': {
    startTown: 'Sea level — El Médano, Puerto de la Cruz or Los Cristianos',
    bestMonths: 'Year-round, and a favourite winter training base',
    tips: [
      'One of the longest continuous ascents in the world: you can climb from the sea to over 2,000 m without a single descent.',
      'Pros base winter training camps here; expect to be passed by someone very fast.',
      'The volcanic plateau is exposed and the wind can be fierce, especially in the afternoon.',
      'Take everything you need — services thin out badly once you are above the tree line.',
    ],
  },
  'muur-van-geraardsbergen': {
    startTown: 'Geraardsbergen town centre',
    bestMonths: 'Year-round — the Flemish classics season peaks in spring',
    tips: [
      'Short, cobbled and vicious: the difficulty is the surface and the pitch, not the length.',
      'The steepest cobbles come near the chapel at the top.',
      'Wet cobbles are genuinely slippery. Stay seated and keep your weight back.',
      'Ride it in a loop with the Bosberg for the classic Flanders finish.',
    ],
  },
  'oude-kwaremont': {
    startTown: 'Kluisbergen',
    bestMonths: 'Year-round — best in the spring classics season',
    tips: [
      'The long cobbled drag through the village is the hardest part, and it comes after the pitch eases.',
      'Momentum is everything: hit the cobbles with speed and pick the crown of the road.',
      'A cornerstone of the Tour of Flanders, ridden multiple times in a single race.',
    ],
  },
  'cauberg': {
    startTown: 'Valkenburg aan de Geul',
    bestMonths: 'Year-round',
    tips: [
      'Short and sharp — this is a climb you attack rather than pace.',
      'The steepest section is in the middle, before the road opens out towards the top.',
      'The Amstel Gold Race made it famous, and the Limburg lanes around it make a fine day out.',
    ],
  },
  'passo-gavia': {
    startTown: 'Ponte di Legno (south) or Bormio (north)',
    tips: [
      'Narrow, wild and high — the Gavia feels more remote than its neighbours.',
      'Remembered for the 1988 Giro blizzard; snow walls can line the road well into summer.',
      'There is a tunnel near the top: lights are strongly recommended.',
      'Rifugio Bonetta at the summit is the traditional place to stop.',
    ],
  },
};
