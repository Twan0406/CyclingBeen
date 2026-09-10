import type { RouteWaypoint } from '../types/destination';

/**
 * The places each suggested route runs through, in order, keyed by destination
 * id and then by route name. These drive the GPX download.
 *
 * They are course outlines — the towns, cols, sectors and junctions that define
 * the ride — not recorded tracks. A planner snaps them onto roads. Bike-park
 * and shuttle days are deliberately absent: there is no road course to hand out.
 */
export const routeWaypoints: Record<string, Record<string, RouteWaypoint[]>> = {
  // ------------------------------------------------------------------ gravel
  'veluwe-gravel': {
    'Hoge Veluwe loop': [
      { name: 'Otterlo', lat: 52.0973, lng: 5.7714 },
      { name: 'Hoenderloo gate', lat: 52.1211, lng: 5.8556 },
      { name: 'Kröller-Müller Museum', lat: 52.0906, lng: 5.8172 },
      { name: 'Sand drifts', lat: 52.0742, lng: 5.8078 },
      { name: 'Deelen', lat: 52.0603, lng: 5.8783 },
      { name: 'Otterlo', lat: 52.0973, lng: 5.7714 },
    ],
    'Posbank & Rheden': [
      { name: 'Arnhem', lat: 51.9851, lng: 5.8987 },
      { name: 'Rozendaal', lat: 52.0075, lng: 5.9411 },
      { name: 'Posbank', lat: 52.0281, lng: 5.9861 },
      { name: 'Rheden', lat: 52.0044, lng: 6.0242 },
      { name: 'Dieren', lat: 52.0553, lng: 6.0975 },
      { name: 'Arnhem', lat: 51.9851, lng: 5.8987 },
    ],
    'Kootwijkerzand crossing': [
      { name: 'Kootwijk', lat: 52.1789, lng: 5.7686 },
      { name: 'Kootwijkerzand', lat: 52.1636, lng: 5.7508 },
      { name: 'Radio Kootwijk', lat: 52.1739, lng: 5.8103 },
      { name: 'Hoog Buurlo', lat: 52.1922, lng: 5.8489 },
      { name: 'Kootwijk', lat: 52.1789, lng: 5.7686 },
    ],
  },
  'crete-senesi': {
    'Classic Strade Bianche sectors': [
      { name: 'Siena', lat: 43.3188, lng: 11.3308 },
      { name: 'Vico d’Arbia', lat: 43.2825, lng: 11.4181 },
      { name: 'Asciano', lat: 43.2331, lng: 11.5606 },
      { name: 'San Giovanni d’Asso', lat: 43.1497, lng: 11.5919 },
      { name: 'Monteroni d’Arbia', lat: 43.2331, lng: 11.4225 },
      { name: 'Siena', lat: 43.3188, lng: 11.3308 },
    ],
    'Montalcino wine loop': [
      { name: 'Montalcino', lat: 43.0578, lng: 11.4894 },
      { name: 'Sant’Antimo', lat: 43.0064, lng: 11.5158 },
      { name: 'Torrenieri', lat: 43.0819, lng: 11.5453 },
      { name: 'San Quirico d’Orcia', lat: 43.0592, lng: 11.6053 },
      { name: 'Montalcino', lat: 43.0578, lng: 11.4894 },
    ],
    'Asciano short loop': [
      { name: 'Asciano', lat: 43.2331, lng: 11.5606 },
      { name: 'Chiusure', lat: 43.1731, lng: 11.5453 },
      { name: 'Monte Oliveto Maggiore', lat: 43.1706, lng: 11.5453 },
      { name: 'Asciano', lat: 43.2331, lng: 11.5606 },
    ],
  },
  'girona-gravel': {
    Rocacorba: [
      { name: 'Girona', lat: 41.9794, lng: 2.8214 },
      { name: 'Banyoles', lat: 42.1189, lng: 2.7664 },
      { name: 'Canet d’Adri', lat: 42.0483, lng: 2.7425 },
      { name: 'Rocacorba summit', lat: 42.0714, lng: 2.7086 },
      { name: 'Girona', lat: 41.9794, lng: 2.8214 },
    ],
    'Els Àngels & Sant Martí': [
      { name: 'Girona', lat: 41.9794, lng: 2.8214 },
      { name: 'Quart', lat: 41.9569, lng: 2.8511 },
      { name: 'Els Àngels', lat: 41.9678, lng: 2.9111 },
      { name: 'Sant Martí Vell', lat: 42.0122, lng: 2.9153 },
      { name: 'Girona', lat: 41.9794, lng: 2.8214 },
    ],
    'Carrilet to the coast': [
      { name: 'Girona', lat: 41.9794, lng: 2.8214 },
      { name: 'Cassà de la Selva', lat: 41.8894, lng: 2.8739 },
      { name: 'Llagostera', lat: 41.8283, lng: 2.8933 },
      { name: 'Sant Feliu de Guíxols', lat: 41.7803, lng: 3.0289 },
    ],
  },
  'ardennen-gravel': {
    'Ourthe valley loop': [
      { name: 'La Roche-en-Ardenne', lat: 50.1817, lng: 5.5756 },
      { name: 'Maboge', lat: 50.1394, lng: 5.5850 },
      { name: 'Nadrin', lat: 50.1503, lng: 5.6494 },
      { name: 'Houffalize', lat: 50.1306, lng: 5.7897 },
      { name: 'La Roche-en-Ardenne', lat: 50.1817, lng: 5.5756 },
    ],
    'RAVeL rail trail run': [
      { name: 'Trois-Ponts', lat: 50.3722, lng: 5.8722 },
      { name: 'Stavelot', lat: 50.3956, lng: 5.9333 },
      { name: 'Malmedy', lat: 50.4258, lng: 6.0281 },
      { name: 'Waimes', lat: 50.4147, lng: 6.1119 },
      { name: 'Bütgenbach', lat: 50.4269, lng: 6.2050 },
    ],
    'Ardennes classics on gravel': [
      { name: 'Aywaille', lat: 50.4747, lng: 5.6753 },
      { name: 'La Redoute', lat: 50.4869, lng: 5.6647 },
      { name: 'Remouchamps', lat: 50.4894, lng: 5.6928 },
      { name: 'Stoumont', lat: 50.4108, lng: 5.8017 },
      { name: 'Côte de La Roche-aux-Faucons', lat: 50.5386, lng: 5.5581 },
      { name: 'Aywaille', lat: 50.4747, lng: 5.6753 },
    ],
  },
  'black-forest-gravel': {
    'Schauinsland from Freiburg': [
      { name: 'Freiburg im Breisgau', lat: 47.9959, lng: 7.8522 },
      { name: 'Günterstal', lat: 47.9686, lng: 7.8419 },
      { name: 'Horben', lat: 47.9469, lng: 7.8503 },
      { name: 'Schauinsland summit', lat: 47.9139, lng: 7.8975 },
      { name: 'Kirchzarten', lat: 47.9556, lng: 7.9542 },
      { name: 'Freiburg im Breisgau', lat: 47.9959, lng: 7.8522 },
    ],
    'Feldberg circuit': [
      { name: 'Titisee', lat: 47.9047, lng: 8.1489 },
      { name: 'Feldberg Bärental', lat: 47.8778, lng: 8.1097 },
      { name: 'Feldberg Pass', lat: 47.8733, lng: 8.0264 },
      { name: 'Todtnau', lat: 47.8297, lng: 7.9436 },
      { name: 'Schluchsee', lat: 47.8156, lng: 8.1667 },
      { name: 'Titisee', lat: 47.9047, lng: 8.1489 },
    ],
    'Kinzig valley trails': [
      { name: 'Offenburg', lat: 48.4711, lng: 7.9447 },
      { name: 'Gengenbach', lat: 48.4044, lng: 8.0139 },
      { name: 'Haslach im Kinzigtal', lat: 48.2778, lng: 8.0917 },
      { name: 'Hausach', lat: 48.2833, lng: 8.1750 },
      { name: 'Schiltach', lat: 48.2894, lng: 8.3417 },
    ],
  },
  // ------------------------------------------------------------------- hills
  'zuid-limburg': {
    'Amstel Gold highlights': [
      { name: 'Valkenburg', lat: 50.8653, lng: 5.8306 },
      { name: 'Cauberg', lat: 50.8617, lng: 5.8261 },
      { name: 'Gulpen', lat: 50.8153, lng: 5.8892 },
      { name: 'Eyserbosweg', lat: 50.8072, lng: 5.9017 },
      { name: 'Keutenberg', lat: 50.8394, lng: 5.8069 },
      { name: 'Valkenburg', lat: 50.8653, lng: 5.8306 },
    ],
    'Geul valley loop': [
      { name: 'Valkenburg', lat: 50.8653, lng: 5.8306 },
      { name: 'Schin op Geul', lat: 50.8508, lng: 5.8506 },
      { name: 'Wijlre', lat: 50.8317, lng: 5.8767 },
      { name: 'Epen', lat: 50.7719, lng: 5.9331 },
      { name: 'Mechelen', lat: 50.7897, lng: 5.9269 },
      { name: 'Valkenburg', lat: 50.8653, lng: 5.8306 },
    ],
    'Three-country ride': [
      { name: 'Vaals', lat: 50.7714, lng: 6.0189 },
      { name: 'Drielandenpunt', lat: 50.7539, lng: 6.0208 },
      { name: 'Gemmenich', lat: 50.7292, lng: 6.0169 },
      { name: 'Aachen', lat: 50.7753, lng: 6.0839 },
      { name: 'Vaals', lat: 50.7714, lng: 6.0189 },
    ],
  },
  'vlaamse-ardennen': {
    'The big three': [
      { name: 'Oudenaarde', lat: 50.8494, lng: 3.6086 },
      { name: 'Oude Kwaremont', lat: 50.7739, lng: 3.5106 },
      { name: 'Paterberg', lat: 50.7683, lng: 3.5286 },
      { name: 'Koppenberg', lat: 50.8000, lng: 3.5717 },
      { name: 'Oudenaarde', lat: 50.8494, lng: 3.6086 },
    ],
    'Full Ronde route': [
      { name: 'Oudenaarde', lat: 50.8494, lng: 3.6086 },
      { name: 'Molenberg', lat: 50.8631, lng: 3.9142 },
      { name: 'Koppenberg', lat: 50.8000, lng: 3.5717 },
      { name: 'Oude Kwaremont', lat: 50.7739, lng: 3.5106 },
      { name: 'Paterberg', lat: 50.7683, lng: 3.5286 },
      { name: 'Oudenaarde', lat: 50.8494, lng: 3.6086 },
    ],
    'Muur & Bosberg': [
      { name: 'Geraardsbergen', lat: 50.7728, lng: 3.8781 },
      { name: 'Muur van Geraardsbergen', lat: 50.7758, lng: 3.8828 },
      { name: 'Bosberg', lat: 50.7817, lng: 3.9231 },
      { name: 'Geraardsbergen', lat: 50.7728, lng: 3.8781 },
    ],
  },

  'peak-district': {
    'Winnats Pass loop': [
      { name: 'Castleton', lat: 53.3428, lng: -1.7772 },
      { name: 'Winnats Pass', lat: 53.3381, lng: -1.7906 },
      { name: 'Mam Nick', lat: 53.3494, lng: -1.8106 },
      { name: 'Edale', lat: 53.3661, lng: -1.8161 },
      { name: 'Hope', lat: 53.3475, lng: -1.7439 },
      { name: 'Castleton', lat: 53.3428, lng: -1.7772 },
    ],
    'Monsal Trail & dales': [
      { name: 'Bakewell', lat: 53.2131, lng: -1.6753 },
      { name: 'Monsal Head', lat: 53.2447, lng: -1.7169 },
      { name: 'Millers Dale', lat: 53.2586, lng: -1.7889 },
      { name: 'Tideswell', lat: 53.2786, lng: -1.7728 },
      { name: 'Ashford in the Water', lat: 53.2258, lng: -1.7089 },
      { name: 'Bakewell', lat: 53.2131, lng: -1.6753 },
    ],
    'Snake Pass & the moors': [
      { name: 'Glossop', lat: 53.4436, lng: -1.9494 },
      { name: 'Snake Pass summit', lat: 53.4308, lng: -1.8600 },
      { name: 'Ladybower Reservoir', lat: 53.3900, lng: -1.7000 },
      { name: 'Hope', lat: 53.3475, lng: -1.7439 },
      { name: 'Mam Nick', lat: 53.3494, lng: -1.8106 },
      { name: 'Glossop', lat: 53.4436, lng: -1.9494 },
    ],
  },
  chianti: {
    'Chiantigiana ridge': [
      { name: 'Greve in Chianti', lat: 43.5847, lng: 11.3167 },
      { name: 'Panzano in Chianti', lat: 43.5439, lng: 11.3125 },
      { name: 'Castellina in Chianti', lat: 43.4692, lng: 11.2839 },
      { name: 'Radda in Chianti', lat: 43.4842, lng: 11.3767 },
      { name: 'Greve in Chianti', lat: 43.5847, lng: 11.3167 },
    ],
    'Castellina & Radda loop': [
      { name: 'Castellina in Chianti', lat: 43.4692, lng: 11.2839 },
      { name: 'Radda in Chianti', lat: 43.4842, lng: 11.3767 },
      { name: 'Gaiole in Chianti', lat: 43.4675, lng: 11.4331 },
      { name: 'Castellina in Chianti', lat: 43.4692, lng: 11.2839 },
    ],
    'Passo del Sugame': [
      { name: 'Greve in Chianti', lat: 43.5847, lng: 11.3167 },
      { name: 'Passo del Sugame', lat: 43.5361, lng: 11.2367 },
      { name: 'Figline Valdarno', lat: 43.6206, lng: 11.4708 },
      { name: 'Greve in Chianti', lat: 43.5847, lng: 11.3167 },
    ],
  },
  eifel: {
    'Maare lakes circuit': [
      { name: 'Daun', lat: 50.1958, lng: 6.8306 },
      { name: 'Gemündener Maar', lat: 50.1817, lng: 6.8300 },
      { name: 'Weinfelder Maar', lat: 50.1747, lng: 6.8467 },
      { name: 'Schalkenmehren', lat: 50.1706, lng: 6.8556 },
      { name: 'Manderscheid', lat: 50.0956, lng: 6.8106 },
      { name: 'Daun', lat: 50.1958, lng: 6.8306 },
    ],
    'Vennbahn rail trail': [
      { name: 'Monschau', lat: 50.5556, lng: 6.2417 },
      { name: 'Kalterherberg', lat: 50.5156, lng: 6.2264 },
      { name: 'Sankt Vith', lat: 50.2806, lng: 6.1264 },
      { name: 'Burg-Reuland', lat: 50.1875, lng: 6.1281 },
      { name: 'Troisvierges', lat: 50.1214, lng: 6.0000 },
    ],
    'Nürburgring loop': [
      { name: 'Nürburg', lat: 50.3356, lng: 6.9436 },
      { name: 'Adenau', lat: 50.3625, lng: 6.9394 },
      { name: 'Altenahr', lat: 50.5142, lng: 6.9917 },
      { name: 'Kelberg', lat: 50.2925, lng: 6.9192 },
      { name: 'Nürburg', lat: 50.3356, lng: 6.9436 },
    ],
  },
  zeeland: {
    'Oosterschelde barrier crossing': [
      { name: 'Burgh-Haamstede', lat: 51.6958, lng: 3.7431 },
      { name: 'Oosterscheldekering', lat: 51.6236, lng: 3.6833 },
      { name: 'Vrouwenpolder', lat: 51.5931, lng: 3.5750 },
      { name: 'Veere', lat: 51.5478, lng: 3.6667 },
      { name: 'Zierikzee', lat: 51.6503, lng: 3.9139 },
    ],
    'Walcheren coastal loop': [
      { name: 'Middelburg', lat: 51.4989, lng: 3.6108 },
      { name: 'Domburg', lat: 51.5644, lng: 3.4964 },
      { name: 'Westkapelle', lat: 51.5269, lng: 3.4400 },
      { name: 'Zoutelande', lat: 51.5000, lng: 3.4806 },
      { name: 'Vlissingen', lat: 51.4425, lng: 3.5736 },
      { name: 'Middelburg', lat: 51.4989, lng: 3.6108 },
    ],
    'Delta Works tour': [
      { name: 'Vlissingen', lat: 51.4425, lng: 3.5736 },
      { name: 'Veerse Gatdam', lat: 51.5606, lng: 3.5650 },
      { name: 'Oosterscheldekering', lat: 51.6236, lng: 3.6833 },
      { name: 'Brouwersdam', lat: 51.7444, lng: 3.8306 },
      { name: 'Haringvlietdam', lat: 51.8317, lng: 4.0231 },
    ],
  },
  texel: {
    'Island circuit': [
      { name: 'Den Burg', lat: 53.0553, lng: 4.7961 },
      { name: 'De Cocksdorp', lat: 53.1517, lng: 4.8778 },
      { name: 'De Slufter', lat: 53.1064, lng: 4.7511 },
      { name: 'De Koog', lat: 53.1058, lng: 4.7583 },
      { name: 'Den Hoorn', lat: 53.0203, lng: 4.7481 },
      { name: 'Den Burg', lat: 53.0553, lng: 4.7961 },
    ],
    'De Slufter & dunes': [
      { name: 'De Koog', lat: 53.1058, lng: 4.7583 },
      { name: 'De Slufter', lat: 53.1064, lng: 4.7511 },
      { name: 'Eierland lighthouse', lat: 53.1817, lng: 4.8547 },
      { name: 'De Cocksdorp', lat: 53.1517, lng: 4.8778 },
      { name: 'De Koog', lat: 53.1058, lng: 4.7583 },
    ],
  },
  camargue: {
    'Étang de Vaccarès loop': [
      { name: 'Arles', lat: 43.6768, lng: 4.6277 },
      { name: 'Villeneuve', lat: 43.5628, lng: 4.5308 },
      { name: 'Méjanes', lat: 43.5375, lng: 4.5222 },
      { name: 'Salin-de-Badon', lat: 43.4869, lng: 4.5539 },
      { name: 'Arles', lat: 43.6768, lng: 4.6277 },
    ],
    'Salin-de-Giraud & the sea': [
      { name: 'Arles', lat: 43.6768, lng: 4.6277 },
      { name: 'Salin-de-Giraud', lat: 43.3981, lng: 4.7275 },
      { name: 'Plage de Piémanson', lat: 43.3444, lng: 4.7833 },
      { name: 'Arles', lat: 43.6768, lng: 4.6277 },
    ],
    'Alpilles escape': [
      { name: 'Arles', lat: 43.6768, lng: 4.6277 },
      { name: 'Fontvieille', lat: 43.7269, lng: 4.7106 },
      { name: 'Les Baux-de-Provence', lat: 43.7444, lng: 4.7953 },
      { name: 'Saint-Rémy-de-Provence', lat: 43.7886, lng: 4.8317 },
      { name: 'Arles', lat: 43.6768, lng: 4.6277 },
    ],
  },
  'west-jutland': {
    'Ringkøbing Fjord circuit': [
      { name: 'Ringkøbing', lat: 56.0900, lng: 8.2444 },
      { name: 'Søndervig', lat: 56.0908, lng: 8.1181 },
      { name: 'Hvide Sande', lat: 55.9994, lng: 8.1258 },
      { name: 'Bork Havn', lat: 55.8567, lng: 8.2669 },
      { name: 'Skjern', lat: 55.9481, lng: 8.4972 },
      { name: 'Ringkøbing', lat: 56.0900, lng: 8.2444 },
    ],
    'Vestkystruten north': [
      { name: 'Hvide Sande', lat: 55.9994, lng: 8.1258 },
      { name: 'Søndervig', lat: 56.0908, lng: 8.1181 },
      { name: 'Thorsminde', lat: 56.3733, lng: 8.1183 },
      { name: 'Lemvig', lat: 56.5486, lng: 8.3103 },
      { name: 'Thyborøn', lat: 56.6958, lng: 8.2119 },
    ],
  },
  'ferrara-po': {
    'City walls loop': [
      { name: 'Ferrara', lat: 44.8358, lng: 11.6197 },
      { name: 'Porta Po', lat: 44.8419, lng: 11.6031 },
      { name: 'Punta della Montagna', lat: 44.8281, lng: 11.6394 },
      { name: 'Ferrara', lat: 44.8358, lng: 11.6197 },
    ],
    'Po embankment to Comacchio': [
      { name: 'Ferrara', lat: 44.8358, lng: 11.6197 },
      { name: 'Ostellato', lat: 44.7439, lng: 11.9403 },
      { name: 'Comacchio', lat: 44.6942, lng: 12.1839 },
      { name: 'Lido di Spina', lat: 44.6394, lng: 12.2381 },
    ],
    'Delta nature loop': [
      { name: 'Comacchio', lat: 44.6942, lng: 12.1839 },
      { name: 'Valli di Comacchio', lat: 44.6300, lng: 12.1300 },
      { name: 'Porto Garibaldi', lat: 44.6772, lng: 12.2372 },
      { name: 'Comacchio', lat: 44.6942, lng: 12.1839 },
    ],
  },

  // Mountain bike: only the rides that are an actual course. Bike-park and
  // shuttle days are laps, not routes, so they carry no GPX.
  'finale-ligure': {
    'NATO road & Rollercoaster': [
      { name: 'Finale Ligure', lat: 44.1697, lng: 8.3428 },
      { name: 'Feglino', lat: 44.21, lng: 8.33 },
      { name: 'Colle del Melogno', lat: 44.22, lng: 8.24 },
      { name: 'Le Manie', lat: 44.18, lng: 8.35 },
      { name: 'Finale Ligure', lat: 44.1697, lng: 8.3428 },
    ],
  },
  morzine: {
    'Portes du Soleil tour': [
      { name: 'Morzine', lat: 46.1794, lng: 6.71 },
      { name: 'Les Gets', lat: 46.16, lng: 6.66 },
      { name: 'Châtel', lat: 46.26, lng: 6.84 },
      { name: 'Avoriaz', lat: 46.19, lng: 6.77 },
      { name: 'Morzine', lat: 46.1794, lng: 6.71 },
    ],
  },
  houffalize: {
    'Ourthe valley trails': [
      { name: 'Houffalize', lat: 50.1306, lng: 5.7897 },
      { name: 'Nadrin', lat: 50.1503, lng: 5.6494 },
      { name: 'Achouffe', lat: 50.16, lng: 5.75 },
      { name: 'Houffalize', lat: 50.1306, lng: 5.7897 },
    ],
  },
  livigno: {
    'Valley floor path': [
      { name: 'Livigno', lat: 46.5378, lng: 10.1358 },
      { name: 'Lago di Livigno', lat: 46.57, lng: 10.13 },
      { name: 'Trepalle', lat: 46.49, lng: 10.14 },
      { name: 'Livigno', lat: 46.5378, lng: 10.1358 },
    ],
  },
  winterberg: {
    'Sauerland cross-country loop': [
      { name: 'Winterberg', lat: 51.1919, lng: 8.5342 },
      { name: 'Kahler Asten', lat: 51.18, lng: 8.49 },
      { name: 'Willingen', lat: 51.29, lng: 8.61 },
      { name: 'Winterberg', lat: 51.1919, lng: 8.5342 },
    ],
  },
};
