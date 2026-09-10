import type { RouteSuggestion } from '../types/destination';

/**
 * Guide depth for the destinations, kept separate so content can grow without
 * touching the core data. Every field is optional.
 *
 * `photoQuery` is important: without it a place resolves to whatever generic
 * scenery Wikipedia leads with, which is rarely a cycling photo.
 */
export interface DestinationGuide {
  photoQuery?: string;
  /** An exact Commons file, pinned by hand when the search gets it wrong. */
  photoFile?: string;
  routes?: RouteSuggestion[];
  highlights?: string[];
  gettingThere?: string;
  basedIn?: string;
  refuel?: string;
}

export const destinationGuides: Record<string, DestinationGuide> = {
  'veluwe-gravel': {
    photoQuery: 'Veluwe fietsers bospad heide',
    basedIn: 'Otterlo sits in the middle of everything; Apeldoorn and Ede have better rail links.',
    gettingThere: 'Trains to Ede-Wageningen or Apeldoorn, then ride in — the forest starts almost immediately.',
    refuel: 'Pancake houses and forest cafés are frequent, but many close early and some shut on Mondays.',
    routes: [
      {
        name: 'Hoge Veluwe loop',
        distanceKm: 55,
        elevationM: 250,
        difficulty: 'easy',
        description: 'Through the national park on hard-packed tracks, past the Kröller-Müller museum and out over the open sand drifts.',
      },
      {
        name: 'Posbank & Rheden',
        distanceKm: 75,
        elevationM: 600,
        difficulty: 'moderate',
        description: 'The hilliest corner of the Veluwe, with heather slopes and the closest thing the Netherlands has to a mountain view.',
      },
      {
        name: 'Kootwijkerzand crossing',
        distanceKm: 90,
        elevationM: 400,
        difficulty: 'hard',
        description: 'Links the largest inland sand drift in western Europe with long forest sections — deep sand makes this far harder than the profile suggests.',
      },
    ],
    highlights: [
      'Kootwijkerzand, an actual desert in the middle of the Netherlands',
      'Red deer and wild boar at dawn on the heath',
      'The Kröller-Müller museum, reachable by bike from inside the park',
    ],
  },
  'crete-senesi': {
    photoQuery: 'Strade Bianche cyclists white gravel road',
    basedIn: 'Siena for restaurants and rail; Buonconvento or Asciano to be surrounded by the gravel.',
    gettingThere: 'Fly to Florence or Pisa, then train to Siena. A car is useful but not required.',
    refuel: 'Village bars in Asciano, Buonconvento and Montalcino; long empty stretches in between.',
    routes: [
      {
        name: 'Classic Strade Bianche sectors',
        distanceKm: 85,
        elevationM: 1500,
        difficulty: 'hard',
        description: 'Links the best-known white-road sectors south of Siena, including the brutal ramps of Colle Pinzuto.',
      },
      {
        name: 'Montalcino wine loop',
        distanceKm: 95,
        elevationM: 1700,
        difficulty: 'hard',
        description: 'South through the Val d\'Orcia to the hill town of Montalcino, mixing gravel with quiet tarmac and long views.',
      },
      {
        name: 'Asciano short loop',
        distanceKm: 50,
        elevationM: 800,
        difficulty: 'moderate',
        description: 'A half-day sampler of the bare clay hills, with the famous cypress avenues near San Quirico.',
      },
    ],
    highlights: [
      'The bare clay ridges of the Crete, unlike anywhere else in Tuscany',
      'Riding the actual Strade Bianche race sectors',
      'Hill towns as natural coffee stops: Montalcino, Pienza, San Quirico',
    ],
  },
  'girona-gravel': {
    photoQuery: 'cyclists road Girona Catalonia countryside',
    basedIn: 'Girona old town — most riders never need a car.',
    gettingThere: 'Fly to Girona or Barcelona; a fast train links Barcelona to Girona in under 40 minutes.',
    refuel: 'Cafés built around cycling in the old town, and village bars in every direction.',
    routes: [
      {
        name: 'Rocacorba',
        distanceKm: 60,
        elevationM: 1000,
        difficulty: 'hard',
        description: 'The local benchmark climb: a dead-end road up to the transmitters, used as a test piece by professionals for years.',
      },
      {
        name: 'Els Àngels & Sant Martí',
        distanceKm: 75,
        elevationM: 1200,
        difficulty: 'moderate',
        description: 'The classic loop east of the city, on quiet tarmac with a gravel option over the top.',
      },
      {
        name: 'Carrilet to the coast',
        distanceKm: 90,
        elevationM: 500,
        difficulty: 'easy',
        description: 'The traffic-free rail trail to Sant Feliu de Guíxols and back along the coast road — the gentlest big day here.',
      },
    ],
    highlights: [
      'A city where cycling is simply part of daily life',
      'Rocacorba, a climb with genuine professional history',
      'Sea, mountains and gravel all reachable from one base',
    ],
  },
  'ardennen-gravel': {
    photoQuery: 'Ardennes forest road valley Ourthe',
    basedIn: 'La Roche-en-Ardenne or Houffalize, both surrounded by forest tracks.',
    gettingThere: 'Trains reach Marloie or Libramont; the valleys are a short ride from either.',
    refuel: 'Small towns in the valleys, but the plateaus between them are genuinely empty.',
    routes: [
      {
        name: 'Ourthe valley loop',
        distanceKm: 70,
        elevationM: 1200,
        difficulty: 'moderate',
        description: 'Follows the river between steep wooded flanks, climbing out repeatedly onto the plateau and dropping back down.',
      },
      {
        name: 'RAVeL rail trail run',
        distanceKm: 85,
        elevationM: 500,
        difficulty: 'easy',
        description: 'Strings together converted railway lines for a long, flat, traffic-free day through the forest.',
      },
      {
        name: 'Ardennes classics on gravel',
        distanceKm: 100,
        elevationM: 1900,
        difficulty: 'hard',
        description: 'A hard mixed-surface day linking the forest tracks with famous tarmac climbs like the Redoute.',
      },
    ],
    highlights: [
      'Over a hundred kilometres of traffic-free converted railway',
      'Deep forest that feels far bigger than the map suggests',
      'Bastogne and the Ardennes war history along the way',
    ],
  },
  'black-forest-gravel': {
    photoQuery: 'Schwarzwald forest road panorama valley',
    basedIn: 'Freiburg for city comforts; Freudenstadt to be deeper in the forest.',
    gettingThere: 'Fast trains to Freiburg or Karlsruhe; regional lines run up into the valleys.',
    refuel: 'Forest inns are frequent but keep short hours — carry a reserve.',
    routes: [
      {
        name: 'Schauinsland from Freiburg',
        distanceKm: 55,
        elevationM: 1200,
        difficulty: 'moderate',
        description: 'The city\'s home climb, with a gravel forestry alternative to the tarmac road on the way back down.',
      },
      {
        name: 'Feldberg circuit',
        distanceKm: 95,
        elevationM: 2000,
        difficulty: 'hard',
        description: 'Around the highest point of the range on graded forestry roads, with long steady gradients throughout.',
      },
      {
        name: 'Kinzig valley trails',
        distanceKm: 70,
        elevationM: 1100,
        difficulty: 'moderate',
        description: 'Follows the valley floor before climbing into the forest on immaculate gravel service roads.',
      },
    ],
    highlights: [
      'Forestry roads maintained better than most countries\' tarmac',
      'Cool riding under canopy when the rest of Europe is baking',
      'Cuckoo clocks, cake and an unapologetically hearty food culture',
    ],
  },
  'zuid-limburg': {
    photoQuery: 'Cauberg Valkenburg wielrenners beklimming',
    basedIn: 'Valkenburg is the traditional base and sits at the foot of the Cauberg.',
    gettingThere: 'Direct trains to Maastricht and Valkenburg from across the Netherlands.',
    refuel: 'Cafés in every village; Valkenburg itself is built around visiting cyclists.',
    routes: [
      {
        name: 'Amstel Gold highlights',
        distanceKm: 100,
        elevationM: 1500,
        difficulty: 'hard',
        description: 'Links the Cauberg, Gulperberg, Eyserbosweg and Keutenberg into the classic Limburg day.',
      },
      {
        name: 'Geul valley loop',
        distanceKm: 60,
        elevationM: 800,
        difficulty: 'moderate',
        description: 'Follows the prettiest river valley in the country, with half-timbered villages and gentler climbs.',
      },
      {
        name: 'Three-country ride',
        distanceKm: 85,
        elevationM: 1200,
        difficulty: 'moderate',
        description: 'Out to the Vaalserberg where the Netherlands, Belgium and Germany meet — the highest point in the country.',
      },
    ],
    highlights: [
      'The Cauberg, the finish of the Amstel Gold Race',
      'The Keutenberg, over 20% at its steepest',
      'Three countries within a single morning',
    ],
  },
  'vlaamse-ardennen': {
    photoQuery: 'Oude Kwaremont kasseien wielrenners',
    basedIn: 'Oudenaarde, at the centre of the bergs and home to the Tour of Flanders centre.',
    gettingThere: 'Trains from Ghent and Brussels to Oudenaarde in well under an hour.',
    refuel: 'Cafés at the foot of most famous climbs — stopping at them is part of the tradition.',
    routes: [
      {
        name: 'The big three',
        distanceKm: 70,
        elevationM: 900,
        difficulty: 'moderate',
        description: 'Oude Kwaremont, Paterberg and Koppenberg in one compact loop from Oudenaarde.',
      },
      {
        name: 'Full Ronde route',
        distanceKm: 140,
        elevationM: 1800,
        difficulty: 'hard',
        description: 'The signposted Tour of Flanders route, taking in the majority of the race\'s cobbled hills.',
      },
      {
        name: 'Muur & Bosberg',
        distanceKm: 85,
        elevationM: 1000,
        difficulty: 'moderate',
        description: 'East towards Geraardsbergen for the Muur and Bosberg, the historic finale of the Ronde.',
      },
    ],
    highlights: [
      'The Koppenberg: 22% on cobbles, and mostly walked',
      'The Tour of Flanders centre in Oudenaarde',
      'Cobbles that feel like riding through the sport\'s history',
    ],
  },
  'peak-district': {
    photoQuery: 'Winnats Pass Peak District road',
    basedIn: 'Bakewell for the centre of the park; Hathersage or Buxton for quick access to the hills.',
    gettingThere: 'Trains from Manchester and Sheffield reach Buxton, Hope and Edale.',
    refuel: 'Village pubs and tearooms throughout — Bakewell puddings are non-negotiable.',
    routes: [
      {
        name: 'Winnats Pass loop',
        distanceKm: 60,
        elevationM: 1200,
        difficulty: 'hard',
        description: 'Through the limestone gorge of Winnats — steep, dramatic and the defining climb of the Peak.',
      },
      {
        name: 'Monsal Trail & dales',
        distanceKm: 55,
        elevationM: 600,
        difficulty: 'easy',
        description: 'The traffic-free former railway through lit tunnels, linked with quiet lanes through the dales.',
      },
      {
        name: 'Snake Pass & the moors',
        distanceKm: 95,
        elevationM: 1800,
        difficulty: 'hard',
        description: 'Long exposed moorland climbing over the Snake and Holme Moss, the toughest tarmac in the area.',
      },
    ],
    highlights: [
      'Winnats Pass, a road through a limestone cleft',
      'Tunnels on the Monsal Trail, lit and open to bikes',
      'Drystone walls and gritstone edges above the moors',
    ],
  },
  chianti: {
    photoQuery: 'Tuscany cypress road vineyard hills',
    basedIn: 'Greve in Chianti, halfway between Florence and Siena.',
    gettingThere: 'Fly to Florence; Greve is a short transfer south.',
    refuel: 'Village bars and enoteche everywhere — this is not a region where you go hungry.',
    routes: [
      {
        name: 'Chiantigiana ridge',
        distanceKm: 90,
        elevationM: 1700,
        difficulty: 'moderate',
        description: 'The classic ridge road between Florence and Siena, rolling through vineyards the entire way.',
      },
      {
        name: 'Castellina & Radda loop',
        distanceKm: 70,
        elevationM: 1400,
        difficulty: 'moderate',
        description: 'Links three hill towns on quiet back roads, with a gravel option between Radda and Volpaia.',
      },
      {
        name: 'Passo del Sugame',
        distanceKm: 60,
        elevationM: 1200,
        difficulty: 'hard',
        description: 'The hardest climb in the area, a steady haul out of the Greve valley to a quiet wooded summit.',
      },
    ],
    highlights: [
      'Cypress avenues and vineyard terraces on every ridge',
      'Hill towns spaced perfectly for coffee stops',
      'Gravel and tarmac interchangeable from the same base',
    ],
  },
  eifel: {
    photoQuery: 'Vulkaneifel Maar crater lake landscape road Eifel',
    basedIn: 'Monschau for the north, Daun for the volcanic lakes.',
    gettingThere: 'Trains to Aachen or Trier, then regional lines into the uplands.',
    refuel: 'Village bakeries and Gaststätten; Sundays can be quiet outside the towns.',
    routes: [
      {
        name: 'Maare lakes circuit',
        distanceKm: 75,
        elevationM: 1100,
        difficulty: 'moderate',
        description: 'Around the volcanic crater lakes near Daun, rolling constantly between water and forest.',
      },
      {
        name: 'Vennbahn rail trail',
        distanceKm: 125,
        elevationM: 700,
        difficulty: 'easy',
        description: 'Over 100 traffic-free kilometres on a converted railway from Aachen through Belgium into Luxembourg.',
      },
      {
        name: 'Nürburgring loop',
        distanceKm: 80,
        elevationM: 1400,
        difficulty: 'moderate',
        description: 'Around the circuit and through the surrounding hills; ride the Nordschleife itself on designated cycling days.',
      },
    ],
    highlights: [
      'Riding the Nürburgring Nordschleife on a bike',
      'Volcanic crater lakes you can swim in afterwards',
      'One of the longest rail trails in Europe',
    ],
  },
  zeeland: {
    photoQuery: 'Oosterscheldekering stormvloedkering Zeeland',
    basedIn: 'Middelburg or Zierikzee, both handsome old towns with good bases.',
    gettingThere: 'Trains to Middelburg and Vlissingen; the islands are linked by bridges and dams.',
    refuel: 'Beach pavilions and harbour cafés; the dikes themselves have nothing at all.',
    routes: [
      {
        name: 'Oosterschelde barrier crossing',
        distanceKm: 90,
        elevationM: 150,
        difficulty: 'moderate',
        description: 'Out along the storm surge barrier with the North Sea on one side and the estuary on the other.',
      },
      {
        name: 'Walcheren coastal loop',
        distanceKm: 65,
        elevationM: 120,
        difficulty: 'easy',
        description: 'Dunes, beach pavilions and the old towns of Domburg and Veere on a compact island circuit.',
      },
      {
        name: 'Delta Works tour',
        distanceKm: 120,
        elevationM: 200,
        difficulty: 'moderate',
        description: 'A long day linking several of the great dams — engineering as landscape, and a lot of exposure to the wind.',
      },
    ],
    highlights: [
      'The Delta Works, among the largest engineering projects on earth',
      'Skies that seem to take up three quarters of the view',
      'Seafood straight off the boat in the harbour towns',
    ],
  },
  texel: {
    photoQuery: 'Texel duinen fietspad De Slufter',
    basedIn: 'Den Burg, the island\'s main village and geographic centre.',
    gettingThere: 'Train to Den Helder, then the twenty-minute ferry — bikes travel as standard.',
    refuel: 'Beach pavilions on the west coast and cafés in every village.',
    routes: [
      {
        name: 'Island circuit',
        distanceKm: 60,
        elevationM: 100,
        difficulty: 'easy',
        description: 'The full loop: dunes and beach on the west, polder in the middle, mudflats and dikes on the east.',
      },
      {
        name: 'De Slufter & dunes',
        distanceKm: 35,
        elevationM: 80,
        difficulty: 'easy',
        description: 'Through the dune reserve to the salt marsh where the sea breaks through — the wildest corner of the island.',
      },
    ],
    highlights: [
      'De Slufter, a salt marsh open to the sea',
      'Enormous numbers of migrating birds in spring',
      'An island small enough to circle before lunch',
    ],
  },
  camargue: {
    photoQuery: 'Camargue flamingos lagoon horses',
    basedIn: 'Arles for food and history; Saintes-Maries for the sea.',
    gettingThere: 'TGV to Avignon or Nîmes, then a short train or ride to Arles.',
    refuel: 'Sparse in the delta itself — carry supplies once you leave the towns.',
    routes: [
      {
        name: 'Étang de Vaccarès loop',
        distanceKm: 80,
        elevationM: 80,
        difficulty: 'easy',
        description: 'Around the great central lagoon, with flamingos, salt pans and horses along the dike roads.',
      },
      {
        name: 'Salin-de-Giraud & the sea',
        distanceKm: 100,
        elevationM: 100,
        difficulty: 'moderate',
        description: 'South to the salt works and the mouth of the Rhône, crossing by the small ferry at Barcarin.',
      },
      {
        name: 'Alpilles escape',
        distanceKm: 95,
        elevationM: 1100,
        difficulty: 'moderate',
        description: 'North out of the flatland into the limestone Alpilles for a day with actual climbing.',
      },
    ],
    highlights: [
      'Flamingos in their thousands on the lagoons',
      'Semi-wild white horses and black bulls',
      'Roman Arles as a base, with the amphitheatre in the middle of town',
    ],
  },
  'west-jutland': {
    photoQuery: 'Hvide Sande dunes North Sea beach Denmark',
    basedIn: 'Ringkøbing or Hvide Sande, on either side of the fjord.',
    gettingThere: 'Danish trains reach Ringkøbing and Esbjerg and carry bikes readily.',
    refuel: 'Harbour smokehouses and village bakeries; distances between them can be long.',
    routes: [
      {
        name: 'Ringkøbing Fjord circuit',
        distanceKm: 110,
        elevationM: 250,
        difficulty: 'moderate',
        description: 'Around the shallow lagoon with the North Sea dunes on one side and farmland on the other.',
      },
      {
        name: 'Vestkystruten north',
        distanceKm: 90,
        elevationM: 300,
        difficulty: 'easy',
        description: 'A stretch of national route 1 along the coast, entirely signposted, with bunkers in the dunes.',
      },
    ],
    highlights: [
      'Wartime bunkers half-buried in the dunes',
      'Cold-water surf beaches at Hvide Sande and Klitmøller',
      'Signposting so thorough you barely need a map',
    ],
  },
  'ferrara-po': {
    photoQuery: 'Ferrara bicycles city walls street',
    basedIn: 'Ferrara itself — one of the most bike-friendly cities in Europe.',
    gettingThere: 'Ferrara is on the main line between Bologna and Venice.',
    refuel: 'Everything in Ferrara; in the delta, plan around the small villages.',
    routes: [
      {
        name: 'City walls loop',
        distanceKm: 9,
        elevationM: 20,
        difficulty: 'easy',
        description: 'A complete circuit of the Renaissance walls on top of the ramparts, entirely free of cars.',
      },
      {
        name: 'Po embankment to Comacchio',
        distanceKm: 95,
        elevationM: 60,
        difficulty: 'moderate',
        description: 'East along the river embankments to the lagoon town of Comacchio and its fishing huts.',
      },
      {
        name: 'Delta nature loop',
        distanceKm: 80,
        elevationM: 50,
        difficulty: 'easy',
        description: 'Through the Po Delta park, with birdlife, reed beds and almost no traffic at all.',
      },
    ],
    highlights: [
      'Cycling on top of complete Renaissance city walls',
      'A city where bicycles genuinely outnumber cars',
      'The Po Delta, one of Italy\'s great wetlands',
    ],
  },
  'finale-ligure': {
    photoQuery: 'Finale Ligure coast cliffs Mediterranean',
    basedIn: 'Finalborgo, the old town, where the bike shops and shuttles gather.',
    gettingThere: 'Fly to Genoa or Nice; Finale is on the coastal railway line.',
    refuel: 'Bars and focaccerie in Finalborgo; nothing at all on the high trails.',
    routes: [
      {
        name: 'DH Men classic',
        distanceKm: 15,
        elevationM: 700,
        difficulty: 'hard',
        description: 'The best-known descent in Finale, rocky and technical from the plateau down towards the coast.',
      },
      {
        name: 'NATO road & Rollercoaster',
        distanceKm: 35,
        elevationM: 1100,
        difficulty: 'moderate',
        description: 'Climb the old military road, then descend the flowing Rollercoaster trail back to sea level.',
      },
      {
        name: 'Full shuttle day',
        distanceKm: 45,
        elevationM: 400,
        difficulty: 'moderate',
        description: 'Uplift to the plateau repeatedly and link four or five descents, finishing each one nearer the sea.',
      },
    ],
    highlights: [
      'Finishing a mountain descent on the beach',
      'Riding in shorts in February',
      'Finalborgo, a medieval old town given over to bikes',
    ],
  },
  morzine: {
    photoQuery: 'Portes du Soleil mountain bike trail summer',
    basedIn: 'Morzine for nightlife and lift access; Les Gets for gentler trails.',
    gettingThere: 'Fly to Geneva; Morzine is about ninety minutes by road.',
    refuel: 'Mountain restaurants at most lift stations, and plenty in the valley.',
    routes: [
      {
        name: 'Portes du Soleil tour',
        distanceKm: 40,
        elevationM: 300,
        difficulty: 'moderate',
        description: 'A full day using lifts to cross into Switzerland and back, linking descents in both countries.',
      },
      {
        name: 'Les Gets flow day',
        distanceKm: 25,
        elevationM: 200,
        difficulty: 'easy',
        description: 'Bermed, jump-lined flow trails that build confidence fast — the friendliest introduction to the area.',
      },
      {
        name: 'Pleney laps',
        distanceKm: 20,
        elevationM: 150,
        difficulty: 'hard',
        description: 'Steep, rooty World Cup-grade descending straight above Morzine, lap after lap.',
      },
    ],
    highlights: [
      'The largest linked bike park network in Europe',
      'Crossing into Switzerland by chairlift mid-ride',
      'A valley that turns over completely to bikes each summer',
    ],
  },
  houffalize: {
    photoQuery: 'Houffalize Ourthe valley forest Ardennes',
    basedIn: 'Houffalize itself, a small town built around the racing.',
    gettingThere: 'Train to Libramont or Gouvy, then a short transfer.',
    refuel: 'Cafés in town; the forest loops have nothing.',
    routes: [
      {
        name: 'World Cup circuit',
        distanceKm: 25,
        elevationM: 700,
        difficulty: 'hard',
        description: 'The permanent cross-country loop used for international racing, packed with short brutal climbs.',
      },
      {
        name: 'Ourthe valley trails',
        distanceKm: 45,
        elevationM: 1100,
        difficulty: 'moderate',
        description: 'Signed loops following the river and climbing repeatedly onto the wooded plateau above.',
      },
    ],
    highlights: [
      'Riding a genuine World Cup cross-country course',
      'Steep valleys packed into a very small area',
      'Gravel and road riding on the doorstep too',
    ],
  },
  livigno: {
    photoQuery: 'Livigno valley summer alpine meadow',
    basedIn: 'Livigno village, strung along the valley floor.',
    gettingThere: 'Fly to Milan or Innsbruck; the transfer is long but spectacular.',
    refuel: 'The valley is full of restaurants; mountain huts serve the higher trails.',
    routes: [
      {
        name: 'Mottolino bike park',
        distanceKm: 25,
        elevationM: 200,
        difficulty: 'moderate',
        description: 'Lift-served flow and technical descents on the eastern side of the valley.',
      },
      {
        name: 'Alta Via singletrack',
        distanceKm: 35,
        elevationM: 900,
        difficulty: 'hard',
        description: 'Natural high-alpine trail above the treeline, earned by pedalling rather than by lift.',
      },
      {
        name: 'Valley floor path',
        distanceKm: 30,
        elevationM: 150,
        difficulty: 'easy',
        description: 'A flat, easy path the length of the valley — perfect for recovery days and families.',
      },
    ],
    highlights: [
      'Altitude training at 1,800 m, used by athletes across many sports',
      'Duty-free shopping, which keeps the bike shops unusually cheap',
      'High trails above the treeline with enormous views',
    ],
  },
  winterberg: {
    photoQuery: 'Sauerland forest hills summer landscape',
    basedIn: 'Winterberg town, at the foot of the lifts.',
    gettingThere: 'Direct trains from Dortmund; an easy drive from the Netherlands and Belgium.',
    refuel: 'Everything in town and at the lift stations.',
    routes: [
      {
        name: 'Bike park day',
        distanceKm: 25,
        elevationM: 150,
        difficulty: 'moderate',
        description: 'Lift laps across graded lines, from beginner flow up to full downhill tracks.',
      },
      {
        name: 'Sauerland cross-country loop',
        distanceKm: 55,
        elevationM: 1200,
        difficulty: 'moderate',
        description: 'Marked trails out of the resort into the surrounding forest, pedalled rather than lifted.',
      },
    ],
    highlights: [
      'Well-built progression from beginner to expert lines',
      'Close enough for a weekend trip from the Low Countries',
      'A large marked trail network beyond the park itself',
    ],
  },
};
