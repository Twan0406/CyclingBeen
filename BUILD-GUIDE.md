# Build-gids: zo is Collect (CyclingBeen) gebouwd

Een herbruikbaar draaiboek van alle technische stappen, keuzes en lessen uit
dit project. Bedoeld als template voor toekomstige apps en websites.

Live resultaat: https://cyclingbeen-28952.web.app
Repo: github.com/Twan0406/CyclingBeen (branch `claude/nice-cannon-l14vfr`)

---

## 1. De stack (en waarom)

| Laag | Keuze | Waarom |
|---|---|---|
| UI-framework | **React 19 + TypeScript** | Standaard, veel voorbeelden, typeveiligheid |
| Build-tool | **Vite 8** | Supersnelle dev-server en builds |
| Styling | **Tailwind CSS v4** (`@tailwindcss/vite`-plugin) | Geen aparte config nodig; alleen `@import "tailwindcss"` in CSS |
| Routing | **React Router v7** (`BrowserRouter`) | SPA met nette URL's |
| Kaart | **MapLibre GL v5** (globe-projectie) | Gratis 3D-wereldbol, geen API-key |
| Kaarttegels | **CARTO dark_all** raster tiles | Gratis, donker thema, geen key |
| Auth | **Firebase Authentication** (Google) | 2 klikken setup, gratis |
| Database | **Cloud Firestore** | Gratis tier, realtime, simpele rules |
| Hosting | **Firebase Hosting** | Gratis, CDN, koppelt aan zelfde project |
| CI/CD | **GitHub Actions** → Firebase | Elke push = automatische deploy |
| Externe API-proxy | **Val.town** (gratis HTTP val) | Houdt secrets serverside zonder creditcard |
| Foto's | **Wikipedia/Wikimedia API** (runtime) | Gratis rechtenvrije foto's, geen opslag |
| Icons | **lucide-react** | Lichte, consistente iconenset |

Kosten: **€0/maand** (alles gratis tiers). Enige potentiële kosten later:
Apple Developer (€99/j) voor een iOS-app.

## 2. Projectopzet (stap voor stap)

```bash
npm create vite@latest app -- --template react-ts
cd app
npm i tailwindcss @tailwindcss/vite react-router-dom lucide-react firebase maplibre-gl
```

- `vite.config.ts`: plugins `[react(), tailwindcss()]`.
- `src/index.css`: begint met `@import "tailwindcss";` (v4 heeft geen
  `tailwind.config.js` nodig).
- `tsconfig.app.json`: `"verbatimModuleSyntax": false` gezet — voorkomt
  gedoe met verplichte `import type` (les: linters/hooks kunnen imports
  terugdraaien; deze optie maakt het robuust).
- Mappenstructuur:
  ```
  src/
    components/   # Navbar, ClimbCard, ClimbMap (globe), ClimbPhoto, StatCard
    pages/        # Home, ClimbDetail, MyClimbs, Friends, StravaCallback
    context/      # AuthContext, ClimbsContext (globale state)
    hooks/        # useStrava, ...
    lib/          # strava.ts, stravaStore.ts, riders.ts, wikiPhoto.ts, polyline.ts
    data/         # climbs.ts (statische seed-data, 46 items)
    types/        # climb.ts (interfaces)
  workers/        # servercode voor Val.town (Strava-proxy)
  ```

## 3. Data-aanpak

- Content (klims) staat als **statische TypeScript-array** in
  `src/data/climbs.ts` — geen database nodig voor catalogus-data; instant
  laden, versiebeheer via git.
- Gebruikersdata (voortgang, tijden, vrienden) in **Firestore**:
  `users/{uid}` met `{ completed: string[], climbTimes: {...}, friends: [...] }`
  en een privé-subcollectie `users/{uid}/private/strava` voor tokens.
- Interfaces eerst definiëren (`types/climb.ts`); optionele velden
  (`proRecords?`) zodat niet elke entry alles hoeft te hebben.

## 4. Firebase-setup (door de eigenaar, via console)

1. Project aanmaken op console.firebase.google.com; web-app registreren →
   config-keys kopiëren.
2. Keys NOOIT hardcoden: via `import.meta.env.VITE_*` (lokaal `.env.local`,
   in CI als GitHub-secrets).
3. **Authentication** → provider Google enablen (+ support-e-mail kiezen).
4. **Firestore** → database aanmaken in **production mode** (niet test mode:
   verloopt na 30 dagen). Rules meteen goed zetten:
   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /users/{userId} {
         allow read: if request.auth != null;
         allow write: if request.auth != null && request.auth.uid == userId;
         match /private/{doc} {
           allow read, write: if request.auth != null && request.auth.uid == userId;
         }
       }
     }
   }
   ```
5. **Hosting** → Get started.

Belangrijke performance-les: **laad Firebase lazy** (dynamische
`import('firebase/…')` in een `getDb()`/`getAuthInstance()`-helper). Firebase
eager importeren maakte de bundle 985 KB; lazy + code-splitting bracht de
eerste load terug naar ~284 KB.

## 5. CI/CD: GitHub Actions → Firebase Hosting

`.github/workflows/deploy.yml`:
- Trigger: push op de werkbranch.
- Stappen: checkout → setup-node → `npm install` → `npm run build` (met
  `VITE_*`-secrets als env) → `FirebaseExtended/action-hosting-deploy@v0`
  met `FIREBASE_SERVICE_ACCOUNT`-secret (JSON uit Firebase console →
  Project Settings → Service accounts → Generate new private key).
- GitHub-secrets: alle `VITE_FIREBASE_*`, `VITE_STRAVA_CLIENT_ID`,
  `VITE_STRAVA_WORKER_URL`, `FIREBASE_SERVICE_ACCOUNT`.

`firebase.json` met cache-headers (les: zonder dit zagen gebruikers oude
versies na deploys):
```json
"headers": [
  { "source": "**/*.html", "headers": [{ "key": "Cache-Control", "value": "no-cache, no-store, must-revalidate" }] },
  { "source": "**/*.@(js|css)", "headers": [{ "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }] }
]
```
HTML nooit cachen; gehashte JS/CSS juist eeuwig (bestandsnaam verandert per
build). Plus SPA-rewrite: alles → `/index.html`.

## 6. Authenticatie & state

- `AuthContext`: `onAuthStateChanged` → user in React-context;
  `signInWithPopup(GoogleAuthProvider)`.
- `ClimbsContext`: seed-data + completed-set uit Firestore gemerged;
  ingelogd = account is de enige bron (bewuste keuze: géén localStorage
  voor uitgelogde gebruikers — voorkomt "spook-voortgang" na uitloggen).
- Niet-ingelogd + actie → automatisch login-prompt.

## 7. Externe API met secret (Strava) zonder eigen server

Probleem: OAuth-token-exchange vereist een Client Secret die nooit in
frontend-code mag staan.

Oplossing: **gratis serverless proxy op Val.town** (`workers/valtown-strava.ts`):
- Endpoints: `/exchange` (code→tokens), `/activities` (lijst ritten),
  `/activity` (segment efforts van één rit).
- Secrets als Val.town Environment Variables (`STRAVA_CLIENT_ID/SECRET`).
- CORS-headers op elke response (`Access-Control-Allow-Origin: *` + OPTIONS).
- Frontend praat alleen met de val-URL (`VITE_STRAVA_WORKER_URL`).
- Refresh-token per gebruiker in Firestore-privé-subcollectie; access-tokens
  worden nooit bewaard, telkens vers via refresh.

(Cloudflare Workers was plan A maar de deploy-knop weigerde; Val.town bleek
de snelste gratis route: code plakken → save → live URL.)

## 8. GPS-matching van activiteiten aan locaties

- Strava geeft per rit een **summary polyline** → decoderen met eigen
  polyline-decoder (`lib/polyline.ts`).
- Match: track passeert binnen 1,5 km van de top (haversine-afstand);
  quick-reject als de rit >120 km van de klim start.
- Aantal keren gereden = aantal matchende ritten; beste tijd bewaard.
- Verfijning: per matchende rit segment-efforts ophalen en het segment
  kiezen dat bij de top eindigt én qua lengte ±30% van de klimlengte is →
  echte klimtijd i.p.v. ritduur.

## 9. Gratis foto's zonder beheer

Runtime-resolver (`lib/wikiPhoto.ts`), met fallback-keten:
1. Wikipedia-API `pageimages` op artikelnaam (`origin=*` voor CORS)
2. Wikimedia Commons **geosearch** op lat/lng (straal 5 km, alleen JPEG)
3. CSS-gradient als placeholder

Resultaat gecached in localStorage → elke foto max 1× per browser opgehaald.
Les: raad nooit Commons-bestandsnamen; artikelnamen + geosearch zijn robuust.

## 10. 3D-globe

MapLibre GL v5 (v4 heeft geen globe): `map.setProjection({ type: 'globe' })`
+ `setSky(...)` voor atmosfeer. Raster tiles van CARTO. Markers als DOM-elementen
met CSS-klassen (gouden pulse voor 'veroverd'). Auto-rotatie via
`requestAnimationFrame` die stopt bij interactie. **Lazy-loaden** via
`React.lazy` zodat de zware chunk (1 MB) de eerste paint niet blokkeert.

## 11. Geleerde lessen (chronologisch opgedoken)

1. **Push-rechten**: GitHub-app moest eerst geïnstalleerd/geautoriseerd worden
   voor de repo; anders 403's.
2. **Cache**: altijd no-cache op HTML zetten; anders zien gebruikers oude
   versies ("het werkt nog niet") terwijl de deploy prima was.
3. **Safari Reader Mode** kan een app "kapot" doen lijken — check dit bij
   bugreports van gebruikers.
4. **Test mode Firestore vermijden** — production mode + expliciete rules.
5. **Secrets-discipline**: config-keys via env/secrets; echte secrets
   (Strava Client Secret, service account) alléén serverside/CI.
6. **Bundle bewaken**: lazy imports voor zware libs (kaart, Firebase);
   effect was 985 KB → 284 KB initial.
7. **Eén bron van waarheid voor gebruikersstate** (account óf lokaal, niet
   beide) voorkomt sync-bugs.
8. **Externe beeld-URL's altijd met fallback** (onError → placeholder).
9. **Sandbox-beperkingen**: de cloud-omgeving kan niet elke externe host
   bereiken; verifieer extern gedrag in de browser van de gebruiker of met
   diagnostiek in de app (bijv. sync-statusmeldingen).
10. **Diagnose inbouwen**: statusmeldingen in de UI ("segments read for X
    rides…") maken debuggen op afstand veel sneller dan gokken.
11. **Nooit stilzwijgend terugvallen.** Een `catch {}` die op een fallback
    uitkomt, verbergt de oorzaak: de gebruiker ziet alleen "het klopt niet",
    en jij kunt niets. Faal luid — meld *waarom* (verouderde server, rate
    limit, geen data gevonden). Dit kostte hier meerdere rondes debuggen.
12. **Houd drempels consistent tussen detectie en meting.** Een klim werd
    afgevinkt op 1500 m van de top, maar de tijdmeting zocht op 400 m. Gevolg:
    "veroverd" zonder tijd, met een stille terugval. Als twee stukken code
    dezelfde werkelijkheid beschrijven, moeten hun toleranties bij elkaar passen.
13. **Vergelijk nooit twee verschillende grootheden.** Een gemeten klimtijd en
    een hele-ritduur zijn niet uitwisselbaar; "houd de snelste" laat dan de
    verkeerde winnen. Label de soort en vergelijk alleen gelijksoortige waarden.
14. **Test algoritmes met gesimuleerde data.** Voor de klimtijd-berekening is
    een synthetische rit gegenereerd (vlak stuk → klim → afdaling, plus
    hill repeats) en met `esbuild --bundle --define:import.meta.env='{}'`
    in Node getest. Dat gaf exacte verificatie zonder echte Strava-data —
    onmisbaar als je zelf niet bij de productieomgeving kunt.
15. **Maak proxies generiek.** De eerste Strava-proxy had één endpoint per
    functie, dus elke uitbreiding vroeg om handmatig code plakken door de
    eigenaar. Eén generieke read-only doorgeefroute (met padvalidatie) plus
    een `/version`-marker maakt de client vrij om te evolueren.

## 12. Herbruikbaar recept voor een volgende app

1. Vite + React + TS + Tailwind v4 scaffold (§2)
2. Types + statische seed-data voor catalogus-content (§3)
3. Firebase project: Auth (Google) + Firestore production-rules (§4)
4. GitHub Actions deploy + cache-headers (§5)
5. Auth- en data-context met lazy Firebase (§6)
6. Externe API's met secrets → gratis Val.town-proxy (§7)
7. Zware features (kaarten e.d.) lazy-loaden (§10)
8. Diagnostiek en fallbacks vanaf dag één (§11)
