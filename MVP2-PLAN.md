# Collect — MVP2 Plan

Status MVP1 (live op https://cyclingbeen-28952.web.app):
3D-globe, 46 Europese klims met foto's/historie/pro-records, Google-login,
Strava-koppeling met GPS-matching, vrienden + ranglijst + head-to-head.

Richting-besluit: **MVP2 blijft wielrennen-only.** Multi-sport (trailrunning,
marathons, triatlons) is expliciet doorgeschoven naar MVP3. Het datamodel wordt
in MVP2 wel voorbereid: elk achievement krijgt een `sport`-veld (default
`cycling`), zodat uitbreiden later een toevoeging is en geen verbouwing.

---

## 1. Klimmen over de hele wereld 🌍 (must-have)

Nu alleen Europa; de globe schreeuwt om wereldwijde dekking.

- Uitbreiden naar ~100 klims met dezelfde toelatingscriteria als nu
  (Grand Tour HC/cat-1, summit finish, of iconische status — plus voor
  buiten Europa: nationale iconen en recordklims).
- Kandidaten:
  - **Noord-Amerika:** Mount Washington, Haleakala (Hawaï, langste klim ter
    wereld), Mauna Kea, Mount Evans, Pikes Peak, Alpe de Grand Blanc? nee —
    Mt. Baldy & Gibraltar Road (Tour of California), Mont-Mégantic (Canada).
  - **Zuid-Amerika:** Alto de Letras (Colombia, 80 km!), Alto El Vino,
    La Línea (Colombia), Paso Internacional Los Libertadores (Chili/Argentinië).
  - **Azië:** Khardung La & Tanglang La (India, Himalaya), Doi Inthanon
    (Thailand), Mt. Fuji Subaru Line (Japan), Norikura (Japan, hoogste weg
    van Japan), Genting Highlands (Maleisië, Tour de Langkawi).
  - **Afrika:** Chapman's Peak + Suikerbossie (Kaapstad, Cape Town Cycle Tour).
  - **Oceanië:** Mt. Wellington (Tasmanië), Arthurs Seat (Melbourne),
    Crown Range (NZ), Coronet Peak (NZ).
- UI-werk: globe-startpositie/zoom wereldwijd laten voelen; filter of
  werelddeel-tabs (Europa / Amerika / Azië / Afrika / Oceanië) op Explore.
- Data blijft in `src/data/climbs.ts`; foto's via bestaande Wikipedia/Commons
  runtime-resolver (werkt wereldwijd).

## 2. Verzoekjes voor beklimmingen 🗳️ (must-have)

Gebruikers kunnen klims aanvragen; populaire verzoeken worden toegevoegd.

- Nieuwe Firestore-collectie `climbRequests`:
  `{ name, country, region?, notes?, createdBy, upvotes: [uid], createdAt }`.
- UI: "Request a climb"-knop op Explore (alleen ingelogd) → klein formulier.
- Requests-pagina of sectie: lijst gesorteerd op aantal upvotes; ingelogde
  gebruikers kunnen éénmaal upvoten (uid in array).
- Dubbele detectie: bij intypen suggesties tonen van bestaande klims +
  bestaande verzoeken ("Bedoel je …? → upvote die").
- Drempel: bij ≥ N upvotes (start: 5) krijgt het verzoek de status
  "In review" — toevoegen blijft handwerk (kwaliteit van verhaal/data), maar
  het bord maakt de pijplijn zichtbaar.
- Firestore-rules: iedereen ingelogd mag lezen; maker mag aanmaken;
  upvote = alleen eigen uid toevoegen/verwijderen (rule met
  `arrayUnion`-check of subcollectie `votes/{uid}`).

## 3. Inspiratie & trip-planning 🗺️ (must-have)

De app moet helpen dromen en plannen: "wat rijd ik nog meer in die regio?"

- **"Nearby climbs"** op elke detailpagina: andere klims uit de database
  binnen ~75 km (haversine op bestaande lat/lng — geen externe API nodig),
  met afstand ("Col du Glandon · 12 km hiervandaan").
- **Regio-pagina's / trip-gidsen**: klims gegroepeerd per regio (Alpen,
  Pyreneeën, Dolomieten, Mallorca, …) met een korte redactionele intro
  ("Basis in Bourg d'Oisans: Alpe d'Huez, Galibier en Croix de Fer binnen
  één weekend"), beste seizoen, en de klims op een mini-kaart.
- **"Plan je trip"-veld per klim**: beste maanden (passen zijn 's winters
  dicht!), startplaats, en een externe link naar de route op een kaart.
- **Bucket-list-modus op de globe**: toggle die alleen je bucket list toont —
  je "droomkaart".
- Nice-to-have: deelbare trip ("selecteer 5 klims → deel als lijstje").

## 4. Doorgeschoven uit MVP1 — ✅ AFGEROND (juli 2026)

- **Exacte klimtijden**: werkend en bevestigd met echte data. Aanpak is
  gewijzigd t.o.v. het oorspronkelijke plan: niet via Strava-segmenten
  (te fragiel — segmentnamen/-grenzen verschillen per klim), maar door de
  klimtijd **zelf te meten** uit de GPS-, hoogte- en tijdstromen van de rit
  (`ascentSeconds()` in `src/lib/strava.ts`). Herhalingen van dezelfde klim
  binnen één rit worden apart geteld.
- **Val.town-worker is nu v2** met een generieke read-only Strava-proxy
  (`/api`) plus een `/version`-marker. Toekomstige Strava-uitbreidingen
  vereisen daardoor **geen** nieuwe worker-code meer — alles kan app-zijdig.

## 5. Kleinere interactiviteits-ideeën (nice-to-have, op volgorde)

1. **Badges/mijlpalen**: "Eerste HC", "5 landen", "Alle Dolomieten", etc.
   Puur client-side afleidbaar uit completed-lijst — goedkoop te bouwen.
2. **Uitnodigingslink**: deelbare URL ("Vergelijk je met mij op Collect").
3. **Activiteitenfeed op Friends**: "Twan veroverde Mont Ventoux 🏔️".
4. **Jaaroverzicht**: jouw klim-jaar in cijfers.

## Voorgestelde bouwvolgorde

| Fase | Inhoud | Waarom eerst |
|---|---|---|
| 1 | Wereldwijde klims + werelddeel-filter | Grootste zichtbare sprong, alleen data + kleine UI |
| 2 | Nearby climbs + regio-gidsen | Bouwt op de nieuwe data, geen backend nodig |
| 3 | Climb requests + upvotes | Nieuwe Firestore-collectie + rules |
| ~~4~~ | ~~Exacte klimtijden~~ | ✅ afgerond juli 2026 |
| 5 | Badges → invite-link → feed | Losse toetjes |

## Technische notities voor de volgende sessie

- Branch: `claude/nice-cannon-l14vfr`; elke push deployt automatisch via
  GitHub Actions naar Firebase Hosting.
- `Climb`-type uitbreiden: `continent`, `bestMonths?`, `startTown?`,
  `sport: 'cycling'` (default, t.b.v. MVP3 multi-sport).
- Requests: nieuwe pagina `/requests` + navlink, of sectie onder Explore.
- Firestore-rules moeten worden bijgewerkt (climbRequests) — Twan moet die
  publishen in de Firebase-console (zoals eerder gedaan).

---

## Strategie: één platform, geen losse apps per sport

Besluit (juli 2026): we bouwen **één merk en één app** met sport-"werelden"
(verticals), géén aparte apps per sport.

Redenen:
1. **Kosten vermenigvuldigen bij losse apps** — hosting, auth, Strava-koppeling,
   bugfixes en updates ×N, terwijl ~80% van de functionaliteit gedeeld is
   (kaart, account, vrienden, ranglijsten).
2. **Marketing is de bottleneck, niet techniek** — één merk laten groeien is al
   moeilijk; meerdere merken tegelijk is voor een klein team onhaalbaar.
3. **Netwerk-effect blijft intact** — endurance-sporters overlappen sterk
   (triatleten fietsen én lopen). Eén app laat vriendengroepen elkaar
   versterken; losse apps splitsen ze op.
4. **Marktbewijs** — Strava, Komoot en AllTrails zijn allemaal één app met
   meerdere activiteiten.

Vorm: bij openen kies je je sport-wereld (🚴 klimmen · 🏃 trails · 🏊 triatlon),
elk met eigen kaart/prestaties/ranglijsten, maar gedeeld account, vrienden en
Strava. Technisch voorbereid via het `sport`-veld in het datamodel. Optie voor
later: dezelfde codebase kan meerdere "gezichten"/brandings krijgen als dat
ooit tactisch nut heeft.

## Naamgeving (verkenning)

Huidige werknaam "CyclingBeen" (afgeleid van de Been-app) vervangen.
Denkrichting: **koepelmerk + sport-vertical**.

- Koepel (breed, MVP3+): **Collect** (staat al in de app!), Conquered,
  Tally, Atlas, Feats.
- Fiets-vertical (MVP2): **Cols** ("Collect · Cols"), Col Collector,
  ColQuest, Grimpeur, HC (hors catégorie).
- Aanbeveling: app-koepel **Collect** houden; de fietswereld intern
  **Cols** noemen. Domeincheck + merkcheck nog doen vóór publiciteit.

## Businesscase (eerste schets)

1. **Advertenties** — mogelijk, maar terughoudend: doelgroep is premium en
   banner-ads maken het product goedkoop. Beter passend: gerichte
   partnerships/affiliate (fietsverhuur op Mallorca, hotels bij iconische
   cols, gran fondo's, kleding) op de plekken waar de gebruiker tóch aan het
   plannen is (regio-gidsen, detailpagina's).
2. **Freemium-abonnement** — gratis: tracken, globe, vrienden, basisdata.
   Premium-ideeën: trip-gidsen & routeplanning, exacte segmenttijden en
   statistieken, jaaroverzicht, badges, onbeperkt vergelijken, vroege toegang
   tot nieuwe werelddelen/sporten.
3. Volgorde: eerst gebruikers en retentie bewijzen (MVP2), monetisatie pas
   daarna serieus aanzetten.

---

## iOS-app (native) — aanpak & plaats in de planning

Doel: een echte iOS-app in de App Store, zonder de webapp te herschrijven.

### Gekozen route: Capacitor
De app is een React/Vite-webapp; **Capacitor** verpakt exact die codebase in
een native iOS- (en Android-)schil. ~100% code-hergebruik, één codebase blijft
web + mobiel bedienen. MapLibre-globe en Firebase werken binnen de Capacitor
WebView. Alternatieven (React Native = UI herschrijven; native Swift = alles
herschrijven) vallen af: te veel werk voor te weinig extra waarde nu.

### Plaats in de planning
**Laatste fase van MVP2**, ná de webfeatures (wereldwijde klims, requests,
inspiratie). Het is een op zichzelf staand "verpak- en publiceer"-project met
App Store-overhead die losstaat van de productfeatures.

### Wat ervoor nodig is (van Twan)
- **Mac met Xcode** (verplicht om iOS te builden/submitten).
- **Apple Developer Program**: €99/jaar.
- Beslissing over app-naam/branding (zie naamgeving-sectie).

### Technische werklijst
1. Capacitor toevoegen (`@capacitor/core`, `@capacitor/ios`), `npx cap add ios`,
   web build → `npx cap sync`.
2. **Auth in native context**: `signInWithPopup` werkt niet in een WebView.
   Overstappen op `@capacitor-firebase/authentication` (native Google Sign-In)
   of redirect-flow met deep links.
3. **Sign in with Apple toevoegen** — Apple-richtlijn 4.8 vereist dit zodra je
   Google-login aanbiedt. Firebase Auth ondersteunt Apple als provider.
4. **Strava OAuth via deep link**: in-app browser (`@capacitor/browser`) openen,
   callback terug via custom URL-scheme / universal link i.p.v. web-redirect.
   Val.town-worker blijft ongewijzigd bruikbaar.
5. **Assets**: app-icoon, splash screen, screenshots voor de store.
6. **Privacybeleid** (verplicht) + App Privacy-vragenlijst (data: account,
   locatie/GPS via Strava, e-mail).
7. App Store Connect: app aanmaken, TestFlight voor bèta met vrienden, daarna
   review indienen.

### Tussenstap zonder App Store (optioneel, bijna gratis)
De site nu al als **PWA** installeerbaar maken ("Voeg toe aan beginscherm"):
web-app-manifest + icoon + basic service worker. Geeft een app-achtige ervaring
(eigen icoon, fullscreen) zonder Apple-account of review. Goede manier om het
"app-gevoel" te testen bij vrienden vóór de echte native build. iOS-notificaties
voor home-screen-PWA's kunnen sinds iOS 16.4, maar blijven beperkter dan native.

### Aanbevolen volgorde binnen MVP2
Web-features eerst → dan PWA-manifest als quick win → dan Capacitor + Sign in
with Apple + Strava deep-link → TestFlight → App Store.

---

## 6. Zoom-gebaseerde ontdekking & de inspiratie-markt 🔍 (toegevoegd juli 2026)

Idee (Twan): op wereldniveau toont de globe alleen de bekendste beklimmingen,
maar wie inzoomt op een land of gebied ziet er veel méér. Zo wordt de app een
inspiratietool om fietstrips te bedenken en plannen — een tweede markt naast
"prestaties afvinken": de **fietsvakantie-planner**.

### Waarom dit sterk is
- Lost de spanning op tussen "cureerbare collectie" (klein, iconisch) en
  "rijke planningsdata" (groot): beide bestaan naast elkaar via zoom.
- De planningscontext is exact de plek waar de businesscase zit
  (partnerships/affiliate: hotels, fietsverhuur, gran fondo's) — inspiratie
  trekt bezoekers die nog niks afvinken maar wél plannen.
- Nieuwe doelgroep: recreatieve fietsers die (nog) geen "collectors" zijn;
  funnel: inspiratie zoeken → account maken → bucket list → collector worden.

### Technische aanpak: tiers + zoom
- `Climb`-type uitbreiden met `tier: 1 | 2 | 3`:
  - **Tier 1 (~50-100):** de iconen — altijd zichtbaar, volledige content
    (verhaal, historie, pro-records). Dit is de huidige lijst.
  - **Tier 2 (honderden):** bekende regionale klims — zichtbaar vanaf
    land-zoom (~zoomniveau 6+), compacte data (naam, stats, foto).
  - **Tier 3 (optioneel later):** lokale klims — zichtbaar op regio-zoom.
- Globe: markers filteren op `map.getZoom()` (zoom-listener), tier 1 groot,
  tier 2 kleiner/subtieler. Clustering overwegen bij dichte gebieden
  (Alpen!) — maplibre ondersteunt GeoJSON-source met cluster-optie.
- Alles blijft afvinkbaar/Strava-matchbaar — tiers zijn presentatie, geen
  aparte datamodellen.

### Data-sourcing voor tier 2 (het echte werk)
- Start gecureerd per topregio (Alpen, Pyreneeën, Dolomieten, Mallorca,
  Ardennen/Limburg): ~20-40 klims per regio met compacte entries.
- Verzoekjes-systeem (sectie 2) voedt tier 2: aangevraagde klims kunnen als
  tier 2 binnenkomen (lagere content-eis dan tier 1).
- Later evt. open datasets als bron ter inspiratie voor de redactie
  (zelf cureren blijft het kwaliteitskenmerk t.o.v. "alles-databases"
  zoals climbfinder — wij zijn de michelin-gids, niet het telefoonboek).

### Koppeling met bestaande MVP2-punten
- Versterkt sectie 3 (nearby climbs / regio-gidsen): tier 2 levert de
  "wat is hier nog meer"-inhoud.
- Werelddeel-filters (sectie 1) + zoom-tiers = samen de ontdek-ervaring.
- Naamgeving: werktitel **"MyCols"** genoemd door Twan — toevoegen aan de
  kandidatenlijst (persoonlijk, domeinvriendelijk; check mycols.app/.cc).

### Plaats in bouwvolgorde
Invoegen als onderdeel van fase 1-2: eerst tier-veld + zoom-filtering op de
bestaande 49 (goedkoop), daarna tier 2-data per regio incrementeel toevoegen
(elke regio is een los, deploybaar blokje werk).
