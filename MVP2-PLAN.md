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

## 4. Doorgeschoven uit MVP1 (afmaken)

- **Exacte Strava-segmenttijden**: Val.town-worker updaten met `/activity`
  endpoint (code staat klaar in `workers/valtown-strava.ts`), daarna de
  segment-matching valideren met echte data (Ventoux-case van Twan).
  Diagnose zit al in de sync-status.
- Sync-knop zichtbaarheid checken (vereist login + Strava-connectie).

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
| 4 | Strava-segmenttijden afmaken | Vereist Val.town-update van Twan |
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
