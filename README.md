# Ridewild

A cycling adventure guide built with React, TypeScript, Vite, Tailwind CSS and
Firebase. Browse destinations, worked-out routes with GPX downloads, multi-day
bikepacking trips and events; keep a record of the climbs and places you have
ridden, and compare with friends via Strava.

## Performance is a requirement, not a nice-to-have

**Everything must be on screen within a second.** This is a standing rule for
this project and every project we build. The rules that follow from it, and the
mistake that produced them, are written up in
[BUILD-GUIDE.md §13](BUILD-GUIDE.md#13-prestatie-eis-voor-elk-project-hard).
The short version:

- Never look up at runtime what is already known at build time.
- Never chain dependent requests — run them in parallel and take the best.
- Only load what is in view; forty cards must not fire forty requests.
- Always show something immediately (gradient, skeleton, prerendered HTML).
- Cache what you fetch, with a version in the key so fixes invalidate it.
- `preconnect` to every external host you are certain to use.
- Lazy-load heavy libraries so the first paint never waits.
- Measure it in the Network tab or Lighthouse, don't go on feel.

## Local Development

```bash
npm install
cp .env.local.example .env.local
# Fill in your Firebase and Strava credentials in .env.local
npm run dev
```

Open http://localhost:5173.

## Firebase Setup

1. Create a Firebase project at https://console.firebase.google.com
2. Enable Firestore Database (start in test mode for dev)
3. Go to Project Settings → Your apps → Web app → SDK setup
4. Copy the config values into `.env.local`

The app falls back to seed data if Firebase is unavailable or the `climbs` collection is empty.

## Strava OAuth Setup

1. Create an app at https://www.strava.com/settings/api
2. Set the Authorization Callback Domain to `localhost` for local dev
3. Copy your Client ID and Client Secret into `.env.local`
4. Set `VITE_STRAVA_REDIRECT_URI=http://localhost:5173/strava-callback`

## Build

```bash
npm run build
```

Output goes to `dist/`.
