# Collect

A cycling climb tracker web app built with React, TypeScript, Vite, Tailwind CSS, and Firebase. Browse 10 iconic climbs from cycling history, mark them as conquered, and track your stats. Strava OAuth integration lets you connect your Strava account.

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
